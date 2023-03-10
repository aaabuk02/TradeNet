import {
  Box,
  ChakraProvider,
  Flex,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import Papa from "papaparse";
import React, { useState, createContext, useEffect, Suspense } from "react";

import About from "./Tabs/About/About";

export const DataContext = createContext();

function App() {
  const Setup = React.lazy(() => import("./Tabs/Setup/Setup"));
  const Visualize = React.lazy(() => import("./Tabs/Visualize/Visualize"));

  const [isGraphVisible, setIsGraphVisible] = useState(false);
  const [tradesData, setTradesData] = useState();
  const [edgesData, setEdgesData] = useState([
    { Name: "TradeNet", Edges: "0" },
  ]);
  const [nodesData, setNodesData] = useState([
    { Name: "TradeNet", Edges: "0" },
  ]);

  const [primaryChoice, setPrimaryChoice] = useState({
    value: { Name: "TradeNet", Edges: "0" },
    label: "TradeNet",
  });
  const [secondaryChoice, setSecondaryChoice] = useState({
    value: { Name: "Anybody", Edges: "0" },
    label: "Anybody",
  });
  const [exchangesValue, setExchangesValue] = useState(0);

  useEffect(() => {
    let response;
    async function fetchTrades() {
      try {
        response = await fetch(
          "https://raw.githubusercontent.com/aaabuk02/trade-net/master/scrape/trades.csv"
        );
      } catch (error) {
        console.error(error);
      }
      let parsedTrades = Papa.parse(await response.clone().text(), {
        header: true,
        skipEmptyLines: true,
      }).data;
      let key_to_trade = {};
      let key;
      for (let i = 0; i < parsedTrades.length; i++) {
        key = parsedTrades[i][0];
        let trades = [];
        let j = 1;
        let curr = parsedTrades[i][j];
        while (curr) {
          trades.push(curr);
          j += 1;
          curr = parsedTrades[i][j];
        }
        key_to_trade[key] = trades;
      }
      setTradesData(key_to_trade);
    }
    async function fetchEdges() {
      try {
        response = await fetch(
          "https://raw.githubusercontent.com/aaabuk02/trade-net/master/scrape/edges.csv"
        );
      } catch (error) {
        console.error(error);
      }
      let parsedEdges = Papa.parse(await response.clone().text(), {
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

      let players_to_edges = {};
      for (let i = 0; i < parsedNodes.length; i++) {
        players_to_edges[parsedNodes[i].Name] =
          parsedNodes[i].Edges.split(", ").map(Number);
      }
      setNodesData(players_to_edges);
      return;
    }
    fetchTrades();
    fetchEdges();
    fetchNodes();
  }, []);

  return (
    <ChakraProvider>
      <Box>
        <DataContext.Provider
          value={{
            tradesData,
            setTradesData,
            edgesData,
            setEdgesData,
            nodesData,
            setNodesData,
            primaryChoice,
            setPrimaryChoice,
            secondaryChoice,
            setSecondaryChoice,
            exchangesValue,
            setExchangesValue,
          }}
        >
          <Tabs colorScheme="orange" size="md" pt="1rem">
            <TabList>
              <Text fontSize="2xl" as="b" pl=".5rem" pr=".5rem" color="orange">
                TradeNet
              </Text>
              <Tab as="b">About</Tab>
              <Tab as="b" onClick={() => setIsGraphVisible(false)}>
                Setup
              </Tab>
              <Tab as="b" onClick={() => setIsGraphVisible(true)}>
                Visualize
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={"2rem"}>
                <About />
              </TabPanel>
              <TabPanel p={"2rem"}>
                <Suspense
                  fallback={
                    <Flex
                      alignContent={"center"}
                      justifyContent={"center"}
                      m={"10rem"}
                    >
                      <Spinner color="orange.500" />
                    </Flex>
                  }
                >
                  <Setup />
                </Suspense>
              </TabPanel>
              <Suspense
                fallback={
                  <Flex
                    alignContent={"center"}
                    justifyContent={"center"}
                    m={"10rem"}
                  >
                    <Spinner color="orange.500" />
                  </Flex>
                }
              >
                <TabPanel p={0}>{isGraphVisible && <Visualize />}</TabPanel>
              </Suspense>
            </TabPanels>
          </Tabs>
        </DataContext.Provider>
      </Box>
    </ChakraProvider>
  );
}

export default App;
