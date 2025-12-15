import {
  conditionalEdge,
  ConditionalFunc,
  Edge,
  GraphConfig,
  isRegularEdge,
  NodeId,
  regularEdge,
} from "./types.js";

export class Graph<T, N extends string> {
  private nodes: Partial<Record<N, (data: T) => Promise<T>>> = {};
  private edges: Partial<Record<N, Edge<T, N>[]>> = {};
  private config: GraphConfig;

  constructor(nodes: readonly N[], config: GraphConfig = {}) {
    this.config = config;
  }

  node(id: N, func: (data: T) => Promise<T>): void {
    this.nodes[id] = func;
    if (!this.edges[id]) {
      this.edges[id] = [];
    }
  }

  edge(from: N, to: N): void {
    if (!this.edges[from]) {
      this.edges[from] = [];
    }
    this.edges[from].push(regularEdge(to));
  }

  conditionalEdge(from: N, adjacentNodes: N[], to: ConditionalFunc<T, N>): void {
    if (!this.edges[from]) {
      this.edges[from] = [];
    }
    this.edges[from].push(conditionalEdge(to, adjacentNodes));
  }

  debug(str: string, data?: T): void {
    let debugStr = `[DEBUG]: ${str}`;
    if (this.config.logData && data !== undefined) {
      debugStr += ` | Data: ${JSON.stringify(data)}`;
    }
    if (this.config.debug) {
      console.log(debugStr);
    }
  }

  async run(startId: N, input: T): Promise<T> {
    const stack: N[] = [startId];
    let data: T = input;
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      const nodeFunc = this.nodes[currentId];

      if (nodeFunc) {
        this.debug(`Executing node: ${currentId}`, data);
        data = await nodeFunc(data);
        this.debug(`Completed node: ${currentId}`, data);
      }

      const edges = this.edges[currentId] || [];
      for (const edge of edges) {
        if (isRegularEdge(edge)) {
          stack.push(edge.to);
          this.debug(`Following regular edge to: ${edge.to}`);
        } else {
          const nextId = await edge.condition(data);
          this.debug(`Following conditional edge to: ${nextId}`, data);
          stack.push(nextId);
        }
      }
    }
    return data;
  }

  prettyPrint(): void {
    for (const from in this.edges) {
      for (const to of this.edges[from as keyof typeof this.edges]!) {
        console.log(`${from} -> ${this.prettyPrintEdge(to)}`);
      }
    }
  }

  prettyPrintEdge(edge: Edge<T, N>): string {
    if (isRegularEdge(edge)) {
      return edge.to;
    } else {
      return edge.adjacentNodes.join(" | ");
    }
  }
}
