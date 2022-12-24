import { Text, Box } from "@chakra-ui/react";
import React, { useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";

const Visualize = () => {
  const [graphData, setGraphData] = useState({
    nodes: [
      { data: { id: "1", label: "Marc Gasol", type: "ip" } },
      { data: { id: "2", label: "Pau Gasol", type: "device" } },
      { data: { id: "3", label: "Devin Ebanks", type: "ip" } },
    ],
    edges: [
      {
        data: { source: "1", target: "2"},
      },
      {
        data: { source: "3", target: "1" },
      },
    ],
  });

  const layout = {
    name: "cose",
    fit: true,
    directed: false,
    padding: 100,
    avoidOverlap: true,
    nodeDimensionsIncludeLabels: false,
  };

  return (
    <CytoscapeComponent
      elements={CytoscapeComponent.normalizeElements(graphData)}
      style={{ height: "90vh" }}
      layout={layout}
    />
  );
};

export default Visualize;
