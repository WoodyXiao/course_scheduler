import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

// Define color schemes for different departments (constant)
// Avoiding red (AND nodes) and green (OR nodes) colors
const departmentColors = {
  'CMPT': { from: '#0284C7', to: '#0EA5E9', name: 'Computing Science' },  // Sky Blue
  'MATH': { from: '#F97316', to: '#FB923C', name: 'Mathematics' },        // Orange (unified with MACM)
  'MACM': { from: '#F97316', to: '#FB923C', name: 'Applied Math' },       // Orange (unified with MATH)
  'STAT': { from: '#0891B2', to: '#06B6D4', name: 'Statistics' },         // Cyan
  'PHYS': { from: '#F59E0B', to: '#FBBF24', name: 'Physics' },            // Amber/Yellow
  'CHEM': { from: '#EA580C', to: '#F97316', name: 'Chemistry' },          // Deep Orange
  'BIOL': { from: '#0D9488', to: '#14B8A6', name: 'Biology' },            // Teal
  'ECON': { from: '#CA8A04', to: '#EAB308', name: 'Economics' },          // Yellow
  'PSYC': { from: '#9333EA', to: '#C084FC', name: 'Psychology' },         // Purple/Violet
  'ENGL': { from: '#06B6D4', to: '#22D3EE', name: 'English' },            // Cyan
  'HIST': { from: '#92400E', to: '#B45309', name: 'History' },            // Brown
  'PHIL': { from: '#4338CA', to: '#6366F1', name: 'Philosophy' },         // Indigo
  'BUS': { from: '#DB2777', to: '#EC4899', name: 'Business' },            // Pink
  'BPK': { from: '#059669', to: '#10B981', name: 'Biomedical Physiology' }, // Emerald Green
  'ENSC': { from: '#4F46E5', to: '#7C3AED', name: 'Engineering Science' }, // Indigo/Purple
};

function TreeView({ data, allCourses, onLoadPrerequisites }) {
  const svgRef = useRef();
  const [treeData, setTreeData] = useState(() => d3.hierarchy(data));
  const [updateCounter, setUpdateCounter] = useState(0);
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightedNodes, setHighlightedNodes] = useState(new Set());
  const [draggedNode, setDraggedNode] = useState(null);
  const [nodePositions, setNodePositions] = useState({}); // Store custom positions
  const [activeDepartments, setActiveDepartments] = useState([]); // Track departments in current tree
  const [treeDepth, setTreeDepth] = useState(0); // Track maximum depth of the tree
  const zoomTransformRef = useRef(null); // Store zoom transform state
  const [loadingNodes, setLoadingNodes] = useState(new Set()); // Track which nodes are loading prerequisites
  const [loadedNodes, setLoadedNodes] = useState(new Set()); // Track which nodes have already loaded
  
  // Plan Mode states
  const [planMode, setPlanMode] = useState(false); // Whether in Plan mode
  const [checkedNodes, setCheckedNodes] = useState(new Set()); // Checked node IDs

  useEffect(() => {
    // This effect runs when `data` prop changes.
    if (data && !data.loading) {
    setTreeData(d3.hierarchy(data));  // Recreate the hierarchy with the new data
    } else {
      setTreeData(null);  // Clear tree data for loading or null states
    }
    
    // Clear previous node positions and zoom when switching to a new course
    setNodePositions({});
    zoomTransformRef.current = null;
    // Reset plan mode states when switching courses
    setPlanMode(false);
    setCheckedNodes(new Set());
    // Reset lazy loading tracking
    setLoadingNodes(new Set());
    setLoadedNodes(new Set());
  }, [data]);

  // Helper function: Check if a node is a unit requirement (not a course)
  const isUnitRequirement = useCallback((nodeName) => {
    if (!nodeName) return false;
    // Match patterns like "12 units", "60 units", "completion of 60 units"
    return /^\d+\s*units?$/i.test(nodeName.trim()) || 
           /^completion of \d+\s*units?$/i.test(nodeName.trim());
  }, []);

  // Calculate if a node's prerequisites are satisfied based on checked nodes
  // Find all nodes with the same course name (for Plan Mode highlighting)
  const findNodesWithSameName = useCallback((courseName) => {
    if (!treeData || !courseName) return [];
    
    const matchingNodes = [];
    const traverse = (node) => {
      // Only match course nodes (not AND/OR nodes), and ignore unit requirements
      if (node.data.name === courseName && 
          !node.data.condition && 
          !isUnitRequirement(node.data.name)) {
        matchingNodes.push(node);
      }
      
      if (node.children) {
        node.children.forEach(child => traverse(child));
      }
      if (node._children) {
        node._children.forEach(child => traverse(child));
      }
    };
    
    traverse(treeData);
    return matchingNodes;
  }, [treeData, isUnitRequirement]);

  const isNodeSatisfied = useCallback((node) => {
    if (!planMode) return true; // In normal mode, all nodes are satisfied
    
    // If this node is directly checked, it's satisfied
    if (checkedNodes.has(node.data.uniqueId)) {
      return true;
    }
    
    // For course nodes (not logic nodes), only consider them satisfied if directly checked
    // This prevents cascading satisfaction through prerequisite chains
    if (!node.data.condition || (node.data.condition !== "AND" && node.data.condition !== "OR")) {
      // This is a course node - it's only satisfied if explicitly checked
      return false;
    }
    
    // For logic nodes (AND/OR), check children
    // Get all children (both visible and collapsed)
    const allChildren = node.children || node._children;
    
    // If logic node has no children, it's not satisfied
    if (!allChildren || allChildren.length === 0) {
      return false;
    }
    
    if (node.data.condition === "AND") {
      // AND: All children must be satisfied
      return allChildren.every(child => isNodeSatisfied(child));
    } else if (node.data.condition === "OR") {
      // OR: At least one child must be satisfied
      return allChildren.some(child => isNodeSatisfied(child));
    }
    
    return false;
  }, [planMode, checkedNodes]);

  // Check if a node's prerequisites (children) are satisfied, allowing it to be checked
  const canCheckNode = useCallback((node) => {
    if (!planMode) return true; // In normal mode, can always check
    
    // If node has no children (no prerequisites), can always check
    if (!node.children || node.children.length === 0) {
      // But also check _children (collapsed prerequisites)
      if (!node._children || node._children.length === 0) {
        return true;
      }
      // If has collapsed children, need to check them
      // Treat as AND by default for course nodes
      return node._children.every(child => isNodeSatisfied(child));
    }
    
    // For logic nodes (AND/OR), this shouldn't be called as they don't have checkboxes
    // For course nodes with visible children, check if prerequisites are met
    if (node.data.condition === "AND") {
      // AND: All children must be satisfied
      return node.children.every(child => isNodeSatisfied(child));
    } else if (node.data.condition === "OR") {
      // OR: At least one child must be satisfied
      return node.children.some(child => isNodeSatisfied(child));
    }
    
    // For course nodes with children, treat as AND by default
    return node.children.every(child => isNodeSatisfied(child));
  }, [planMode, isNodeSatisfied]);

  const toggleChildren = useCallback(async (nodeData) => {
    console.log(`🔄 [Toggle] Toggle called for ${nodeData.name}`);
    console.log(`🔄 [Toggle] Node data:`, nodeData);
    console.log(`🔄 [Toggle] Has children:`, !!nodeData.children);
    console.log(`🔄 [Toggle] Children length:`, nodeData.children ? nodeData.children.length : 0);
    console.log(`🔄 [Toggle] Has _children:`, !!nodeData._children);
    console.log(`🔄 [Toggle] Has prerequisites:`, !!nodeData.hasPrerequisites);
    console.log(`🔄 [Toggle] Is loaded:`, loadedNodes.has(nodeData.uniqueId));
    console.log(`🔄 [Toggle] All courses available:`, !!allCourses);
    console.log(`🔄 [Toggle] OnLoadPrerequisites available:`, !!onLoadPrerequisites);
    
    // 检查是否是课程节点且第一次展开且有前置课程需要加载
    const isFirstExpand = (!nodeData.children || nodeData.children.length === 0) && 
                          !nodeData._children && 
                          nodeData.hasPrerequisites && 
                          !loadedNodes.has(nodeData.uniqueId);
    
    console.log(`🔄 [Toggle] Is first expand:`, isFirstExpand);
    
    if (isFirstExpand && allCourses && onLoadPrerequisites) {
      console.log(`🔄 [Lazy Load] First expand of ${nodeData.name}, loading prerequisites...`);
      
      // 标记为加载中
      setLoadingNodes(prev => new Set(prev).add(nodeData.uniqueId));
      
      try {
        // 调用 AI 解析前置课程
        const parsedPrereq = await onLoadPrerequisites(
          nodeData.prerequisiteText,
          allCourses,
          nodeData.name
        );
        
        console.log(`✅ [Lazy Load] Loaded prerequisites for ${nodeData.name}`);
        console.log(`🔍 [Debug] Parsed result:`, parsedPrereq);
        console.log(`🔍 [Debug] Has children:`, !!parsedPrereq.children);
        console.log(`🔍 [Debug] Children length:`, parsedPrereq.children ? parsedPrereq.children.length : 0);
        console.log(`🔍 [Debug] Parsed result name:`, parsedPrereq.name);
        console.log(`🔍 [Debug] Parsed result condition:`, parsedPrereq.condition);
        
        // 标记为已加载
        setLoadedNodes(prev => new Set(prev).add(nodeData.uniqueId));
        
        // 将解析结果插入到节点的 children
        if (parsedPrereq && parsedPrereq.children && parsedPrereq.children.length > 0) {
          // 找到节点并添加 children
          function findAndAddChildren(node) {
            if (node.data === nodeData) {
              // 恢复使用 children[0]，因为 AI 结果被包装在正确的结构中
              const childrenData = parsedPrereq.children[0];
              
              if (childrenData) {
                // 递归创建 D3 hierarchy 节点
                const createHierarchy = (dataNode, parentNode) => {
                  const uniqueId = `${parentNode.data.uniqueId || 'root'}-${dataNode.name}-${Math.random()}`;
                  console.log(`🔍 [CreateHierarchy] Creating node:`, dataNode.name, 'condition:', dataNode.condition);
                  const newNode = d3.hierarchy({
                    ...dataNode,
                    uniqueId: uniqueId,
                    hasPrerequisites: dataNode.hasPrerequisites,
                    prerequisiteText: dataNode.prerequisiteText
                  });
                  newNode.parent = parentNode;
                  newNode.depth = parentNode.depth + 1;
                  
                  // 递归处理子节点
                  if (dataNode.children && dataNode.children.length > 0) {
                    newNode.children = dataNode.children.map(child => createHierarchy(child, newNode));
                  }
                  
                  return newNode;
                };
                
                // 将整个 childrenData（如 OR 节点）作为一个子节点添加到当前节点
                const newChild = createHierarchy(childrenData, node);
                
                // 设置为展开状态，自动显示加载的子节点
                node.children = [newChild];
                node._children = null;
              }
              
              return true;
            }
            
            if (node.children) {
              for (let child of node.children) {
                if (findAndAddChildren(child)) return true;
              }
            }
            
            if (node._children) {
              for (let child of node._children) {
                if (findAndAddChildren(child)) return true;
              }
            }
            
            return false;
          }
          
          findAndAddChildren(treeData);
          
          // 重新计算整个树的布局
          console.log(`🔄 [Layout] Recalculating tree layout after adding children to ${nodeData.name}`);
          
          // 重新计算树布局
          const margin = { top: 40, right: 120, bottom: 40, left: 120 };
          const width = 1200 - margin.right - margin.left;
          const height = 1000 - margin.top - margin.bottom;
          const treeLayout = d3.tree()
            .size([width, height])
            .separation((a, b) => {
              // 增加兄弟节点之间的间距
              return (a.parent === b.parent ? 1.5 : 2) / a.depth;
            });
          treeLayout(treeData);
          
          // 重新设置 treeData 以触发重新渲染
          // 使用 updateCounter 来触发重新渲染，而不是尝试深拷贝 D3 节点对象
          setUpdateCounter(prev => prev + 1);
        }
        
      } catch (error) {
        console.error(`❌ [Lazy Load] Failed to load prerequisites for ${nodeData.name}:`, error);
      } finally {
        // 移除加载中状态
        setLoadingNodes(prev => {
          const newSet = new Set(prev);
          newSet.delete(nodeData.uniqueId);
          return newSet;
        });
      }
    } else {
      // 普通的展开/收起逻辑（已经加载过的节点）
      function findAndToggle(node) {
        if (node.data === nodeData) {
    if (node.children) {
      node._children = node.children;
      node.children = null;
        } else if (node._children) {
      node.children = node._children;
      node._children = null;
    }
        return true;
      }
      
      if (node.children) {
        for (let child of node.children) {
          if (findAndToggle(child)) return true;
        }
      }
      
      if (node._children) {
        for (let child of node._children) {
          if (findAndToggle(child)) return true;
        }
      }
      
      return false;
    }
    
    findAndToggle(treeData);
  }
    
    // Trigger re-render by updating the counter
    setUpdateCounter(prev => prev + 1);
  }, [treeData, allCourses, onLoadPrerequisites, loadedNodes]);

  const highlightPath = useCallback((node) => {
    const path = new Set();
    let current = node;
    
    // Add all ancestors
    while (current.parent) {
      path.add(current.parent.data.name);
      current = current.parent;
    }
    
    // Add all descendants
    const addDescendants = (n) => {
      if (n.children) {
        n.children.forEach(child => {
          path.add(child.data.name);
          addDescendants(child);
        });
      }
    };
    addDescendants(node);
    
    setHighlightedNodes(path);
  }, []);

  const clearHighlight = useCallback(() => {
    setHighlightedNodes(new Set());
  }, []);

  const resetNodePositions = useCallback(() => {
    setNodePositions({});
    zoomTransformRef.current = null; // Reset zoom as well
    setUpdateCounter(prev => prev + 1);
  }, []);

  const togglePlanMode = useCallback(() => {
    setPlanMode(prev => {
      const newMode = !prev;
      if (!newMode) {
        // Exiting plan mode, clear checked nodes
        setCheckedNodes(new Set());
      }
      return newMode;
    });
  }, []);

  // Find all nodes that depend on a given node (for cascading uncheck)
  const findDependentNodes = useCallback((targetNode, currentNode = treeData) => {
    const dependents = [];
    
    // Helper function to check if a node depends on the target
    const dependsOn = (node, target) => {
      if (!node) return false;
      
      // Get all children (visible and collapsed)
      const allChildren = node.children || node._children;
      if (!allChildren || allChildren.length === 0) return false;
      
      // Check if target is a direct child
      for (const child of allChildren) {
        if (child.data.uniqueId === target.data.uniqueId) {
          return true;
        }
        // Recursively check descendants
        if (dependsOn(child, target)) {
          return true;
        }
      }
      return false;
    };
    
    // Traverse the tree to find all nodes that depend on targetNode
    const traverse = (node) => {
      if (!node) return;
      
      // If this is a course node (not logic node) and it depends on target
      if ((!node.data.condition || (node.data.condition !== "AND" && node.data.condition !== "OR")) &&
          node.data.uniqueId !== targetNode.data.uniqueId &&
          dependsOn(node, targetNode)) {
        dependents.push(node.data.uniqueId);
      }
      
      // Traverse children
      const allChildren = node.children || node._children;
      if (allChildren) {
        allChildren.forEach(child => traverse(child));
      }
    };
    
    traverse(currentNode);
    return dependents;
  }, [treeData]);

  const handleCheckboxChange = useCallback((node, isChecked) => {
    // If trying to check (not uncheck), verify prerequisites are met
    if (isChecked && !canCheckNode(node)) {
      // Show alert to user
      alert(`Cannot check ${node.data.name}!\n\nPrerequisites not satisfied. Please complete the required prerequisite courses first.`);
      return;
    }
    
    setCheckedNodes(prev => {
      const newSet = new Set(prev);
      
      if (isChecked) {
        // Check this node
        newSet.add(node.data.uniqueId);
        
        // Also check all other nodes with the same course name
        if (node.data.name && !node.data.condition && !isUnitRequirement(node.data.name)) {
          const sameNameNodes = findNodesWithSameName(node.data.name);
          sameNameNodes.forEach(n => {
            if (canCheckNode(n)) {
              newSet.add(n.data.uniqueId);
            }
          });
        }
      } else {
        // Unchecking: remove this node and all dependent nodes
        newSet.delete(node.data.uniqueId);
        
        // Also uncheck all other nodes with the same course name
        if (node.data.name && !node.data.condition && !isUnitRequirement(node.data.name)) {
          const sameNameNodes = findNodesWithSameName(node.data.name);
          sameNameNodes.forEach(n => {
            newSet.delete(n.data.uniqueId);
          });
        }
        
        // Find and uncheck all nodes that depend on this one
        const dependents = findDependentNodes(node);
        dependents.forEach(depId => newSet.delete(depId));
      }
      return newSet;
    });
  }, [canCheckNode, findDependentNodes, findNodesWithSameName, isUnitRequirement]);

  const captureScreenshot = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Get the SVG as a string
    const svgData = new XMLSerializer().serializeToString(svg);
    
    // Create a canvas with extra height to avoid cutting off text
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size - increased height to 1200 to accommodate all content
    canvas.width = 1200;
    canvas.height = 1200;
    
    // Create an image from SVG
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      // Draw white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the SVG image (scale to fit if needed)
      ctx.drawImage(img, 0, 0, 1200, 1000);
      
      // Convert canvas to blob and download directly
      canvas.toBlob((blob) => {
        // Create download URL
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `course-tree-${new Date().getTime()}.png`;
        link.href = downloadUrl;
        
        // Append to body, click, and remove (ensures compatibility)
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up URLs after a short delay
        setTimeout(() => {
          URL.revokeObjectURL(url);
          URL.revokeObjectURL(downloadUrl);
        }, 100);
      }, 'image/png', 1.0); // Max quality
    };
    
    img.onerror = (error) => {
      console.error('Error capturing screenshot:', error);
      alert('Failed to capture screenshot. Please try again.');
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  }, []);

  // Function to extract department code from course name
  const extractDepartment = useCallback((courseName) => {
    if (!courseName) return null;
    // Extract the first word (department code) from course name
    // E.g., "CMPT 120 D100" -> "CMPT", "MATH 100 D100" -> "MATH"
    const match = courseName.match(/^([A-Z]+)/);
    return match ? match[1] : null;
  }, []);

  // Check if a node is a text-only requirement
  const isTextRequirement = useCallback((nodeName) => {
    if (!nodeName) return false;
    // Check if it's a unit requirement or other non-course text
    return isUnitRequirement(nodeName) || 
           (!extractDepartment(nodeName) && nodeName.length > 0);
  }, [extractDepartment, isUnitRequirement]);

  const drawTree = useCallback(() => {
    // Early return if treeData is null or invalid
    if (!treeData) {
      console.log('TreeView: treeData is null, skipping drawTree');
      return;
    }

    const margin = { top: 40, right: 120, bottom: 40, left: 120 };
    const width = 1200 - margin.right - margin.left;
    const height = 1000 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear the SVG to redraw

    // Add gradient definitions for better visual appeal
    const defs = svg.append("defs");
    
    // Calculate tree depth and complexity
    const maxDepth = Math.max(...treeData.descendants().map(d => d.depth));
    setTreeDepth(maxDepth);
    
    // Find the maximum number of children any node has
    const maxChildren = Math.max(...treeData.descendants().map(d => {
      const children = d.children || d._children || [];
      return children.length;
    }));
    
    // Dynamic node sizing based on tree depth AND children count
    // Smaller nodes for: deep trees (depth >= 5) OR wide nodes (children >= 6)
    const needsSmallNodes = maxDepth >= 5 || maxChildren >= 6;
    
    const nodeSize = needsSmallNodes ? {
      course: 14,        // Even smaller for complex trees
      courseHover: 17,
      logic: 9,          // AND/OR nodes
    } : {
      course: 20,        // Normal size for simple trees
      courseHover: 23,
      logic: 12,
    };
    
    console.log(`📏 [TreeView] Tree stats - Depth: ${maxDepth}, Max children: ${maxChildren}, Node size: ${nodeSize.course}px`);
    
    // Helper function to calculate individual node size based on local context
    const getNodeSize = (d) => {
      const childrenCount = (d.children || d._children || []).length;
      
      // If this node has many children (>= 6), use smaller size regardless of global setting
      if (childrenCount >= 6) {
        return {
          course: 12,        // Extra small for nodes with many children
          courseHover: 15,
          logic: 8,
        };
      }
      
      // Otherwise use the global nodeSize
      return nodeSize;
    };

    // Collect all unique departments from the tree
    const departments = new Set();
    treeData.descendants().forEach(d => {
      if (!d.data.condition || (d.data.condition !== "AND" && d.data.condition !== "OR")) {
        const dept = extractDepartment(d.data.name);
        if (dept) departments.add(dept);
      }
    });

    // Update active departments state for legend
    setActiveDepartments(Array.from(departments).sort());

    // Create gradients for each department found in the tree
    departments.forEach(dept => {
      const colors = departmentColors[dept] || { from: '#6B7280', to: '#9CA3AF' }; // Default gray
      const gradient = defs.append("linearGradient")
        .attr("id", `gradient-${dept}`)
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "100%");
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colors.from)
        .attr("stop-opacity", 1);
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colors.to)
        .attr("stop-opacity", 1);
    });

    // Default gradient for unknown departments
    const defaultGradient = defs.append("linearGradient")
      .attr("id", "gradient-default")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%");
    
    defaultGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#6B7280")
      .attr("stop-opacity", 1);
    
    defaultGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#9CA3AF")
      .attr("stop-opacity", 1);

    // AND gradient (Red/Orange)
    const andGradient = defs.append("linearGradient")
      .attr("id", "andGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%");
    
    andGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#F87171")
      .attr("stop-opacity", 1);
    
    andGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#EF4444")
      .attr("stop-opacity", 1);

    // OR gradient (Green)
    const orGradient = defs.append("linearGradient")
      .attr("id", "orGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%");
    
    orGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#34D399")
      .attr("stop-opacity", 1);
    
    orGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#10B981")
      .attr("stop-opacity", 1);

    // Unit requirement gradient (Yellow/Amber - for "X units" nodes)
    const unitGradient = defs.append("linearGradient")
      .attr("id", "gradient-unit")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%");
    
    unitGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#FBBF24")
      .attr("stop-opacity", 1);
    
    unitGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#F59E0B")
      .attr("stop-opacity", 1);

    const g = svg.append("g")
      .attr("class", "zoom-group")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const treeLayout = d3.tree()
      .size([width, height])
      .separation((a, b) => {
        // 增加兄弟节点之间的间距
        return (a.parent === b.parent ? 1.5 : 2) / a.depth;
      });
    treeLayout(treeData);

    // Assign unique IDs to all nodes if not already present
    let nodeIdCounter = 0;
    treeData.descendants().forEach(d => {
      if (!d.data.uniqueId) {
        d.data.uniqueId = `node-${nodeIdCounter++}`;
      }
    });

    // Apply custom positions to nodes before drawing links
    treeData.descendants().forEach(d => {
      const customPos = nodePositions[d.data.uniqueId];
      if (customPos) {
        d.x = customPos.x;
        d.y = customPos.y;
      }
    });

    // Draw links (vertical layout) - use updated positions
    // Red = required (default), Green = optional (OR nodes only)
    g.selectAll(".link")
      .data(treeData.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkVertical().x(d => d.x).y(d => d.y))
      .attr("stroke", (d) => {
        // In plan mode, gray out unsatisfied paths
        if (planMode && !(isNodeSatisfied(d.source) && isNodeSatisfied(d.target))) {
          return "#D1D5DB"; // Gray for unsatisfied paths
        }
        // Green for OR nodes (choose one), Red for everything else (required)
        if (d.source.data.condition === "OR") return "#10B981"; // Green - optional
        return "#EF4444"; // Red - required (default for AND and course nodes)
      })
      .attr("fill", "none")
      .attr("stroke-width", "3px")
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", (d) => {
        // Reduce opacity for unsatisfied paths in plan mode
        if (planMode && !(isNodeSatisfied(d.source) && isNodeSatisfied(d.target))) {
          return 0.2;
        }
        return 0.8;
      })
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))");

    // Draw nodes (vertical layout)
    const node = g.selectAll(".node")
      .data(treeData.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .call(d3.drag()
        .clickDistance(10) // Allow clicks if mouse moves less than 10 pixels
        .filter(function(event, d) {
          // Only allow dragging for course nodes (not AND/OR nodes)
          return d.data.condition !== "AND" && d.data.condition !== "OR";
        })
        .on("start", function(event, d) {
          // Only course nodes can be dragged
          if (d.data.condition === "AND" || d.data.condition === "OR") {
            return;
          }
          
          setDraggedNode(d);
          d3.select(this).raise();
          
          // Store the initial mouse position relative to the node
          d.dragOffsetX = event.x;
          d.dragOffsetY = event.y;
          // Store original position for reset
          d.originalX = d.x;
          d.originalY = d.y;
          // Track if actually dragged
          d.wasDragged = false;
          
          // Add visual feedback for dragging
          d3.select(this).select(".node-circle")
            .style("filter", "drop-shadow(0 8px 16px rgba(0,0,0,0.3))")
            .style("stroke", "#FBBF24")
            .style("stroke-width", "3px");
        })
        .on("drag", function(event, d) {
          // Only course nodes can be dragged
          if (d.data.condition === "AND" || d.data.condition === "OR") {
            return;
          }
          
          // Mark as dragged if mouse moved significantly
          const dragDistance = Math.sqrt(
            Math.pow(event.x - d.dragOffsetX, 2) + 
            Math.pow(event.y - d.dragOffsetY, 2)
          );
          
          if (dragDistance > 5) {
            d.wasDragged = true;
          }
          
          // Calculate the new position (for vertical layout)
          const newX = d.originalX + (event.x - d.dragOffsetX);
          const newY = d.originalY + (event.y - d.dragOffsetY);
          
          // Update the node position
          d3.select(this).attr("transform", `translate(${newX},${newY})`);
          
          // Update only the links that are connected to this specific node
          g.selectAll(".link")
            .filter(function(linkData) {
              // Only select links where source or target matches the dragged node
              return linkData.source === d || linkData.target === d;
            })
            .attr("d", function(linkData) {
              let sourceX = linkData.source.x;
              let sourceY = linkData.source.y;
              let targetX = linkData.target.x;
              let targetY = linkData.target.y;
              
              // Update source position if this is the dragged node
              if (linkData.source === d) {
                sourceX = newX;
                sourceY = newY;
              }
              // Update target position if this is the dragged node
              if (linkData.target === d) {
                targetX = newX;
                targetY = newY;
              }
              
              // Return the updated link path (vertical layout)
              return d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y)({
                  source: { x: sourceX, y: sourceY },
                  target: { x: targetX, y: targetY }
                });
            });
        })
        .on("end", function(event, d) {
          const wasDragged = d.wasDragged;
          setDraggedNode(null);
          
          // Reset visual feedback
          d3.select(this).select(".node-circle")
            .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.15))")
            .style("stroke", "#ffffff")
            .style("stroke-width", "2px");
          
          // If actually dragged, save the new position using unique ID
          if (wasDragged && d.data.condition !== "AND" && d.data.condition !== "OR") {
            const newX = d.originalX + (event.x - d.dragOffsetX);
            const newY = d.originalY + (event.y - d.dragOffsetY);
            
            // Save position to state using uniqueId - this will trigger a full redraw
            setNodePositions(prev => ({
              ...prev,
              [d.data.uniqueId]: { x: newX, y: newY }
            }));
          } else if (!wasDragged) {
            // If not dragged (just clicked), select the node
            setSelectedNode(d.data);
          }
          
          // Clean up
          delete d.wasDragged;
          delete d.dragOffsetX;
          delete d.dragOffsetY;
          delete d.originalX;
          delete d.originalY;
        })
      );

    // Create modern node containers
    const nodeContainers = node.append("g").attr("class", "node-container");

    // Add node shapes - circles for courses, squares for AND/OR
    // First, add circles for course nodes only
    nodeContainers
      .filter(d => d.data.condition !== "AND" && d.data.condition !== "OR")
      .append("circle")
      .attr("class", "node-circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", d => getNodeSize(d).course) // Dynamic size based on tree depth and children count
      .style("fill", (d) => {
        // In plan mode, check if node is satisfied
        if (planMode && !isNodeSatisfied(d)) {
          return "#D1D5DB"; // Gray for unsatisfied nodes
        }
        // Check if it's a unit requirement node
        if (isUnitRequirement(d.data.name)) {
          return "url(#gradient-unit)"; // Special gradient for unit requirements
        }
        // For course nodes, use department-specific gradient
        const dept = extractDepartment(d.data.name);
        return dept ? `url(#gradient-${dept})` : "url(#gradient-default)";
      })
      .style("opacity", (d) => {
        // Reduce opacity for unsatisfied nodes in plan mode
        if (planMode && !isNodeSatisfied(d)) {
          return 0.4;
        }
        return 1;
      })
      .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.15))")
      .style("stroke", "#ffffff")
      .style("stroke-width", "2px")
      .style("cursor", "grab")
      .on("mouseover", function(event, d) {
        // Highlight path
        highlightPath(d);
        
        // Highlight all nodes with the same course name (in all modes now)
        if (d.data.name && !d.data.condition && !isUnitRequirement(d.data.name)) {
          const sameNameNodes = findNodesWithSameName(d.data.name);
          sameNameNodes.forEach(node => {
            const individualSize = getNodeSize(node);
            // Find the circle element for this node
            g.selectAll(".node-circle")
              .filter(circleData => circleData.data.uniqueId === node.data.uniqueId)
              .style("filter", "drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 0 12px rgba(59, 130, 246, 0.6))")
              .style("stroke-width", "4px")
              .transition()
              .duration(200)
              .attr("r", individualSize.courseHover);
          });
        } else {
          // Fallback for non-course nodes
          const individualSize = getNodeSize(d);
          d3.select(this)
            .style("filter", "drop-shadow(0 8px 16px rgba(0,0,0,0.3))")
            .style("stroke-width", "4px")
            .transition()
            .duration(200)
            .attr("r", individualSize.courseHover);
        }
      })
      .on("mouseout", function(event, d) {
        // Clear highlight
        clearHighlight();
        
        // Reset all nodes with the same course name (in all modes now)
        if (d.data.name && !d.data.condition && !isUnitRequirement(d.data.name)) {
          const sameNameNodes = findNodesWithSameName(d.data.name);
          sameNameNodes.forEach(node => {
            const individualSize = getNodeSize(node);
            g.selectAll(".node-circle")
              .filter(circleData => circleData.data.uniqueId === node.data.uniqueId)
              .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.15))")
              .style("stroke-width", "2px")
              .transition()
              .duration(200)
              .attr("r", individualSize.course);
          });
        } else {
          // Fallback for non-course nodes
          const individualSize = getNodeSize(d);
          d3.select(this)
            .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.15))")
            .style("stroke-width", "2px")
            .transition()
            .duration(200)
            .attr("r", individualSize.course);
        }
      });

    // Add squares for AND/OR logic nodes (dynamic size based on tree depth and children count)
    nodeContainers
      .filter(d => d.data.condition === "AND" || d.data.condition === "OR")
      .append("rect")
      .attr("class", "node-square")
      .attr("x", d => -getNodeSize(d).logic) // Center the square
      .attr("y", d => -getNodeSize(d).logic) // Center the square
      .attr("width", d => getNodeSize(d).logic * 2)
      .attr("height", d => getNodeSize(d).logic * 2)
      .attr("rx", 3) // Rounded corners (smaller)
      .attr("ry", 3)
      .style("fill", (d) => {
        // In plan mode, check if node is satisfied
        if (planMode && !isNodeSatisfied(d)) {
          return "#D1D5DB"; // Gray for unsatisfied nodes
        }
        if (d.data.condition === "AND") return "url(#andGradient)";
        if (d.data.condition === "OR") return "url(#orGradient)";
        return "url(#gradient-default)";
      })
      .style("opacity", (d) => {
        // Reduce opacity for unsatisfied nodes in plan mode
        if (planMode && !isNodeSatisfied(d)) {
          return 0.4;
        }
        return 1;
      })
      .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.15))")
      .style("stroke", "#ffffff")
      .style("stroke-width", "1px"); // Thinner stroke

    // Add expand/collapse indicators - show when node has children (expanded or collapsed)
    // Search hit area (for loading prerequisites) - only for course nodes
    nodeContainers
      .filter(d => d.data.condition !== "AND" && d.data.condition !== "OR")
      .append("circle")
      .attr("class", "search-hitarea")
      .attr("cx", 30) // Course nodes (20px + 10px)
      .attr("cy", 0) // Same vertical level as node center
      .attr("r", 10) // Smaller hit area
      .style("fill", "transparent")
      .style("opacity", (d) => {
        const hasPrerequisites = d.data.hasPrerequisites && !loadedNodes.has(d.data.uniqueId);
        const isLoading = loadingNodes.has(d.data.uniqueId);
        if (!(hasPrerequisites || isLoading)) return 0;
        // Reduce opacity in plan mode to indicate disabled state
        return planMode ? 0.3 : 1;
      })
      .style("display", (d) => {
        const hasPrerequisites = d.data.hasPrerequisites && !loadedNodes.has(d.data.uniqueId);
        const isLoading = loadingNodes.has(d.data.uniqueId);
        return (hasPrerequisites || isLoading) ? "block" : "none";
      })
      .style("cursor", (d) => {
        if (planMode) return "not-allowed";
        if (loadingNodes.has(d.data.uniqueId)) return "wait";
        return "pointer";
      })
      .style("pointer-events", "all") // Ensure this captures events
      .on("mousedown", function(event) {
        // Prevent drag from starting on indicator
        event.stopPropagation();
      })
      .on("click", function(event, d) {
        event.preventDefault();
        event.stopPropagation();
        
        // Disable search in plan mode
        if (planMode) {
          console.log(`🚫 [Search] Search disabled in plan mode`);
          return;
        }
        
        // Prevent double-click while loading
        if (loadingNodes.has(d.data.uniqueId)) {
          console.log(`🚫 [Search] Already loading ${d.data.name}, please wait...`);
          return;
        }
        
        console.log(`🔍 [Search] Search indicator clicked for ${d.data.name}`);
        console.log(`🔍 [Search] Node data:`, d.data);
        console.log(`🔍 [Search] Has prerequisites:`, d.data.hasPrerequisites);
        console.log(`🔍 [Search] Loaded nodes:`, loadedNodes);
        setSelectedNode(d.data);
        toggleChildren(d.data);
      })
      .on("mouseover", function(event, d) {
        event.stopPropagation(); // Prevent node hover
        
        // Don't highlight if loading
        if (loadingNodes.has(d.data.uniqueId)) return;
        
        // Clear any existing highlight from node
        clearHighlight();
        
        // Highlight the search indicator on hover
        d3.select(this.parentNode).select(".search-indicator")
          .style("filter", "drop-shadow(0 3px 6px rgba(0,0,0,0.3))")
          .transition()
          .duration(150)
          .attr("r", 10); // Hover size (smaller)
      })
      .on("mouseout", function(event, d) {
        event.stopPropagation(); // Prevent node mouseout
        
        d3.select(this.parentNode).select(".search-indicator")
          .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
          .transition()
          .duration(150)
          .attr("r", 8); // Base size (smaller)
      });

    // Expand/collapse hit area (for existing children) - only for course nodes
    nodeContainers
      .filter(d => d.data.condition !== "AND" && d.data.condition !== "OR")
      .append("circle")
      .attr("class", "expand-hitarea")
      .attr("cx", 45) // Further to the right (30px + 15px)
      .attr("cy", 0) // Same vertical level as node center
      .attr("r", 10) // Smaller hit area
      .style("fill", "transparent")
      .style("opacity", (d) => {
        const hasChildren = (d.children && d.children.length > 0) || (d._children && d._children.length > 0);
        if (!hasChildren) return 0;
        // Reduce opacity in plan mode to indicate disabled state
        return planMode ? 0.3 : 1;
      })
      .style("display", (d) => {
        const hasChildren = (d.children && d.children.length > 0) || (d._children && d._children.length > 0);
        return hasChildren ? "block" : "none";
      })
      .style("cursor", (d) => planMode ? "not-allowed" : "pointer")
      .style("pointer-events", "all") // Ensure this captures events
      .on("mousedown", function(event) {
        // Prevent drag from starting on indicator
        event.stopPropagation();
      })
      .on("click", function(event, d) {
        event.stopPropagation();
        
        // Disable expand/collapse in plan mode
        if (planMode) {
          console.log(`🚫 [Expand] Expand/collapse disabled in plan mode`);
          return;
        }
        
        console.log(`➕ [Expand] Expand indicator clicked for ${d.data.name}`);
        setSelectedNode(d.data);
        toggleChildren(d.data);
      })
      .on("mouseover", function(event, d) {
        event.stopPropagation(); // Prevent node hover
        
        // Clear any existing highlight from node
        clearHighlight();
        
        // Highlight the expand indicator on hover
        d3.select(this.parentNode).select(".expand-indicator")
          .style("filter", "drop-shadow(0 3px 6px rgba(0,0,0,0.3))")
          .transition()
          .duration(150)
          .attr("r", 10); // Hover size (smaller)
      })
      .on("mouseout", function(event, d) {
        event.stopPropagation(); // Prevent node mouseout
        
        d3.select(this.parentNode).select(".expand-indicator")
          .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
          .transition()
          .duration(150)
          .attr("r", 8); // Base size (smaller)
      });

    // Search indicator (for loading prerequisites) - only for course nodes
    nodeContainers
      .filter(d => d.data.condition !== "AND" && d.data.condition !== "OR")
      .append("circle")
      .attr("class", "search-indicator")
      .attr("cx", 30) // Course nodes only (20px + 10px)
      .attr("cy", 0) // Same vertical level as node center
      .attr("r", 8) // Smaller indicator
      .style("fill", (d) => {
        // 加载中 = 黄色，可搜索 = 紫色，已加载 = 透明（隐藏）
        if (loadingNodes.has(d.data.uniqueId)) {
          return "#F59E0B"; // Amber/Yellow for loading
        }
        // 如果还没加载过，显示紫色表示可以搜索
        if (d.data.hasPrerequisites && !loadedNodes.has(d.data.uniqueId)) {
          return "#8B5CF6"; // Purple for searchable
        }
        return "transparent"; // Hidden if already loaded
      })
      .style("stroke", "#ffffff")
      .style("stroke-width", "2px")
      .style("opacity", (d) => {
        // Hide in plan mode
        if (planMode) return 0;
        
        const hasPrerequisites = d.data.hasPrerequisites && !loadedNodes.has(d.data.uniqueId);
        const isLoading = loadingNodes.has(d.data.uniqueId);
        return (hasPrerequisites || isLoading) ? 1 : 0;
      })
      .style("display", (d) => {
        // Hide in plan mode
        if (planMode) return "none";
        
        const hasPrerequisites = d.data.hasPrerequisites && !loadedNodes.has(d.data.uniqueId);
        const isLoading = loadingNodes.has(d.data.uniqueId);
        return (hasPrerequisites || isLoading) ? "block" : "none";
      })
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
      .style("pointer-events", "none"); // Don't capture events, let hitarea handle it

    // Expand/collapse indicator (for existing children) - only for course nodes
    nodeContainers
      .filter(d => d.data.condition !== "AND" && d.data.condition !== "OR")
      .append("circle")
      .attr("class", "expand-indicator")
      .attr("cx", 45) // Further to the right (30px + 15px)
      .attr("cy", 0) // Same vertical level as node center
      .attr("r", 8) // Smaller indicator
      .style("fill", (d) => {
        // 已收起 = 蓝色，已展开 = 绿色
        return d._children ? "#3B82F6" : "#10B981";
      })
      .style("stroke", "#ffffff")
      .style("stroke-width", "2px")
      .style("opacity", (d) => {
        // Hide in plan mode
        if (planMode) return 0;
        
        const hasChildren = (d.children && d.children.length > 0) || (d._children && d._children.length > 0);
        return hasChildren ? 1 : 0;
      })
      .style("display", (d) => {
        // Hide in plan mode
        if (planMode) return "none";
        
        const hasChildren = (d.children && d.children.length > 0) || (d._children && d._children.length > 0);
        return hasChildren ? "block" : "none";
      })
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
      .style("pointer-events", "none"); // Don't capture events, let hitarea handle it

    // Search icon (🔍) for loading prerequisites - only for course nodes
    nodeContainers
      .filter(d => d.data.condition !== "AND" && d.data.condition !== "OR")
      .append("text")
      .attr("class", "search-icon")
      .attr("x", 30) // Course nodes only (20px + 10px)
      .attr("y", 3) // Slightly below center for vertical alignment
      .style("font-family", "Arial, sans-serif")
      .style("font-size", "12px") // Smaller font
      .style("font-weight", "bold")
      .style("text-anchor", "middle")
      .style("fill", "#ffffff")
      .style("pointer-events", "none")
      .style("opacity", (d) => {
        // Hide in plan mode
        if (planMode) return 0;
        
        const hasPrerequisites = d.data.hasPrerequisites && !loadedNodes.has(d.data.uniqueId);
        const isLoading = loadingNodes.has(d.data.uniqueId);
        return (hasPrerequisites || isLoading) ? 1 : 0;
      })
      .style("display", (d) => {
        // Hide in plan mode
        if (planMode) return "none";
        
        const hasPrerequisites = d.data.hasPrerequisites && !loadedNodes.has(d.data.uniqueId);
        const isLoading = loadingNodes.has(d.data.uniqueId);
        return (hasPrerequisites || isLoading) ? "block" : "none";
      })
      .text((d) => {
        // Loading = "⋯", Searchable = "🔍"
        if (loadingNodes.has(d.data.uniqueId)) {
          return "⋯"; // Loading indicator
        }
        return "🔍"; // Search icon
      })

    // Expand/collapse icons - "+" when collapsed, "-" when expanded
    // Only for course nodes with existing children
    nodeContainers
      .filter(d => d.data.condition !== "AND" && d.data.condition !== "OR")
      .append("text")
      .attr("class", "expand-icon")
      .attr("x", 45) // Further to the right (30px + 15px)
      .attr("y", 3) // Slightly below center for vertical alignment
      .style("font-family", "Arial, sans-serif")
      .style("font-size", "12px") // Smaller font
      .style("font-weight", "bold")
      .style("text-anchor", "middle")
      .style("fill", "#ffffff")
      .style("pointer-events", "none")
      .style("opacity", (d) => {
        // Hide in plan mode
        if (planMode) return 0;
        
        const hasChildren = (d.children && d.children.length > 0) || (d._children && d._children.length > 0);
        return hasChildren ? 1 : 0;
      })
      .style("display", (d) => {
        // Hide in plan mode
        if (planMode) return "none";
        
        const hasChildren = (d.children && d.children.length > 0) || (d._children && d._children.length > 0);
        return hasChildren ? "block" : "none";
      })
      .text((d) => {
        // Collapsed = "+", Expanded = "−"
        return d._children ? "+" : "−";
      })

    // Add course name label below the node (circle or square)
    nodeContainers.each(function(d) {
      const isLogicNode = d.data.condition === "AND" || d.data.condition === "OR";
      
      // For course nodes with long names, split into multiple lines
      if (!isLogicNode && d.data.name && d.data.name.length > 15) {
        const words = d.data.name.split(' ');
        const maxLineLength = 12; // Max characters per line
        
        let lines = [];
        let currentLine = '';
        
        words.forEach(word => {
          if ((currentLine + ' ' + word).trim().length <= maxLineLength) {
            currentLine = (currentLine + ' ' + word).trim();
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        });
        if (currentLine) lines.push(currentLine);
        
        // Calculate vertical offset to keep first line below the node
        const lineCount = lines.length;
        const startY = 35; // Base position below node
        
        const text = d3.select(this).append("text")
          .attr("y", startY)  // Use "y" instead of "dy" for absolute positioning
          .style("font-family", "Inter, -apple-system, BlinkMacSystemFont, sans-serif")
          .style("font-size", "11px")
          .style("font-weight", "600")
          .style("text-anchor", "middle")
          .style("fill", "#374151")
          .style("pointer-events", "none");
        
        // Add each line as a tspan
        lines.forEach((line, i) => {
          text.append("tspan")
            .attr("x", 0)
            .attr("dy", i === 0 ? "0em" : "1.1em")  // First line at baseline, subsequent lines offset
            .text(line);
        });
      } else {
        // Single line text
        const text = d3.select(this).append("text")
          .attr("dy", isLogicNode ? 26 : 35)
          .style("font-family", "Inter, -apple-system, BlinkMacSystemFont, sans-serif")
          .style("font-size", isLogicNode ? "8px" : "11px")
          .style("font-weight", isLogicNode ? "500" : "600")
          .style("text-anchor", "middle")
          .style("fill", isLogicNode ? "#6B7280" : "#374151")
          .style("pointer-events", "none")
          .text(d.data.name);
      }
    });

    // Add checkboxes in Plan Mode (only for course nodes, positioned on the left)
    // Using a similar approach to indicators: hitarea + visible checkbox
    if (planMode) {
      // Invisible hit area for easier clicking (prevents drag conflict)
      nodeContainers
        .filter(d => d.data.condition !== "AND" && d.data.condition !== "OR")
        .append("circle")
        .attr("class", "checkbox-hitarea")
        .attr("cx", -30) // Position to the left of the node
        .attr("cy", 0)
        .attr("r", 12) // Larger hit area
        .style("fill", "transparent")
        .style("cursor", (d) => {
          if (checkedNodes.has(d.data.uniqueId)) return "pointer"; // Can always uncheck
          return canCheckNode(d) ? "pointer" : "not-allowed";
        })
        .style("pointer-events", "all")
        .attr("title", (d) => {
          if (checkedNodes.has(d.data.uniqueId)) {
            return "Click to uncheck";
          }
          return canCheckNode(d) 
            ? "Click to check as completed" 
            : "Prerequisites not met - complete required courses first";
        })
        .on("mousedown", function(event) {
          // Prevent drag from starting on checkbox
          event.stopPropagation();
        })
        .on("click", function(event, d) {
          event.stopPropagation();
          
          const isCurrentlyChecked = checkedNodes.has(d.data.uniqueId);
          const newCheckedState = !isCurrentlyChecked;
          
          // If trying to check, verify prerequisites
          if (newCheckedState && !canCheckNode(d)) {
            alert(`Cannot check ${d.data.name}!\n\nPrerequisites not satisfied. Please complete the required prerequisite courses first.`);
            return;
          }
          
          handleCheckboxChange(d, newCheckedState);
        })
        .on("mouseover", function(event, d) {
          event.stopPropagation(); // Prevent node hover
          
          // Clear any existing highlight from node
          clearHighlight();
          
          // Highlight the visible checkbox on hover
          d3.select(this.parentNode).select(".checkbox-visible")
            .style("filter", "drop-shadow(0 3px 6px rgba(0,0,0,0.3))")
            .transition()
            .duration(150)
            .attr("r", 11);
        })
        .on("mouseout", function(event, d) {
          event.stopPropagation(); // Prevent node mouseout
          
          d3.select(this.parentNode).select(".checkbox-visible")
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
            .transition()
            .duration(150)
            .attr("r", 9);
        });

      // Visible checkbox circle
      nodeContainers
        .filter(d => d.data.condition !== "AND" && d.data.condition !== "OR")
        .append("circle")
        .attr("class", "checkbox-visible")
        .attr("cx", -30)
        .attr("cy", 0)
        .attr("r", 9)
        .style("fill", (d) => {
          if (checkedNodes.has(d.data.uniqueId)) {
            return "#10B981"; // Green when checked
          }
          return canCheckNode(d) ? "#E5E7EB" : "#F3F4F6"; // Light gray when unchecked
        })
        .style("stroke", (d) => {
          if (checkedNodes.has(d.data.uniqueId)) {
            return "#059669";
          }
          return canCheckNode(d) ? "#9CA3AF" : "#D1D5DB";
        })
        .style("stroke-width", "2px")
        .style("opacity", (d) => canCheckNode(d) || checkedNodes.has(d.data.uniqueId) ? "1" : "0.5")
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
        .style("pointer-events", "none"); // Don't capture events, let hitarea handle it

      // Checkmark icon when checked
      nodeContainers
        .filter(d => d.data.condition !== "AND" && d.data.condition !== "OR")
        .append("text")
        .attr("class", "checkbox-checkmark")
        .attr("x", -30)
        .attr("y", 4)
        .style("font-family", "Arial, sans-serif")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("text-anchor", "middle")
        .style("fill", "#ffffff")
        .style("pointer-events", "none")
        .style("opacity", (d) => checkedNodes.has(d.data.uniqueId) ? 1 : 0)
        .text("✓");
    }

  }, [treeData, toggleChildren, highlightPath, clearHighlight, nodePositions, extractDepartment, isUnitRequirement, findNodesWithSameName, planMode, checkedNodes, isNodeSatisfied, handleCheckboxChange, canCheckNode, loadingNodes, loadedNodes]);

  const setupZoom = useCallback(() => {
    const svg = d3.select(svgRef.current);
    const g = svg.select('.zoom-group');
    
    // Early return if zoom-group doesn't exist (e.g., during loading)
    if (g.empty()) {
      console.log('TreeView: zoom-group not found, skipping setupZoom');
      return;
    }
    
    // Store the base transform (margin offset)
    const baseTransform = g.attr("transform");
    
    const zoom = d3.zoom()
      .scaleExtent([0.1, 3])
      .filter(event => {
        // On desktop: only zoom when Shift key is pressed
        // On mobile/touch devices: allow pinch-to-zoom (event.type === 'touchstart')
        return event.shiftKey || event.type === 'touchstart' || event.type === 'touchmove';
      })
      .on("zoom", (event) => {
        // Save the current transform
        zoomTransformRef.current = event.transform;
        // Apply zoom transform while preserving base transform
        g.attr("transform", `${baseTransform} translate(${event.transform.x},${event.transform.y}) scale(${event.transform.k})`);
      });
    
    svg.call(zoom);
    
    // Restore previous zoom transform if it exists
    if (zoomTransformRef.current) {
      svg.call(zoom.transform, zoomTransformRef.current);
    }
  }, []);

  useEffect(() => {
    // Only draw tree and setup zoom if we have valid data (not loading)
    if (data && !data.loading) {
    drawTree();
    setupZoom();
    }
  }, [treeData, updateCounter, planMode, checkedNodes, loadingNodes, loadedNodes, drawTree, setupZoom, data]);  // Update dependencies

  // Check if we have valid data or loading state
  if (!data || (data && data.loading)) {
    return (
      <div className="relative w-full">
        <div className="flex items-center justify-center h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading course prerequisites...</p>
            <p className="text-gray-500 text-sm mt-1">AI is analyzing the course requirements</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Action Buttons */}
      <div className="mb-3 sm:mb-4 flex justify-between items-center gap-2 px-2 sm:px-0">
        {/* Plan Mode Button (Left) */}
        <button
          onClick={togglePlanMode}
          className={`px-3 py-2 sm:px-4 text-sm sm:text-base rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 touch-manipulation ${
            planMode 
              ? 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800' 
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 active:from-purple-800 active:to-indigo-800'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          <span className="hidden sm:inline">{planMode ? 'Exit Plan Mode' : 'Plan Path'}</span>
          <span className="sm:hidden">{planMode ? '✓' : '📋'}</span>
        </button>

        {/* Utility Buttons (Right) */}
        <div className="flex gap-2">
          <button
            onClick={captureScreenshot}
            className="px-3 py-2 sm:px-4 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors shadow-md hover:shadow-lg flex items-center gap-2 touch-manipulation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Capture</span>
            <span className="sm:hidden">📷</span>
          </button>
          
          {/* Reset button - only show when nodes have been dragged */}
          {Object.keys(nodePositions).length > 0 && (
            <button
              onClick={resetNodePositions}
              className="px-3 py-2 sm:px-4 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-md hover:shadow-lg flex items-center gap-2 touch-manipulation animate-fadeIn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">Reset Positions</span>
              <span className="sm:hidden">🔄</span>
            </button>
          )}
        </div>
      </div>

      {/* Plan Mode Status Indicator */}
      {planMode && (
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-300 mx-2 sm:mx-0 shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-purple-800">📋 Plan Mode Active</h4>
                <p className="text-xs text-purple-700">Check course nodes to visualize your learning path</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg sm:text-2xl font-bold text-purple-600">{checkedNodes.size}</p>
              <p className="text-xs text-purple-700">Completed</p>
            </div>
          </div>
        </div>
      )}

      {/* Tree Container */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 overflow-x-auto overflow-y-hidden mx-2 sm:mx-0">
        <div className="min-w-[800px]">
    <svg
      ref={svgRef}
      width="1200"
      height="1000"
            className="w-full h-auto"
            style={{ touchAction: 'pan-x pan-y' }}
    ></svg>
        </div>
      </div>

      {/* Mobile Tip */}
      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg mx-2 sm:mx-0 md:hidden">
        <p className="text-xs text-amber-800">
          <strong>💡 Mobile Tip:</strong> Swipe left/right to view the full tree. Pinch to zoom (zoom is preserved). Tap nodes to expand/collapse.
        </p>
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg mx-2 sm:mx-0">
          <h4 className="text-xs sm:text-sm font-semibold text-blue-800 mb-2">Selected Node:</h4>
          <p className="text-xs sm:text-sm text-blue-700">
            <strong>Name:</strong> {selectedNode.name}<br/>
            <strong>Condition:</strong> {selectedNode.condition || "None"}
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 mx-2 sm:mx-0">
        <h4 className="text-xs sm:text-sm font-semibold text-blue-800 mb-2">🎮 Interactive Features:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 text-xs text-blue-700">
          <div className="space-y-1">
            <p className="hidden sm:block"><strong>🖱️ Mouse Hover:</strong> Highlight connected paths</p>
            <p className="sm:hidden"><strong>👆 Tap:</strong> Highlight paths</p>
            <p><strong>🔘 Click Indicator:</strong> Expand/collapse node (+/−)</p>
            <p className="hidden sm:block"><strong>🖱️ Drag:</strong> Move course nodes (colored only)</p>
            <p className="sm:hidden"><strong>👆 Drag:</strong> Move course nodes</p>
            <p className="hidden sm:block"><strong>🔒 Note:</strong> AND/OR nodes cannot be dragged</p>
            <p><strong>📋 Plan Mode:</strong> Visualize your learning path step-by-step</p>
          </div>
          <div className="space-y-1">
            <p className="hidden sm:block"><strong>⌨️ Shift + Scroll:</strong> Zoom in/out</p>
            <p className="sm:hidden"><strong>👉 Pinch:</strong> Zoom in/out</p>
            <p><strong>✨ Animation:</strong> Smooth hover & color transitions</p>
            <p><strong>🎨 Colors:</strong> By department (see legend below)</p>
            <p><strong>📷 Capture:</strong> Save tree as image</p>
            <p><strong>🔄 Reset:</strong> Restore layout & zoom</p>
          </div>
        </div>
        {planMode && (
          <div className="mt-3 pt-3 border-t border-blue-300">
            <p className="text-xs text-purple-800 font-semibold mb-1">📋 Plan Mode Instructions:</p>
            <ul className="text-xs text-purple-700 space-y-1 list-disc list-inside">
              <li>Check course boxes to mark as completed</li>
              <li><strong>⚠️ Prerequisites enforced:</strong> Can only check courses after completing their prerequisites</li>
              <li>Watch paths light up as you progress</li>
              <li><strong>AND nodes:</strong> All prerequisites must be checked</li>
              <li><strong>OR nodes:</strong> At least one option must be checked</li>
              <li>Gray nodes/lines = not yet satisfied</li>
              <li>Colored nodes/lines = prerequisites met ✓</li>
              <li>Dimmed checkboxes = prerequisites not met (disabled)</li>
            </ul>
          </div>
        )}
      </div>

      {/* Legend - Department Colors & Node Types */}
      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-300 mx-2 sm:mx-0">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-3">📚 Legend:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Department Colors */}
          {activeDepartments.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 mb-2 text-xs">Course Departments:</p>
              <div className="space-y-1.5">
                {activeDepartments.map(dept => {
                  const colors = departmentColors[dept] || { from: '#6B7280', to: '#9CA3AF', name: dept };
                  return (
                    <div key={dept} className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm border border-white"
                        style={{ 
                          background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` 
                        }}
                      ></div>
                      <span className="text-xs text-gray-700">
                        <strong>{dept}</strong> - {colors.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Node Types */}
          <div>
            <p className="font-semibold text-gray-700 mb-2 text-xs">Node Types:</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-red-400 to-red-500 flex-shrink-0 shadow-sm border border-white"></div>
                <span className="text-xs text-gray-700"><strong>AND</strong> - All required (small square)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-green-400 to-green-500 flex-shrink-0 shadow-sm border border-white"></div>
                <span className="text-xs text-gray-700"><strong>OR</strong> - Any one required (small square)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex-shrink-0 shadow-sm border border-white"></div>
                <span className="text-xs text-gray-700"><strong>Units</strong> - Credit requirement (yellow circle)</span>
              </div>
            </div>
          </div>

          {/* Indicators & Lines */}
          <div>
            <p className="font-semibold text-gray-700 mb-2 text-xs">Indicators & Lines:</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">🔍</div>
                <span className="text-xs text-gray-700">Search prerequisites (AI)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">⋯</div>
                <span className="text-xs text-gray-700">Loading prerequisites (AI)...</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">+</div>
                <span className="text-xs text-gray-700">Collapsed (click to expand)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">−</div>
                <span className="text-xs text-gray-700">Expanded (click to collapse)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-red-500 flex-shrink-0 shadow-sm"></div>
                <span className="text-xs text-gray-700"><strong>Red line</strong> - Required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-green-500 flex-shrink-0 shadow-sm"></div>
                <span className="text-xs text-gray-700"><strong>Green line</strong> - Optional (choose one)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TreeView;
