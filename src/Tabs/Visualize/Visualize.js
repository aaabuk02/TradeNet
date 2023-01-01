import React, { useEffect, useContext, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Visualize.scss"
import { DataContext } from "../../App";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";

const Visualize = () => {
  const { primaryChoice, secondaryChoice, edgesData, nodesData, sliderValue } =
    useContext(DataContext);
  // const [reset, setReset] = useState(true);
  // const [graphData, setGraphData] = useState([{ data: { id: "a" } }]);
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
              'label': "data(label)", // display the label field as the node label
              'text-wrap': 'wrap',
              'text-valign': 'center',
              'font-size': 10,
              'background-color': 'rgb(255, 95, 31)',
              'color' : 'rgb(0, 0, 0)',
              'text-outline-color': 'rgb(255, 95, 31)',
              'text-outline-width': 2,
              'width': 35,
              'height': 35,
            },
          },
          {
            selector: "edge",
            style: {
              "curve-style": "bezier",
              'opacity': 0.55,
              // 'lineColor' : 'rgb(245, 85, 21)',

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
      cy.on("tap", "edge", (event) => {
        toast(event.target.data('label'), {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: true,
          zfIndex: 3,
        });
      });
    };
    const buildGraph = (root, neighbors) => {
      let graph = [{ data: { id: root.Name, label: root.Name.split(' ').join('\n') } }];
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
          data: { id: neighbors.Name, label: neighbors.Name.split(' ').join('\n') },
        });
      }

      let layers = 0;
      while (queue.length > 0 && layers <= sliderValue) {
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
            graph.push({ data: { id: neighbor, label: neighbor.split(' ').join('\n') } });
            queue.push(neighbor);
          }
          let currEdge = edgesData[index];
          if (!edgesVisited.has(currEdge)) {
            edgesVisited.add(currEdge);
            graph.push({
              data: {
                source: currNode,
                target: neighbor,
                id: currEdge.Key,
                label: "On " + currEdge.Date + ": " + currEdge.Label
              },
            });
          }
        }
        layers += 1;
      }
      return graph;
    };

    buildCyto(buildGraph(primaryChoice.value, secondaryChoice.value));
  }, [edgesData, nodesData]);

  return (
    <div>
      <div ref={cytoRef} className="graph"></div> <ToastContainer limit={3}/>
    </div>
  );
};

export default React.memo(Visualize);
