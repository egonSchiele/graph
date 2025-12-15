import { describe, it, expect, vi } from "vitest";
import { Graph } from "./graph.js";
import { conditionalEdge, regularEdge } from "./types.js";

type State = {
  count: number;
  log: string[];
};

describe("Graph", () => {
  describe("node()", () => {
    it("registers a node that can be executed", async () => {
      const graph = new Graph<State, "start">(["start"]);
      graph.node("start", async (data) => ({
        ...data,
        count: data.count + 1,
      }));

      const result = await graph.run("start", { count: 0, log: [] });
      expect(result.count).toBe(1);
    });
  });

  describe("edge()", () => {
    it("creates a regular edge with string destination", async () => {
      const graph = new Graph<State, "a" | "b">(["a", "b"]);
      graph.node("a", async (data) => ({ ...data, log: [...data.log, "a"] }));
      graph.node("b", async (data) => ({ ...data, log: [...data.log, "b"] }));
      graph.edge("a", "b");

      const result = await graph.run("a", { count: 0, log: [] });
      expect(result.log).toEqual(["a", "b"]);
    });

    it("creates a conditional edge with function destination", async () => {
      const graph = new Graph<State, "start" | "high" | "low">(["start", "high", "low"]);
      graph.node("start", async (data) => data);
      graph.node("high", async (data) => ({ ...data, log: ["high"] }));
      graph.node("low", async (data) => ({ ...data, log: ["low"] }));

      graph.conditionalEdge("start", ["high", "low"], async (data) => (data.count >= 5 ? "high" : "low"));

      const highResult = await graph.run("start", { count: 10, log: [] });
      expect(highResult.log).toEqual(["high"]);

      const lowResult = await graph.run("start", { count: 2, log: [] });
      expect(lowResult.log).toEqual(["low"]);
    });

    it("handles edges for nodes defined later", async () => {
      const graph = new Graph<State, "a" | "b">(["a", "b"]);
      graph.edge("a", "b");
      graph.node("a", async (data) => ({ ...data, log: [...data.log, "a"] }));
      graph.node("b", async (data) => ({ ...data, log: [...data.log, "b"] }));

      const result = await graph.run("a", { count: 0, log: [] });
      expect(result.log).toEqual(["a", "b"]);
    });
  });

  describe("run()", () => {
    it("executes a single node and returns transformed data", async () => {
      const graph = new Graph<State, "only">(["only"]);
      graph.node("only", async (data) => ({
        count: data.count * 2,
        log: ["doubled"],
      }));

      const result = await graph.run("only", { count: 5, log: [] });
      expect(result).toEqual({ count: 10, log: ["doubled"] });
    });

    it("follows a chain of regular edges", async () => {
      const graph = new Graph<State, "a" | "b" | "c">(["a", "b", "c"]);
      graph.node("a", async (data) => ({ ...data, count: data.count + 1 }));
      graph.node("b", async (data) => ({ ...data, count: data.count + 2 }));
      graph.node("c", async (data) => ({ ...data, count: data.count + 3 }));

      graph.edge("a", "b");
      graph.edge("b", "c");

      const result = await graph.run("a", { count: 0, log: [] });
      expect(result.count).toBe(6);
    });

    it("handles loop with conditional exit (index.ts pattern)", async () => {
      const graph = new Graph<State, "start" | "increment" | "finish">(["start", "increment", "finish"]);

      graph.node("start", async (data) => ({
        ...data,
        log: [...data.log, "start"],
      }));

      graph.node("increment", async (data) => ({
        ...data,
        count: data.count + 1,
        log: [...data.log, `inc:${data.count + 1}`],
      }));

      graph.node("finish", async (data) => data);

      graph.edge("start", "increment");
      graph.conditionalEdge("increment", ["increment", "finish"], async (data) => {
        if (data.count < 3) {
          return "increment";
        } else {
          return "finish";
        }
      });

      const result = await graph.run("start", { count: 0, log: [] });
      expect(result.count).toBe(3);
      expect(result.log).toEqual(["start", "inc:1", "inc:2", "inc:3"]);
    });

    it("handles node without registered function", async () => {
      const graph = new Graph<State, "a" | "unregistered">(["a", "unregistered"]);
      graph.node("a", async (data) => ({ ...data, log: ["a"] }));
      graph.edge("a", "unregistered");

      const result = await graph.run("a", { count: 0, log: [] });
      expect(result.log).toEqual(["a"]);
    });
  });

  describe("prettyPrintEdge()", () => {
    it("formats regular edge with destination node id", () => {
      const graph = new Graph<State, "nodeA" | "nodeB">(["nodeA", "nodeB"]);
      const edge = regularEdge("nodeB");

      expect(graph.prettyPrintEdge(edge)).toBe("nodeB");
    });

    it("formats conditional edge with adjacent nodes", () => {
      const graph = new Graph<State, "someNode" | "otherNode">(["someNode", "otherNode"]);
      const edge = conditionalEdge<State, "someNode" | "otherNode">(async (data) => "someNode", ["someNode", "otherNode"]);

      expect(graph.prettyPrintEdge(edge)).toBe("someNode | otherNode");
    });
  });

  describe("prettyPrint()", () => {
    it("logs all edges to console", () => {
      const graph = new Graph<State, "a" | "b" | "c">(["a", "b", "c"]);
      graph.node("a", async (data) => data);
      graph.node("b", async (data) => data);
      graph.node("c", async (data) => data);

      graph.edge("a", "b");
      graph.conditionalEdge("b", ["c"], async (data) => "c");

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      graph.prettyPrint();

      expect(consoleSpy).toHaveBeenCalledWith("a -> b");
      expect(consoleSpy).toHaveBeenCalledWith("b -> c");

      consoleSpy.mockRestore();
    });
  });
});
