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
    constructor() {
        this.nodes = {};
        this.edges = {};
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
        if (typeof to === "function") {
            this.edges[from].push(conditionalEdge(to));
        }
        else {
            this.edges[from].push(regularEdge(to));
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
                    data = yield nodeFunc(data);
                }
                const edges = this.edges[currentId] || [];
                for (const edge of edges) {
                    if (isRegularEdge(edge)) {
                        stack.push(edge.to);
                    }
                    else {
                        const nextId = yield edge.condition(data);
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
            return "conditional";
        }
    }
}
