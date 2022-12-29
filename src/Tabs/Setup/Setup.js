import { Text, Button } from "@chakra-ui/react";
import { useContext, useRef } from "react";
import { DataContext } from "../../App";
import Select from "react-select";

const Setup = (props) => {
  const {
    edges,
    nodes,
    primaryChoice,
    setPrimaryChoice,
    secondaryChoice,
    setSecondaryChoice,
    setIsTabDisabled,
    setIsGraphVisible,
  } = useContext(DataContext);

  function getRelatedNodes(node) {
    if (node.value.Name === "Default") {
      return;
    }
    var res = node.value.Edges.map(function (index) {
      if (edges[index].From === node.value.Name) {
        return { value: { Name: edges[index].To }, label: edges[index].To };
      } else {
        return { value: { Name: edges[index].From }, label: edges[index].From };
      }
    });
    res.sort((a, b) => (a.value.Name > b.value.Name ? 1 : -1));
    res.unshift({ value: { Name: "Anybody", Edges: 0 }, label: "Anybody" });
    return res;
  }

  function batchPrimaryOptions() {
    var options = [];
    for (const key of Object.keys(nodes)) {
      options.push({ value: { Name: key, Edges: nodes[key] }, label: key });
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
        <Select options={batchPrimaryOptions()} onChange={primaryCalls} />
        <Text fontSize="2xl" as="b" pl=".5rem" pr=".5rem" color="orange">
          {primaryChoice?.value?.Name}
        </Text>
        <Select
          ref={secondarySelectRef}
          options={getRelatedNodes(primaryChoice)}
          onChange={(secondaryChoice) => setSecondaryChoice(secondaryChoice)}
        />
        <Text fontSize="2xl" as="b" pl=".5rem" pr=".5rem" color="orange">
          {secondaryChoice?.value?.Name}
        </Text>
        <Button onClick={() => buildGraph()}>Build Graph</Button>
      </div>
    </div>
  );
};

export default Setup;
