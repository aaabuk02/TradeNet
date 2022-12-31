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
        layout: {
          name: "fcose",
          fit: true,
          directed: false,
          avoidOverlap: true,
        },
      });
    };
    const buildGraph = (root, neighbors) => {
      let graph = [{ data: { id: root.Name, label: root.Name } }];
      let queue = [];
      let nodesVisited = new Set();
      let edgesVisited = new Set();
      if (root.Name === "Default") {
        return graph;
      }
      //Add root to queue, add root to visited,
      if (neighbors.Name === "Anybody") {
        queue.push(root.Name);
        nodesVisited.add(root.Name);
      } else {
        //neighbor to queue and nodesVisited, root to nodesVisited
        queue.push(neighbors.Name);
        nodesVisited.add(neighbors.Name);
        nodesVisited.add(root.Name);
        graph.push({
          data: { id: neighbors.Name, label: neighbors.Name },
        });
      }
      while (queue.length > 0) {
        let currNode = queue.shift();
        for (let i = 0; i < nodesData[currNode].length; i++) {
          let index = nodesData[currNode][i];
          let neighbor;
          if (edgesData[index].From === currNode) {
            neighbor = edgesData[index].To;
          } else {
            neighbor = edgesData[index].From;
          }
          if (!nodesVisited.has(neighbor)) {
            nodesVisited.add(neighbor);
            graph.push({ data: { id: neighbor, label: neighbor } });
            queue.push(neighbor);
          }
          let currEdge = edgesData[index].Key;
          if (!edgesVisited.has(currEdge)) {
            edgesVisited.add(currEdge);
            graph.push({
              data: { source: currNode, target: neighbor, id: currEdge },
            });
          }
        }
      }
      return graph;
    };

    buildCyto(buildGraph(primaryChoice.value, secondaryChoice.value));
  }, []);

  return <div ref={cytoRef} style={{ height: "94vh" }}></div>;
};

export default React.memo(Visualize);
