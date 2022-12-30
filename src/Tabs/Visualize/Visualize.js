import React, { useState, useEffect, useContext, useRef } from "react";
import { DataContext } from "../../App";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";

const Visualize = () => {
  const { primaryChoice, secondaryChoice, edgesData, nodesData } =
    useContext(DataContext);
  const [reset, setReset] = useState(true);
  const [graphData, setGraphData] = useState([{ data: { id: "a" } }]);
  const cytoRef = useRef(null);
  cytoscape.use(fcose);

  useEffect(() => {
    const buildCyto = (elements) => {
      let cy = cytoscape({
        container: cytoRef.current,
        elements: elements,
        style: [
          {
            selector: "node", // select nodes
            style: {
              label: "data(label)", // display the label field as the node label
            },
          },
          {
            selector: "edge",
            style: {
              "curve-style": "bezier",
            },
          },
        ],
        layout: { name: "fcose" },
      });
    };
    const buildGraph = (root, neighbors) => {
      let graph = [{ data: { id: root.Name, label: root.Name } }];
      let queue = [];
      let visited = new Set();
      if (root.Name === "Default") {
        return graph;
      }
      if (neighbors.Name === "Anybody") {
        let neighbor;
        for (let i = 0; i < root.Edges.length; i++) {
          console.log(edgesData[root.Edges[i]]);
          let index = root.Edges[i];
          if (edgesData[index].From === root.Name) {
            neighbor = edgesData[index].To;
          } else {
            neighbor = edgesData[index].From;
          }
          graph.push({ data: { id: neighbor, label: neighbor } });
          graph.push({ data: { source: root.Name, target: neighbor } });
        }
      } else {
        graph.push({
          data: { id: neighbors.Name, label: neighbors.Name },
        });
        graph.push({
          data: { source: root.Name, target: neighbors.Name },
        });
      }

      return graph;
    };

    buildCyto(buildGraph(primaryChoice.value, secondaryChoice.value));
  }, []);

  return <div ref={cytoRef} style={{ height: "94vh" }}></div>;
};

export default React.memo(Visualize);
