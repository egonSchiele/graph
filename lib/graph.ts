import {
  conditionalEdge,
  ConditionalFunc,
  Edge,
  isRegularEdge,
  NodeId,
  regularEdge,
} from "./types.js";

export class Graph<T> {
  private nodes: Record<NodeId, (data: T) => Promise<T>> = {};
  private edges: Record<NodeId, Edge<T>[]> = {};

  node(id: NodeId, func: (data: T) => Promise<T>): void {
    this.nodes[id] = func;
    if (!this.edges[id]) {
      this.edges[id] = [];
    }
  }

  edge(from: NodeId, to: NodeId | ConditionalFunc<T>): void {
    if (!this.edges[from]) {
      this.edges[from] = [];
    }
    if (typeof to === "function") {
      this.edges[from].push(conditionalEdge(to));
    } else {
      this.edges[from].push(regularEdge(to));
    }
  }

  async run(startId: NodeId, input: T): Promise<T> {
    const stack: NodeId[] = [startId];
    let data: T = input;
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      const nodeFunc = this.nodes[currentId];

      if (nodeFunc) {
        data = await nodeFunc(data);
      }

      const edges = this.edges[currentId] || [];
      for (const edge of edges) {
        if (isRegularEdge(edge)) {
          stack.push(edge.to);
        } else {
          const nextId = await edge.condition(data);
          stack.push(nextId);
        }
      }
    }
    return data;
  }

  prettyPrint(): void {
    for (const from in this.edges) {
      for (const to of this.edges[from]) {
        console.log(`${from} -> ${this.prettyPrintEdge(to)}`);
      }
    }
  }

  prettyPrintEdge(edge: Edge<T>): string {
    if (isRegularEdge(edge)) {
      return edge.to;
    } else {
      return "conditional";
    }
  }
}
