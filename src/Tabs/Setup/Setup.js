import { Box, Button, Grid, GridItem, Text } from "@chakra-ui/react";
import { useContext, useRef } from "react";
import Select from "react-select";

import { DataContext } from "../../App";

import "./Setup.scss";

const Setup = (props) => {
  const {
    edgesData,
    nodesData,
    primaryChoice,
    setPrimaryChoice,
    setSecondaryChoice,
    exchangesValue,
    setExchangesValue,
  } = useContext(DataContext);

  function getRelatedNodes(node) {
    if (node.value.Name === "TradeNet") {
      return;
    }
    let res = node.value.Edges.map(function (index) {
      if (edgesData[index].From === node.value.Name) {
        return {
          value: { Name: edgesData[index].To },
          label: edgesData[index].To,
        };
      } else {
        return {
          value: { Name: edgesData[index].From },
          label: edgesData[index].From,
        };
      }
    });
    res.sort((a, b) => (a.value.Name > b.value.Name ? 1 : -1));
    res.unshift({ value: { Name: "Anybody", Edges: 0 }, label: "Anybody" });
    return res;
  }

  function batchPrimaryOptions() {
    let options = [];
    for (const key of Object.keys(nodesData)) {
      options.push({ value: { Name: key, Edges: nodesData[key] }, label: key });
    }
    options.sort((a, b) => (a.value.Name > b.value.Name ? 1 : -1));
    return options;
  }

  const secondarySelectRef = useRef();

  const primaryCalls = (primaryChoice) => {
    secondarySelectRef.current.setValue({
      value: { Name: "Anybody", Edges: 0 },
      label: "Anybody",
    });
    return setPrimaryChoice(primaryChoice);
  };

  return (
    <Grid gap={6} maxWidth="25rem">
      <GridItem>
        <Text fontSize="2xl" as="b" color="orange">
          Show trades for:
        </Text>
        <Select
          options={batchPrimaryOptions()}
          onChange={primaryCalls}
          className="primary-select"
        />
      </GridItem>
      <GridItem>
        <Text fontSize="2xl" as="b" color="orange">
          Linked with:
        </Text>
        <Select
          ref={secondarySelectRef}
          options={getRelatedNodes(primaryChoice)}
          onChange={(secondaryChoice) => setSecondaryChoice(secondaryChoice)}
          className="secondary-select"
        />
      </GridItem>
      <GridItem>
        <Text fontSize="2xl" as="b" color="orange">
          Additional Exchanges:
        </Text>
        <Box pt={6} pb={2}>
          <Button
            onClick={() => {
              if (exchangesValue > 0) {
                setExchangesValue(exchangesValue - 1);
              }
            }}
          >
            {"-"}
          </Button>
          <Text fontSize="2xl" as="b" color="orange" pl="1rem" pr="1rem">
            {exchangesValue}
          </Text>
          <Button
            onClick={() => {
              if (exchangesValue < 3) {
                setExchangesValue(exchangesValue + 1);
              }
            }}
          >
            {"+"}
          </Button>
        </Box>
      </GridItem>
    </Grid>
  );
};

export default Setup;
