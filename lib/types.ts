export type NodeId = string;
export type Edge<T> = RegularEdge | ConditionalEdge<T>;

export type RegularEdge = {
  type: "regular";
  to: NodeId;
};

export type ConditionalFunc<T> = (data: T) => NodeId;
export type ConditionalEdge<T> = {
  type: "conditional";
  condition: ConditionalFunc<T>;
};

export function regularEdge(to: NodeId): RegularEdge {
  return { type: "regular", to };
}

export function conditionalEdge<T>(
  condition: ConditionalFunc<T>
): ConditionalEdge<T> {
  return { type: "conditional", condition };
}

export function isRegularEdge<T>(edge: Edge<T>): edge is RegularEdge {
  return edge.type === "regular";
}

export function isConditionalEdge<T>(
  edge: Edge<T>
): edge is ConditionalEdge<T> {
  return edge.type === "conditional";
}
