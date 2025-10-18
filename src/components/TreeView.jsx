import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

function TreeView({ data }) {
  const svgRef = useRef();
  const [treeData, setTreeData] = useState(() => d3.hierarchy(data));
  const [updateCounter, setUpdateCounter] = useState(0);
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightedNodes, setHighlightedNodes] = useState(new Set());
  const [draggedNode, setDraggedNode] = useState(null);
  const [nodePositions, setNodePositions] = useState({}); // Store custom positions

  useEffect(() => {
    // This effect runs when `data` prop changes.
    setTreeData(d3.hierarchy(data));  // Recreate the hierarchy with the new data
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
    setUpdateCounter(prev => prev + 1);
  }, []);

  const drawTree = useCallback(() => {
    const margin = { top: 40, right: 120, bottom: 40, left: 120 };
    const width = 1200 - margin.right - margin.left;
    const height = 1000 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear the SVG to redraw

    // Add gradient definitions for better visual appeal
    const defs = svg.append("defs");
    
    // Course gradient
    const courseGradient = defs.append("linearGradient")
      .attr("id", "courseGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%");
    
    courseGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#4F46E5")
      .attr("stop-opacity", 1);
    
    courseGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#7C3AED")
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
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const treeLayout = d3.tree().size([width, height]);
    treeLayout(treeData);

    // Apply custom positions to nodes before drawing links
    treeData.descendants().forEach(d => {
      const customPos = nodePositions[d.data.name];
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
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        highlightPath(d);
      })
      .on("mouseout", function() {
        clearHighlight();
      })
      .call(d3.drag()
        .clickDistance(10) // Allow clicks if mouse moves less than 10 pixels
        .on("start", function(event, d) {
          setDraggedNode(d);
          d3.select(this).raise();
          d3.select(this).style("cursor", "grabbing");
          
          // Store the initial mouse position relative to the node
          d3.select(this).datum().dragOffsetX = event.x;
          d3.select(this).datum().dragOffsetY = event.y;
          // Store original position for reset
          d3.select(this).datum().originalX = d.x;
          d3.select(this).datum().originalY = d.y;
          // Track if actually dragged
          d3.select(this).datum().wasDragged = false;
          
          // Add visual feedback for dragging
          d3.select(this).select("rect")
            .style("filter", "drop-shadow(0 8px 16px rgba(0,0,0,0.3))")
            .style("stroke", "#FBBF24")
            .style("stroke-width", "3px");
        })
        .on("drag", function(event, d) {
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
          d3.select(this).style("cursor", "pointer");
          
          // If actually dragged, save the new position
          if (wasDragged) {
            const newX = d.originalX + (event.x - d.dragOffsetX);
            const newY = d.originalY + (event.y - d.dragOffsetY);
            
            // Update the node's position
            d.x = newX;
            d.y = newY;
            
            // Save position to state
            setNodePositions(prev => ({
              ...prev,
              [d.data.name]: { x: newX, y: newY }
            }));
            
            // Keep node at new position
            d3.select(this).attr("transform", `translate(${newX},${newY})`);
            
            // Update links to new positions (vertical layout)
            g.selectAll(".link")
              .filter(function(linkData) {
                return linkData.source === d || linkData.target === d;
              })
              .attr("d", d3.linkVertical().x(d => d.x).y(d => d.y));
          }
          
          // Reset visual feedback
          d3.select(this).select("circle")
            .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.15))")
            .style("stroke", "#ffffff")
            .style("stroke-width", "2px");
          
          // If not dragged (just clicked), toggle the node
          if (!wasDragged) {
            setSelectedNode(d.data);
            toggleChildren(d.data);
          }
          
          // Clean up
          delete d.wasDragged;
        })
      );

    // Create modern node containers
    const nodeContainers = node.append("g").attr("class", "node-container");

    // Add circular background
    nodeContainers.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 25)
      .style("fill", (d) => {
        if (d.data.condition === "AND") return "url(#andGradient)";
        if (d.data.condition === "OR") return "url(#orGradient)";
        return "url(#courseGradient)";
      })
      .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.15))")
      .style("stroke", "#ffffff")
      .style("stroke-width", "2px")
      .on("mouseover", function() {
        d3.select(this)
          .style("filter", "drop-shadow(0 6px 12px rgba(0,0,0,0.25))")
          .transition()
          .duration(200)
          .attr("r", 28);
      })
      .on("mouseout", function() {
        d3.select(this)
          .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.15))")
          .transition()
          .duration(200)
          .attr("r", 25);
      });

    // Add expand/collapse indicators - only show when node has hidden children (at bottom)
    nodeContainers.append("circle")
      .attr("cx", 0)
      .attr("cy", 24)
      .attr("r", 8)
      .style("fill", "#3B82F6") // Blue for collapsed (has hidden children)
      .style("stroke", "#ffffff")
      .style("stroke-width", "2px")
      .style("opacity", (d) => d._children ? 1 : 0) // Only show when collapsed
      .style("display", (d) => d._children ? "block" : "none")
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
      .style("cursor", "pointer")
      .on("click", function(event, d) {
        event.stopPropagation();
        toggleChildren(d.data);
      });

    // Add expand/collapse icons - only show "+" when node is collapsed (at bottom)
    nodeContainers.append("text")
      .attr("x", 0)
      .attr("y", 27)
      .style("font-family", "Arial, sans-serif")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("text-anchor", "middle")
      .style("fill", "#ffffff")
      .style("pointer-events", "none")
      .style("opacity", (d) => d._children ? 1 : 0) // Only show when collapsed
      .style("display", (d) => d._children ? "block" : "none")
      .text((d) => d._children ? "+" : ""); // Show "+" when collapsed

    // Add course name label below the circle
    nodeContainers.append("text")
      .attr("dy", "40")
      .style("font-family", "Inter, -apple-system, BlinkMacSystemFont, sans-serif")
      .style("font-size", "11px")
      .style("font-weight", "600")
      .style("text-anchor", "middle")
      .style("fill", "#374151")
      .style("pointer-events", "none")
      .text((d) => d.data.name);

  }, [treeData, toggleChildren, highlightPath, clearHighlight, nodePositions]);

  const setupZoom = useCallback(() => {
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom()
      .scaleExtent([0.1, 3])
      .filter(event => event.shiftKey)  // Only zoom when Shift key is pressed
      .on("zoom", (event) => {
        d3.select(svgRef.current).select('g')
          .attr("transform", event.transform);
      });
    svg.call(zoom);
  }, [svgRef]);

  useEffect(() => {
    drawTree();
    setupZoom();
  }, [treeData, updateCounter, drawTree, setupZoom]);  // Update dependencies - add updateCounter

  return (
    <div className="relative">
      {/* Reset Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={resetNodePositions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Reset Positions
        </button>
      </div>
      
      {/* Legend */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Legend:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <p className="font-semibold text-gray-600 mb-2">Node Types:</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                <span>Course</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-400 to-red-500"></div>
                <span>AND Logic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-green-500"></div>
                <span>OR Logic</span>
              </div>
            </div>
          </div>
          <div>
            <p className="font-semibold text-gray-600 mb-2">Indicators:</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">+</div>
                <span>Node is collapsed (has hidden children)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white"></div>
                <span>Node is expanded or has no children</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tree Container */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <svg
          ref={svgRef}
          width="1200"
          height="1000"
          className="w-full h-auto"
        ></svg>
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Selected Node:</h4>
          <p className="text-sm text-blue-700">
            <strong>Name:</strong> {selectedNode.name}<br/>
            <strong>Condition:</strong> {selectedNode.condition || "None"}
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">🎮 Interactive Features:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-700">
          <div className="space-y-1">
            <p><strong>🖱️ Mouse Hover:</strong> Highlight connected paths</p>
            <p><strong>🖱️ Click:</strong> Expand/collapse nodes</p>
            <p><strong>🖱️ Drag:</strong> Move nodes with connecting lines</p>
          </div>
          <div className="space-y-1">
            <p><strong>⌨️ Shift + Scroll:</strong> Zoom in/out</p>
            <p><strong>✨ Animation:</strong> Smooth hover effects</p>
            <p><strong>🎨 Colors:</strong> Blue=Course, Red=AND, Green=OR</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TreeView;
