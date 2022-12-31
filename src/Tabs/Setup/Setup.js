import {
  Text,
  Button,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box,
} from "@chakra-ui/react";
import { useContext, useRef} from "react";
import { DataContext } from "../../App";
import Select from "react-select";

const Setup = (props) => {
  const {
    edgesData,
    nodesData,
    primaryChoice,
    setPrimaryChoice,
    setSecondaryChoice,
    setIsTabDisabled,
    setIsGraphVisible,
    sliderValue,
    setSliderValue,
  } = useContext(DataContext);

  function getRelatedNodes(node) {
    if (node.value.Name === "Default") {
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

  function buildGraph() {
    setIsTabDisabled(false);
    setIsGraphVisible(false);
  }

  return (
    <div>
      <div>
        <Text fontSize="2xl" as="b" pl=".5rem" pr=".5rem" color="orange">
          Show trades for:
        </Text>
        <Select options={batchPrimaryOptions()} onChange={primaryCalls} />
        <Text fontSize="2xl" as="b" pl=".5rem" pr=".5rem" color="orange">
          Linked with:
        </Text>
        <Select
          ref={secondarySelectRef}
          options={getRelatedNodes(primaryChoice)}
          onChange={(secondaryChoice) => setSecondaryChoice(secondaryChoice)}
        />
        <Text fontSize="2xl" as="b" pl=".5rem" pr=".5rem" color="orange">
          Additional Exchanges: {sliderValue}
        </Text>
        <Box pt={6} pb={2}>
          <Slider
            defaultValue={0}
            min={0}
            max={10}
            step={1}
            onChange={(val) => setSliderValue(val)}
          >
            <SliderTrack bg="orange.100">
              <SliderFilledTrack bg="orange" />
            </SliderTrack>
            <SliderThumb boxSize={6} />
          </Slider>
        </Box>
        <Button onClick={() => buildGraph()}>Build Graph</Button>
      </div>
    </div>
  );
};

export default Setup;
