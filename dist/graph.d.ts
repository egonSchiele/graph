import { ConditionalFunc, Edge, GraphConfig, NodeId } from "./types.js";
export declare class Graph<T> {
    private nodes;
    private edges;
    private config;
    constructor(config?: GraphConfig);
    node(id: NodeId, func: (data: T) => Promise<T>): void;
    edge(from: NodeId, to: NodeId | ConditionalFunc<T>): void;
    debug(str: string, data?: T): void;
    run(startId: NodeId, input: T): Promise<T>;
    prettyPrint(): void;
    prettyPrintEdge(edge: Edge<T>): string;
}
