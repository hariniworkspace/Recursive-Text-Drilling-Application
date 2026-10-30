import { useMemo } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  Handle,
  Position
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

function CommonWordNode({ data }) {
  return (
    <div className="min-w-36 rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-3 text-center shadow-sm">
      <Handle type="target" position={Position.Top} />

      <p className="font-semibold text-indigo-950">
        {data.word || "(empty)"}
      </p>

      {Array.isArray(data.documents) && data.documents.length > 0 && (
        <p className="mt-1 text-xs text-indigo-700">
          {data.documents.length}{" "}
          {data.documents.length === 1 ? "document" : "documents"}
        </p>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = {
  commonWord: CommonWordNode
};

function normalizeGraphData(graph) {
  if (!graph || typeof graph !== "object") {
    return {
      nodes: [],
      edges: []
    };
  }

  const sourceNodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const sourceEdges = Array.isArray(graph.edges) ? graph.edges : [];

  const nodes = sourceNodes.map((node, index) => ({
    id: String(node.id ?? `common-word-${index}`),
    type: node.type ?? "commonWord",
    position: {
      x: Number(node.position?.x ?? (index % 4) * 220),
      y: Number(node.position?.y ?? Math.floor(index / 4) * 150)
    },
    data: {
      ...node.data,
      word: node.word ?? node.data?.word ?? node.label ?? "",
      documents: node.documents ?? node.data?.documents ?? []
    }
  }));

  const edges = sourceEdges
    .map((edge, index) => ({
      id: String(
        edge.id ?? `common-edge-${edge.source}-${edge.target}-${index}`
      ),
      source: String(edge.source),
      target: String(edge.target),
      type: edge.type ?? "smoothstep",
      animated: Boolean(edge.animated),
      label: edge.label
    }))
    .filter((edge) => edge.source && edge.target);

  return { nodes, edges };
}

export default function CommonWordsGraph({
  graph,
  height = 520,
  onNodeClick,
  className = ""
}) {
  const graphData = useMemo(() => normalizeGraphData(graph), [graph]);

  if (graphData.nodes.length === 0) {
    return (
      <section
        className={`flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center ${className}`}
        style={{ minHeight: height }}
      >
        <div>
          <p className="font-medium text-slate-700">
            No common words to display
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Load multiple documents containing at least one shared word.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white ${className}`}
      style={{ height }}
      aria-label="Common words graph"
    >
      <ReactFlow
        nodes={graphData.nodes}
        edges={graphData.edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        onNodeClick={(_, node) => onNodeClick?.(node)}
        proOptions={{ hideAttribution: true }}
      >
        <MiniMap
          nodeColor={(node) =>
            node.type === "commonWord" ? "#6366f1" : "#94a3b8"
          }
        />
        <Controls />
        <Background gap={20} size={1} />
      </ReactFlow>
    </section>
  );
}