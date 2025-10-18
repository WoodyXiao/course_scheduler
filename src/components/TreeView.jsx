import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

// Define color schemes for different departments (constant)
// Avoiding red (AND nodes) and green (OR nodes) colors
const departmentColors = {
  'CMPT': { from: '#4F46E5', to: '#7C3AED', name: 'Computing Science' },  // Indigo/Purple
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
  'ENSC': { from: '#0284C7', to: '#0EA5E9', name: 'Engineering Science' }, // Sky Blue
};

function TreeView({ data }) {
  const svgRef = useRef();
  const [treeData, setTreeData] = useState(() => d3.hierarchy(data));
  const [updateCounter, setUpdateCounter] = useState(0);
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightedNodes, setHighlightedNodes] = useState(new Set());
  const [draggedNode, setDraggedNode] = useState(null);
  const [nodePositions, setNodePositions] = useState({}); // Store custom positions
  const [activeDepartments, setActiveDepartments] = useState([]); // Track departments in current tree
  const zoomTransformRef = useRef(null); // Store zoom transform state

  useEffect(() => {
    // This effect runs when `data` prop changes.
    setTreeData(d3.hierarchy(data));  // Recreate the hierarchy with the new data
    // Clear previous node positions and zoom when switching to a new course
    setNodePositions({});
    zoomTransformRef.current = null;
  }, [data]);

  const toggleChildren = useCallback((nodeData) => {
    // Find the node in the tree hierarchy
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
    // Force re-render by updating counter
    setUpdateCounter(prev => prev + 1);
  }, [treeData]);

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

  const drawTree = useCallback(() => {
    const margin = { top: 40, right: 120, bottom: 40, left: 120 };
    const width = 1200 - margin.right - margin.left;
    const height = 1000 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear the SVG to redraw

    // Add gradient definitions for better visual appeal
    const defs = svg.append("defs");
    
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

    const g = svg.append("g")
      .attr("class", "zoom-group")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const treeLayout = d3.tree().size([width, height]);
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
    g.selectAll(".link")
      .data(treeData.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkVertical().x(d => d.x).y(d => d.y))
      .attr("stroke", (d) => {
        if (d.source.data.condition === "AND") return "#EF4444";
        if (d.source.data.condition === "OR") return "#10B981";
        return "#6B7280";
      })
      .attr("fill", "none")
      .attr("stroke-width", "3px")
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.8)
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

    // Add node shapes - circles for courses, smaller circles for AND/OR
    nodeContainers.append("circle")
      .attr("class", "node-circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", (d) => {
        // AND/OR nodes are smaller (18px), course nodes are larger (25px)
        return (d.data.condition === "AND" || d.data.condition === "OR") ? 18 : 25;
      })
      .style("fill", (d) => {
        if (d.data.condition === "AND") return "url(#andGradient)";
        if (d.data.condition === "OR") return "url(#orGradient)";
        // For course nodes, use department-specific gradient
        const dept = extractDepartment(d.data.name);
        return dept ? `url(#gradient-${dept})` : "url(#gradient-default)";
      })
      .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.15))")
      .style("stroke", "#ffffff")
      .style("stroke-width", (d) => {
        // Thinner stroke for AND/OR nodes
        return (d.data.condition === "AND" || d.data.condition === "OR") ? "1.5px" : "2px";
      })
      .style("cursor", d => {
        return (d.data.condition === "AND" || d.data.condition === "OR") ? "pointer" : "grab";
      })
      .on("mouseover", function(event, d) {
        // Highlight path
        highlightPath(d);
        
        const isLogicNode = d.data.condition === "AND" || d.data.condition === "OR";
        const hoverRadius = isLogicNode ? 20 : 28;
        
        d3.select(this)
          .style("filter", "drop-shadow(0 6px 12px rgba(0,0,0,0.25))")
          .transition()
          .duration(200)
          .attr("r", hoverRadius);
      })
      .on("mouseout", function(event, d) {
        // Clear highlight
        clearHighlight();
        
        const isLogicNode = d.data.condition === "AND" || d.data.condition === "OR";
        const baseRadius = isLogicNode ? 18 : 25;
        
        d3.select(this)
          .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.15))")
          .transition()
          .duration(200)
          .attr("r", baseRadius);
      });

    // Add expand/collapse indicators - show when node has children (expanded or collapsed)
    // Invisible larger hit area for easier clicking (positioned on the right side of node)
    nodeContainers.append("circle")
      .attr("class", "indicator-hitarea")
      .attr("cx", (d) => {
        // Position to the right of the node
        const isLogicNode = d.data.condition === "AND" || d.data.condition === "OR";
        return isLogicNode ? 28 : 35; // Right side of node
      })
      .attr("cy", 0) // Same vertical level as node center
      .attr("r", 12) // Medium hit area
      .style("fill", "transparent")
      .style("opacity", (d) => {
        const hasChildren = (d.children && d.children.length > 0) || (d._children && d._children.length > 0);
        return hasChildren ? 1 : 0;
      })
      .style("display", (d) => {
        const hasChildren = (d.children && d.children.length > 0) || (d._children && d._children.length > 0);
        return hasChildren ? "block" : "none";
      })
      .style("cursor", "pointer")
      .style("pointer-events", "all") // Ensure this captures events
      .on("mousedown", function(event) {
        // Prevent drag from starting on indicator
        event.stopPropagation();
      })
      .on("click", function(event, d) {
        event.stopPropagation();
        setSelectedNode(d.data);
        toggleChildren(d.data);
      })
      .on("mouseover", function(event, d) {
        event.stopPropagation(); // Prevent node circle hover
        
        // Clear any existing highlight from node
        clearHighlight();
        
        // Highlight the visible indicator on hover
        d3.select(this.parentNode).select(".indicator-visible")
          .style("filter", "drop-shadow(0 3px 6px rgba(0,0,0,0.3))")
          .transition()
          .duration(150)
          .attr("r", function(d) {
            const isLogicNode = d.data.condition === "AND" || d.data.condition === "OR";
            return isLogicNode ? 10 : 12;
          });
      })
      .on("mouseout", function(event, d) {
        event.stopPropagation(); // Prevent node circle mouseout
        
        d3.select(this.parentNode).select(".indicator-visible")
          .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
          .transition()
          .duration(150)
          .attr("r", function(d) {
            const isLogicNode = d.data.condition === "AND" || d.data.condition === "OR";
            return isLogicNode ? 8 : 10;
          });
      });

    // Visible indicator (on the right side of node)
    nodeContainers.append("circle")
      .attr("class", "indicator-visible")
      .attr("cx", (d) => {
        // Position to the right of the node
        const isLogicNode = d.data.condition === "AND" || d.data.condition === "OR";
        return isLogicNode ? 28 : 35; // Right side of node
      })
      .attr("cy", 0) // Same vertical level as node center
      .attr("r", (d) => {
        // Indicator size
        const isLogicNode = d.data.condition === "AND" || d.data.condition === "OR";
        return isLogicNode ? 8 : 10;
      })
      .style("fill", (d) => {
        // Blue for collapsed, green for expanded
        return d._children ? "#3B82F6" : "#10B981";
      })
      .style("stroke", "#ffffff")
      .style("stroke-width", "2px")
      .style("opacity", (d) => {
        const hasChildren = (d.children && d.children.length > 0) || (d._children && d._children.length > 0);
        return hasChildren ? 1 : 0;
      })
      .style("display", (d) => {
        const hasChildren = (d.children && d.children.length > 0) || (d._children && d._children.length > 0);
        return hasChildren ? "block" : "none";
      })
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
      .style("pointer-events", "none"); // Don't capture events, let hitarea handle it

    // Add expand/collapse icons - "+" when collapsed, "-" when expanded (on the right)
    nodeContainers.append("text")
      .attr("x", (d) => {
        // Position to the right of the node
        const isLogicNode = d.data.condition === "AND" || d.data.condition === "OR";
        return isLogicNode ? 28 : 35; // Right side of node
      })
      .attr("y", 4) // Slightly below center for vertical alignment
      .style("font-family", "Arial, sans-serif")
      .style("font-size", (d) => {
        // Icon text size
        const isLogicNode = d.data.condition === "AND" || d.data.condition === "OR";
        return isLogicNode ? "14px" : "16px";
      })
      .style("font-weight", "bold")
      .style("text-anchor", "middle")
      .style("fill", "#ffffff")
      .style("pointer-events", "none")
      .style("opacity", (d) => {
        // Show if has children (expanded) or has _children (collapsed)
        const hasChildren = (d.children && d.children.length > 0) || (d._children && d._children.length > 0);
        return hasChildren ? 1 : 0;
      })
      .style("display", (d) => {
        const hasChildren = (d.children && d.children.length > 0) || (d._children && d._children.length > 0);
        return hasChildren ? "block" : "none";
      })
      .text((d) => d._children ? "+" : "−"); // Show "+" when collapsed, "−" when expanded

    // Add course name label below the circle
    nodeContainers.append("text")
      .attr("dy", (d) => {
        // Adjust label position based on node size
        const isLogicNode = d.data.condition === "AND" || d.data.condition === "OR";
        return isLogicNode ? 35 : 40;
      })
      .style("font-family", "Inter, -apple-system, BlinkMacSystemFont, sans-serif")
      .style("font-size", (d) => {
        // Smaller font for logic nodes
        const isLogicNode = d.data.condition === "AND" || d.data.condition === "OR";
        return isLogicNode ? "9px" : "11px";
      })
      .style("font-weight", (d) => {
        // Normal weight for logic nodes, bold for courses
        const isLogicNode = d.data.condition === "AND" || d.data.condition === "OR";
        return isLogicNode ? "500" : "600";
      })
      .style("text-anchor", "middle")
      .style("fill", (d) => {
        // Slightly lighter color for logic nodes
        const isLogicNode = d.data.condition === "AND" || d.data.condition === "OR";
        return isLogicNode ? "#6B7280" : "#374151";
      })
      .style("pointer-events", "none")
      .text((d) => d.data.name);

  }, [treeData, toggleChildren, highlightPath, clearHighlight, nodePositions, extractDepartment]);

  const setupZoom = useCallback(() => {
    const svg = d3.select(svgRef.current);
    const g = svg.select('.zoom-group');
    
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
    drawTree();
    setupZoom();
  }, [treeData, updateCounter, drawTree, setupZoom]);  // Update dependencies - add updateCounter

  return (
    <div className="relative w-full">
      {/* Action Buttons */}
      <div className="mb-3 sm:mb-4 flex justify-end gap-2 px-2 sm:px-0">
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
        
        <button
          onClick={resetNodePositions}
          className="px-3 py-2 sm:px-4 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-md hover:shadow-lg flex items-center gap-2 touch-manipulation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          <span className="hidden sm:inline">Reset</span>
          <span className="sm:hidden">🔄</span>
        </button>
      </div>

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
          </div>
          <div className="space-y-1">
            <p className="hidden sm:block"><strong>⌨️ Shift + Scroll:</strong> Zoom in/out</p>
            <p className="sm:hidden"><strong>👉 Pinch:</strong> Zoom in/out</p>
            <p><strong>✨ Animation:</strong> Smooth hover effects</p>
            <p><strong>🎨 Colors:</strong> By department (see legend below)</p>
            <p><strong>📷 Capture:</strong> Save tree as image</p>
            <p><strong>🔄 Reset:</strong> Restore layout & zoom</p>
          </div>
        </div>
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

          {/* Logic Node Types */}
          <div>
            <p className="font-semibold text-gray-700 mb-2 text-xs">Logic Nodes:</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-400 to-red-500 flex-shrink-0 shadow-sm border border-white"></div>
                <span className="text-xs text-gray-700"><strong>AND</strong> - All required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex-shrink-0 shadow-sm border border-white"></div>
                <span className="text-xs text-gray-700"><strong>OR</strong> - Any one required</span>
              </div>
            </div>
          </div>

          {/* Indicators */}
          <div>
            <p className="font-semibold text-gray-700 mb-2 text-xs">Node Indicators:</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">+</div>
                <span className="text-xs text-gray-700">Has hidden children</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">−</div>
                <span className="text-xs text-gray-700">Showing all children</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TreeView;
