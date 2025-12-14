export type NodeId = string;
export type Edge<T> = RegularEdge | ConditionalEdge<T>;
export type RegularEdge = {
    type: "regular";
    to: NodeId;
};
export type ConditionalFunc<T> = (data: T) => Promise<NodeId>;
export type ConditionalEdge<T> = {
    type: "conditional";
    condition: ConditionalFunc<T>;
};
export declare function regularEdge(to: NodeId): RegularEdge;
export declare function conditionalEdge<T>(condition: ConditionalFunc<T>): ConditionalEdge<T>;
export declare function isRegularEdge<T>(edge: Edge<T>): edge is RegularEdge;
export declare function isConditionalEdge<T>(edge: Edge<T>): edge is ConditionalEdge<T>;
