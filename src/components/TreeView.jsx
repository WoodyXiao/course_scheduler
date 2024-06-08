import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

function TreeView({ data }) {
  const ref = useRef();
  // Initialize the tree data state
  const [treeData, setTreeData] = useState(() => d3.hierarchy(data));
  console.log("text", treeData);

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

  useEffect(() => {
    drawTree();
  }, [treeData]); // Redraw the tree when treeData changes

  const drawTree = () => {
    const margin = { top: 20, right: 90, bottom: 30, left: 90 };
    const width = 1200 - margin.right - margin.left;
    const height = 700 - margin.top - margin.bottom;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clear the SVG to redraw

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const treeLayout = d3.tree().size([height, width]);
    treeLayout(treeData);

    const links = g
      .selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr(
        "d",
        d3.linkHorizontal()
          .x((d) => d.y)
          .y((d) => d.x)
      )
      .attr("stroke", (d) => {
        if (d.source.data.condition === "OR") return "blue";
        if (d.source.data.condition === "AND") return "red";
        return "red"; // Default color
      })
      .attr("fill", "none")
      .attr("stroke-width", "1.5px");

    // Drawing nodes
    const node = g
      .selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .on("click", (event, d) => {
        event.stopPropagation(); // Prevent click event from propagating to other elements
        toggleChildren(d.data);
      });

    node
      .append("circle")
      .attr("r", (d) => (d.data.condition ? 0 : 15))
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

    node
      .append("text")
      .attr("dy", "0.31em")
      .style("text-anchor", "middle")
      .text((d) => {
        if (d.data.condition) return "";
        return d.data.name;
      })
      .style("pointer-events", "none");  // Make text non-interactive to ensure circle handles hover
  };

  return (
    <svg
      ref={ref}
      width="1200"
      height="700"
      style={{ border: "1px solid black" }}
    ></svg>
  );
}

export default TreeView;
