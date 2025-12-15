var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { conditionalEdge, isRegularEdge, regularEdge, } from "./types.js";
export class Graph {
    constructor(nodes, config = {}) {
        this.nodes = {};
        this.edges = {};
        this.config = config;
    }
    node(id, func) {
        this.nodes[id] = func;
        if (!this.edges[id]) {
            this.edges[id] = [];
        }
    }
    edge(from, to) {
        if (!this.edges[from]) {
            this.edges[from] = [];
        }
        this.edges[from].push(regularEdge(to));
    }
    conditionalEdge(from, adjacentNodes, to) {
        if (!this.edges[from]) {
            this.edges[from] = [];
        }
        this.edges[from].push(conditionalEdge(to, adjacentNodes));
    }
    debug(str, data) {
        let debugStr = `[DEBUG]: ${str}`;
        if (this.config.logData && data !== undefined) {
            debugStr += ` | Data: ${JSON.stringify(data)}`;
        }
        if (this.config.debug) {
            console.log(debugStr);
        }
    }
    run(startId, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const stack = [startId];
            let data = input;
            while (stack.length > 0) {
                const currentId = stack.pop();
                const nodeFunc = this.nodes[currentId];
                if (nodeFunc) {
                    this.debug(`Executing node: ${currentId}`, data);
                    data = yield nodeFunc(data);
                    this.debug(`Completed node: ${currentId}`, data);
                }
                const edges = this.edges[currentId] || [];
                for (const edge of edges) {
                    if (isRegularEdge(edge)) {
                        stack.push(edge.to);
                        this.debug(`Following regular edge to: ${edge.to}`);
                    }
                    else {
                        const nextId = yield edge.condition(data);
                        this.debug(`Following conditional edge to: ${nextId}`, data);
                        stack.push(nextId);
                    }
                }
            }
            return data;
        });
    }
    prettyPrint() {
        for (const from in this.edges) {
            for (const to of this.edges[from]) {
                console.log(`${from} -> ${this.prettyPrintEdge(to)}`);
            }
        }
    }
    prettyPrintEdge(edge) {
        if (isRegularEdge(edge)) {
            return edge.to;
        }
        else {
            return edge.adjacentNodes.join(" | ");
        }
    }
    toMermaid() {
        let mermaid = "graph TD\n";
        for (const from in this.edges) {
            for (const to of this.edges[from]) {
                if (isRegularEdge(to)) {
                    mermaid += `  ${from} --> ${to.to}\n`;
                }
                else {
                    to.adjacentNodes.forEach((adjNode) => {
                        mermaid += `  ${from} --> ${adjNode}\n`;
                    });
                }
            }
        }
        return mermaid;
    }
}
