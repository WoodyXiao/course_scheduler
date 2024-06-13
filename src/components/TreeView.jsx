import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

function TreeView({ data }) {
  const svgRef = useRef();
  const [treeData, setTreeData] = useState(() => d3.hierarchy(data));

  // Function to toggle children on and off
  const toggleChildren = (node) => {
    if (node.children) {
      node._children = node.children;
      node.children = null;
    } else {
      node.children = node._children;
      node._children = null;
    }
    // Force React state update by creating a new hierarchy
    setTreeVirtualRoot(node);
  };

  const setTreeVirtualRoot = (node) => {
    setTreeData(d3.hierarchy(treeData.data));
  };

  const drawTree = useCallback(() => {
    const margin = { top: 10, right: 10, bottom: 30, left: 50 };
    const width = 1200 - margin.right - margin.left;
    const height = 900 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear the SVG to redraw

    const g = svg.append("g");

    const treeLayout = d3.tree().size([height, width]);
    treeLayout(treeData);

    const links = g.selectAll(".link")
      .data(treeData.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x))
      .attr("stroke", (d) => d.source.data.condition === "OR" ? "blue" : "red")
      .attr("fill", "none")
      .attr("stroke-width", "1.5px");

    const node = g.selectAll(".node")
      .data(treeData.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .on("click", (event, d) => {
        event.stopPropagation();
        toggleChildren(d.data);
      });

    node.append("circle")
      .attr("r", (d) => (d.data.condition ? 0 : 8))
      .style("fill", (d) => (d.children ? "#555" : "#999"))
      .on("mouseover", function (event, d) {
        svg.selectAll(".node circle")
          .filter((dd) => dd.data.name === d.data.name)
          .style("fill", "orange")
          .style("stroke-width", 3);
      })
      .on("mouseout", function (event, d) {
        svg.selectAll(".node circle")
          .filter((dd) => dd.data.name === d.data.name)
          .style("fill", (dd) => (dd.children ? "#555" : "#999"))
          .style("stroke", null)
          .style("font-weight", null)
          .style("stroke-width", null);
      });

    node.append("text")
      .attr("dy", "0.31em")
      .style("text-anchor", "middle")
      .text((d) => {
        if (d.data.condition) return d.data.name;
        return d.data.name;
      })
      .style("pointer-events", "none");  // Make text non-interactive to ensure circle handles hover
  }, [treeData]);

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
  }, [treeData, drawTree, setupZoom]);

  return (
    <svg
      ref={svgRef}
      width="1200"
      height="900"
      style={{ border: "1px solid black" }}
    ></svg>
  );
}

export default TreeView;
