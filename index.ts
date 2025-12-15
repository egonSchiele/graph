import { Graph } from "./lib/graph.js";

type State = {
  count: number;
  log: string[];
};

const nodes = ["start", "increment", "finish"] as const;
type Node = typeof nodes[number];
const graph = new Graph<State, Node>(nodes);

graph.node("start", async (data) => {
  return {
    ...data,
    log: [...data.log, "Starting computation"],
  };
});

graph.node("increment", async (data) => {
  return {
    ...data,
    count: data.count + 1,
    log: [...data.log, `Incremented count to ${data.count + 1}`],
  };
});

graph.node("finish", async (data) => data);

graph.edge("start", "increment");
graph.conditionalEdge("increment", ["finish", "increment"], async (data) => {
  if (data.count < 5) {
    return "increment";
  } else {
    return "finish";
  }
});

async function main() {
  const initialState: State = { count: 0, log: [] };
  const finalState = await graph.run("start", initialState);
  console.log(finalState);
}

graph.prettyPrint();
//main();
console.log(graph.toMermaid());