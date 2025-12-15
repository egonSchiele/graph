import { ConditionalFunc, Edge, GraphConfig } from "./types.js";
export declare class Graph<T, N extends string> {
    private nodes;
    private edges;
    private config;
    constructor(nodes: readonly N[], config?: GraphConfig);
    node(id: N, func: (data: T) => Promise<T>): void;
    edge(from: N, to: N): void;
    conditionalEdge(from: N, adjacentNodes: N[], to: ConditionalFunc<T, N>): void;
    debug(str: string, data?: T): void;
    run(startId: N, input: T): Promise<T>;
    prettyPrint(): void;
    prettyPrintEdge(edge: Edge<T, N>): string;
    toMermaid(): string;
}
