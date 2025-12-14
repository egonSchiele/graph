export function regularEdge(to) {
    return { type: "regular", to };
}
export function conditionalEdge(condition) {
    return { type: "conditional", condition };
}
export function isRegularEdge(edge) {
    return edge.type === "regular";
}
export function isConditionalEdge(edge) {
    return edge.type === "conditional";
}
