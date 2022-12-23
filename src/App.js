import { ChakraProvider, Text, Tabs, TabList, Tab, TabPanel, TabPanels } from "@chakra-ui/react";

function App() {
  return (
    <div className="App">
      <ChakraProvider>
        <Tabs colorScheme='orange' size='md' variant='enclosed' pt = "1rem" >
        <TabList>
          <Text fontSize="2xl" as='b' pl = "1rem" pr = "1rem" color='orange'>TradeNet 🏀</Text>
          <Tab as='b'>About</Tab>
          <Tab as='b'>Setup</Tab>
          <Tab as='b'>Visualize</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
          <Text fontSize="6xl" as='b'>Welcome To TradeNet 🏀</Text>
          </TabPanel>
          <TabPanel>
            <p>two!</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
      </ChakraProvider>
    </div>
  );
}

export default App;
