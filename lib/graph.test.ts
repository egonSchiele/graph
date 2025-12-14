import { describe, it, expect, vi } from "vitest";
import { Graph } from "./graph.js";
import { conditionalEdge, regularEdge } from "./types.js";

type State = {
  count: number;
  log: string[];
};

describe("Graph", () => {
  describe("node()", () => {
    it("registers a node that can be executed", () => {
      const graph = new Graph<State>();
      graph.node("start", (data) => ({
        ...data,
        count: data.count + 1,
      }));

      const result = graph.run("start", { count: 0, log: [] });
      expect(result.count).toBe(1);
    });
  });

  describe("edge()", () => {
    it("creates a regular edge with string destination", () => {
      const graph = new Graph<State>();
      graph.node("a", (data) => ({ ...data, log: [...data.log, "a"] }));
      graph.node("b", (data) => ({ ...data, log: [...data.log, "b"] }));
      graph.edge("a", "b");

      const result = graph.run("a", { count: 0, log: [] });
      expect(result.log).toEqual(["a", "b"]);
    });

    it("creates a conditional edge with function destination", () => {
      const graph = new Graph<State>();
      graph.node("start", (data) => data);
      graph.node("high", (data) => ({ ...data, log: ["high"] }));
      graph.node("low", (data) => ({ ...data, log: ["low"] }));

      graph.edge("start", (data) => (data.count >= 5 ? "high" : "low"));

      const highResult = graph.run("start", { count: 10, log: [] });
      expect(highResult.log).toEqual(["high"]);

      const lowResult = graph.run("start", { count: 2, log: [] });
      expect(lowResult.log).toEqual(["low"]);
    });

    it("handles edges for nodes defined later", () => {
      const graph = new Graph<State>();
      graph.edge("a", "b");
      graph.node("a", (data) => ({ ...data, log: [...data.log, "a"] }));
      graph.node("b", (data) => ({ ...data, log: [...data.log, "b"] }));

      const result = graph.run("a", { count: 0, log: [] });
      expect(result.log).toEqual(["a", "b"]);
    });
  });

  describe("run()", () => {
    it("executes a single node and returns transformed data", () => {
      const graph = new Graph<State>();
      graph.node("only", (data) => ({
        count: data.count * 2,
        log: ["doubled"],
      }));

      const result = graph.run("only", { count: 5, log: [] });
      expect(result).toEqual({ count: 10, log: ["doubled"] });
    });

    it("follows a chain of regular edges", () => {
      const graph = new Graph<State>();
      graph.node("a", (data) => ({ ...data, count: data.count + 1 }));
      graph.node("b", (data) => ({ ...data, count: data.count + 2 }));
      graph.node("c", (data) => ({ ...data, count: data.count + 3 }));

      graph.edge("a", "b");
      graph.edge("b", "c");

      const result = graph.run("a", { count: 0, log: [] });
      expect(result.count).toBe(6);
    });

    it("handles loop with conditional exit (index.ts pattern)", () => {
      const graph = new Graph<State>();

      graph.node("start", (data) => ({
        ...data,
        log: [...data.log, "start"],
      }));

      graph.node("increment", (data) => ({
        ...data,
        count: data.count + 1,
        log: [...data.log, `inc:${data.count + 1}`],
      }));

      graph.node("finish", (data) => data);

      graph.edge("start", "increment");
      graph.edge("increment", (data) => {
        if (data.count < 3) {
          return "increment";
        } else {
          return "finish";
        }
      });

      const result = graph.run("start", { count: 0, log: [] });
      expect(result.count).toBe(3);
      expect(result.log).toEqual(["start", "inc:1", "inc:2", "inc:3"]);
    });

    it("handles node without registered function", () => {
      const graph = new Graph<State>();
      graph.node("a", (data) => ({ ...data, log: ["a"] }));
      graph.edge("a", "unregistered");

      const result = graph.run("a", { count: 0, log: [] });
      expect(result.log).toEqual(["a"]);
    });
  });

  describe("prettyPrintEdge()", () => {
    it("formats regular edge with destination node id", () => {
      const graph = new Graph<State>();
      const edge = regularEdge("nodeB");

      expect(graph.prettyPrintEdge(edge)).toBe("nodeB");
    });

    it("formats conditional edge as 'conditional'", () => {
      const graph = new Graph<State>();
      const edge = conditionalEdge<State>((data) => "someNode");

      expect(graph.prettyPrintEdge(edge)).toBe("conditional");
    });
  });

  describe("prettyPrint()", () => {
    it("logs all edges to console", () => {
      const graph = new Graph<State>();
      graph.node("a", (data) => data);
      graph.node("b", (data) => data);
      graph.node("c", (data) => data);

      graph.edge("a", "b");
      graph.edge("b", (data) => "c");

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      graph.prettyPrint();

      expect(consoleSpy).toHaveBeenCalledWith("a -> b");
      expect(consoleSpy).toHaveBeenCalledWith("b -> conditional");

      consoleSpy.mockRestore();
    });
  });
});
