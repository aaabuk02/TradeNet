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
import Visualize from "./Tabs/Visualize/Visualize";

function App() {
  return (
    <Box>
      <ChakraProvider>
        <Tabs colorScheme="orange" size="md" variant="enclosed" pt="1rem">
          <TabList>
            <Text fontSize="2xl" as="b" pl=".5rem" pr=".5rem" color="orange">
              TradeNet
            </Text>
            <Tab as="b">About</Tab>
            <Tab as="b">Setup</Tab>
            <Tab as="b">Visualize</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <About />
            </TabPanel>
            <TabPanel></TabPanel>
            <TabPanel p={0}>
              <Visualize />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </ChakraProvider>
    </Box>
  );
}

export default App;
