import React, { useState, useEffect, useContext } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { DataContext } from "../../App";
const Visualize = (props) => {
  const { primaryChoice, secondaryChoice, edgesData, nodesData } =
    useContext(DataContext);
  const [reset, setReset] = useState(true);

  useEffect(() => {
    buildGraph(primaryChoice.value, secondaryChoice.value);
  }, []);
  const [graphData, setGraphData] = useState({
    nodes: [],
    edges: [],
  });

  function buildGraph(root, neighbors) {
    // var queue = [];
    // const visited = new Set();
    var graph = {
      nodes: [{ data: { id: root.Name, label: root.Name } }],
      edges: [],
    };
    if (root.Name === "Default") {
      return graph;
    }
    if (neighbors.Name === "Anybody") {
      console.log(root);
      var neighbor;
      for (var i = 0; i < root.Edges.length; i++) {
        console.log(edgesData[root.Edges[i]]);
        var index = root.Edges[i];
        if (edgesData[index].From === root.Name) {
          neighbor = edgesData[index].To;
        } else {
          neighbor = edgesData[index].From;
        }
        graph.nodes.push({ data: { id: neighbor, label: neighbor } });
        graph.edges.push({ data: { source: root.Name, target: neighbor } });
      }
    } else {
      console.log(nodesData);
      graph.nodes.push({ data: { id: neighbors.Name, label: neighbors.Name } });
      graph.edges.push({ data: { source: root.Name, target: neighbors.Name } });
    }
    setGraphData(graph);
    reset ? setReset(false) : setReset(true);
    // return graph;
  }

  const layout = {
    name: "cose",
    fit: true,
    directed: false,
    padding: 11,
    avoidOverlap: true,
    nodeDimensionsIncludeLabels: false,
  };

  return (
    <div>
      <CytoscapeComponent
        key={reset}
        elements={CytoscapeComponent.normalizeElements(graphData)}
        style={{ height: "94vh" }}
        layout={layout}
      />
    </div>
  );
};

export default React.memo(Visualize);
