import { Graph } from "./lib/graph.js";

type State = {
  count: number;
  log: string[];
};

const graph = new Graph<State>();

graph.node("start", (data) => {
  return {
    ...data,
    log: [...data.log, "Starting computation"],
  };
});

graph.node("increment", (data) => {
  return {
    ...data,
    count: data.count + 1,
    log: [...data.log, `Incremented count to ${data.count + 1}`],
  };
});

graph.edge("start", "increment");

const initialState: State = { count: 0, log: [] };
const finalState = graph.run("start", initialState);

console.log(finalState);

graph.prettyPrint();
