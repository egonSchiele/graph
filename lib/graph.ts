export type NodeId = string;

export class Graph<T> {
  private nodes: Record<NodeId, (data: T) => T> = {};
  private edges: Record<NodeId, NodeId[]> = {};

  node(id: NodeId, func: (data: T) => T): void {
    this.nodes[id] = func;
    if (!this.edges[id]) {
      this.edges[id] = [];
    }
  }

  edge(from: NodeId, to: NodeId): void {
    if (!this.edges[from]) {
      this.edges[from] = [];
    }
    this.edges[from].push(to);
  }

  run(startId: NodeId, input: T): T {
    const stack: NodeId[] = [startId];
    let data: T = input;
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      const nodeFunc = this.nodes[currentId];

      if (nodeFunc) {
        data = nodeFunc(data);
      }

      const nextNodes = this.edges[currentId] || [];
      for (const nextId of nextNodes) {
        stack.push(nextId);
      }
    }
    return data;
  }

  prettyPrint(): void {
    for (const from in this.edges) {
      for (const to of this.edges[from]) {
        console.log(`${from} -> ${to}`);
      }
    }
  }
}
