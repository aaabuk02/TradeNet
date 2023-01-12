import React, { useEffect, useContext, useRef } from "react";

import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  List,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import "./Visualize.scss";
import { DataContext } from "../../App";
import cytoscape from "cytoscape";
import klay from "cytoscape-klay";

const Visualize = () => {
  const {
    primaryChoice,
    secondaryChoice,
    tradesData,
    edgesData,
    nodesData,
    exchangesValue,
  } = useContext(DataContext);

  let tradeDetailsMap = new Map();

  const cytoRef = useRef(null);
  const drawerRef = useRef(null);
  cytoscape.use(klay);

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
              "text-wrap": "wrap",
              "text-valign": "center",
              "font-size": 10,
              "background-color": "rgb(255, 95, 31)",
              color: "rgb(0, 0, 0)",
              "text-outline-color": "rgb(255, 95, 31)",
              "text-outline-width": 2,
              width: 35,
              height: 35,
            },
          },
          {
            selector: "edge",
            style: {
              "curve-style": "bezier",
              opacity: 0.45,
              lineColor: "rgb(31, 81, 255)",
            },
          },
        ],
        layout: {
          name: "klay",
          fit: true,
          directed: false,
          avoidOverlap: true,
          klay: {
            direction: cytoRef.current.clientWidth < 500 ? "RIGHT" : "DOWN",
          },
        },
      });
      cy.on("tap", "edge", (event) => {
        let key = event.target.data("id");
        key = key.substring(0, key.indexOf("="));
        drawerRef.current.openDrawer();
        drawerRef.current.setBody(key);
      });
    };

    const buildGraph = (root, neighbors) => {
      let graph = [
        { data: { id: root.Name, label: root.Name.split(" ").join("\n") } },
      ];
      let queue = [];
      let nodesVisited = new Set();
      let edgesVisited = new Set();
      if (root.Name === "TradeNet") {
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
          data: {
            id: neighbors.Name,
            label: neighbors.Name.split(" ").join("\n"),
          },
        });
      }

      let layers = 0;
      while (queue.length > 0 && layers <= exchangesValue) {
        let currQueueLength = queue.length;
        for (let j = 0; j < currQueueLength; j++) {
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
              graph.push({
                data: { id: neighbor, label: neighbor.split(" ").join("\n") },
              });
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
                  label: "On " + currEdge.Date + ": " + currEdge.Label,
                },
              });
            }
          }
        }
        layers += 1;
      }
      return graph;
    };

    if (primaryChoice.value.Edges === "0") {
      return;
    }

    buildCyto(buildGraph(primaryChoice.value, secondaryChoice.value));
  });

  //Need to use class component for drawer as using hooks would cause the graph to re-render every time you open it.
  class MyDrawer extends React.Component {
    state = {
      isOpen: false,
      currentBody: <Text>Body</Text>,
    };

    openDrawer = () => {
      this.setState({ isOpen: true });
    };

    closeDrawer = () => {
      this.setState({ isOpen: false });
    };

    setBody = (key) => {
      if (tradeDetailsMap.has(key)) {
        this.setState({ currentBody: tradeDetailsMap.get(key) });
        return;
      }

      let data = tradesData[key].map((res) => res.split(";"));
      const map = data.map((array, index) => {
        let heading = array.shift();
        return (
          <ListItem key={index}>
            <UnorderedList>
              <Text as="b" fontSize="xl">
                {heading}
              </Text>
              {array.map((contents, index) => {
                return (
                  <ListItem key={index} ml="1rem">
                    <Text key={index}>
                      {}
                      {contents}
                    </Text>
                  </ListItem>
                );
              })}
            </UnorderedList>
          </ListItem>
        );
      });
      tradeDetailsMap.set(
        key,
        <Box pb="1.5rem">
          <Text as="b" fontSize="xl">
            On {key.slice(0, key.indexOf("_"))}
          </Text>
          <List spacing={"1rem"} pt="1.5rem">
            {map}
          </List>
        </Box>
      );
      this.setState({ currentBody: tradeDetailsMap.get(key) });
      return;
    };

    render() {
      return (
        <>
          <Drawer
            isOpen={this.state.isOpen}
            onClose={this.closeDrawer}
            placement="right"
            size="xs"
            variant="aside"
            trapFocus={false}
            blockScrollOnMount={false}
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerHeader>Trade Details</DrawerHeader>
              <DrawerCloseButton />
              <DrawerBody>{this.state.currentBody}</DrawerBody>
            </DrawerContent>
          </Drawer>
        </>
      );
    }
  }

  return (
    <Box>
      <Box ref={cytoRef} className="graph"></Box>
      <MyDrawer ref={drawerRef} />
    </Box>
  );
};

export default Visualize;
