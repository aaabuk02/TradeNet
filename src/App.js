import {
  ChakraProvider,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
  Box,
} from "@chakra-ui/react";
import About from "./Tabs/About/About";
import Setup from "./Tabs/Setup/Setup";
import Visualize from "./Tabs/Visualize/Visualize";
import React, { useState, createContext, useEffect } from "react";
import Papa from "papaparse";

export const DataContext = createContext();

function App() {
  const [isGraphVisible, setIsGraphVisible] = useState(false);
  const [isTabDisabled, setIsTabDisabled] = useState(true);
  const [edgesData, setEdgesData] = useState([{ Name: "Default", Edges: "0" }]);
  const [nodesData, setNodesData] = useState({ Name: "Default", Edges: "0" });

  const [primaryChoice, setPrimaryChoice] = useState({
    value: { Name: "Default", Edges: "0" },
    label: "Default",
  });
  const [secondaryChoice, setSecondaryChoice] = useState({
    value: { Name: "Anybody", Edges: "0" },
    label: "Anybody",
  });

  useEffect(() => {
    let response;
    async function fetchEdges() {
      try {
        response = await fetch(
          "https://raw.githubusercontent.com/aaabuk02/trade-net/master/scrape/edges.csv"
        );
      } catch (error) {
        console.error(error);
      }
      var parsedEdges = Papa.parse(await response.clone().text(), {
        header: true,
        skipEmptyLines: true,
      }).data;
      setEdgesData(parsedEdges);
    }
    async function fetchNodes() {
      try {
        response = await fetch(
          "https://raw.githubusercontent.com/aaabuk02/trade-net/master/scrape/nodes.csv"
        );
      } catch (error) {
        console.error(error);
      }
      const text = await response.text();
      const parsedNodes = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
      }).data;
      // console.log(parsedNodes)

      var players_to_edges = {};
      for (var i = 0; i < parsedNodes.length; i++) {
        players_to_edges[parsedNodes[i].Name] =
          parsedNodes[i].Edges.split(", ").map(Number);
      }
      setNodesData(players_to_edges);
      // console.log(players_to_edges)
      return;
    }

    fetchEdges();
    fetchNodes();
  }, []);

  return (
    <ChakraProvider>
      <Box>
        <DataContext.Provider
          value={{
            edgesData,
            setEdgesData,
            nodesData,
            setNodesData,
            primaryChoice,
            setPrimaryChoice,
            secondaryChoice,
            setSecondaryChoice,
            isTabDisabled,
            setIsTabDisabled,
            isGraphVisible,
            setIsGraphVisible,
          }}
        >
          <Tabs colorScheme="orange" size="md" pt="1rem">
            <TabList>
              <Text fontSize="2xl" as="b" pl=".5rem" pr=".5rem" color="orange">
                TradeNet
              </Text>
              <Tab as="b">About</Tab>
              <Tab as="b">Setup</Tab>
              <Tab
                isDisabled={isTabDisabled}
                as="b"
                onClick={() => setIsGraphVisible(true)}
              >
                Visualize
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <About />
              </TabPanel>
              <TabPanel>
                <Setup />
              </TabPanel>
              <TabPanel p={0}>{isGraphVisible && <Visualize />}</TabPanel>
            </TabPanels>
          </Tabs>
        </DataContext.Provider>
      </Box>
    </ChakraProvider>
  );
}

export default App;
