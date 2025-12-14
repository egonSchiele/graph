import { ConditionalFunc, Edge, NodeId } from "./types.js";
export declare class Graph<T> {
    private nodes;
    private edges;
    node(id: NodeId, func: (data: T) => T): void;
    edge(from: NodeId, to: NodeId | ConditionalFunc<T>): void;
    run(startId: NodeId, input: T): T;
    prettyPrint(): void;
    prettyPrintEdge(edge: Edge<T>): string;
}
