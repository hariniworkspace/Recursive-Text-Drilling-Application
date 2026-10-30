import {
  useCallback,
  useEffect,
  useMemo
} from "react";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";


/*
 * ==========================================
 * CREATE REACT FLOW NODES
 * ==========================================
 */

function createFlowNodes(nodes = []) {
  return nodes.map((node, index) => ({
    id: String(
      node.id ??
      `${node.type}-${index}`
    ),

    data: {
      label:
        node.value === ""
          ? "(empty)"
          : String(node.value),

      node
    },

    position: {
      x: (index % 4) * 220,

      y:
        Math.floor(index / 4) *
        120
    },

    type: "default"
  }));
}


/*
 * ==========================================
 * CREATE REACT FLOW EDGES
 * ==========================================
 */

function createFlowEdges(nodes = []) {
  return nodes
    .slice(1)
    .map((node, index) => ({
      id:
        `edge-${index}-${node.id}`,

      source:
        String(nodes[index].id),

      target:
        String(node.id),

      type: "smoothstep"
    }));
}


/*
 * ==========================================
 * DRILL FLOW
 * ==========================================
 */

export default function DrillFlow({
  nodes = [],
  level = "line",
  loading = false,
  onDrillDown
}) {

  /*
   * Convert API nodes into
   * React Flow nodes.
   */

  const convertedNodes = useMemo(
    () =>
      createFlowNodes(nodes),
    [nodes]
  );

  const convertedEdges = useMemo(
    () =>
      createFlowEdges(nodes),
    [nodes]
  );


  /*
   * React Flow state
   */

  const [
    flowNodes,
    setFlowNodes,
    onNodesChange
  ] = useNodesState(
    convertedNodes
  );

  const [
    flowEdges,
    setFlowEdges,
    onEdgesChange
  ] = useEdgesState(
    convertedEdges
  );


  /*
   * ==========================================
   * IMPORTANT FIX
   * ==========================================
   *
   * Whenever the API returns new nodes,
   * update React Flow's internal state.
   */

  useEffect(() => {
    setFlowNodes(
      createFlowNodes(nodes)
    );

    setFlowEdges(
      createFlowEdges(nodes)
    );
  }, [
    nodes,
    setFlowNodes,
    setFlowEdges
  ]);


  /*
   * ==========================================
   * DOUBLE CLICK NODE
   * ==========================================
   */

  const handleNodeDoubleClick =
    useCallback(
      async (
        _event,
        selectedNode
      ) => {

        if (
          !onDrillDown ||
          !selectedNode?.data?.node
        ) {
          return;
        }

        await onDrillDown(
          selectedNode.data.node
        );
      },
      [onDrillDown]
    );


  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <div className="flex h-[560px] items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-500">
        Loading drill-down...
      </div>
    );
  }


  /*
   * ==========================================
   * UI
   * ==========================================
   */

  return (
    <div className="h-[560px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}

      <div className="border-b border-slate-200 px-4 py-3">

        <h2 className="font-semibold capitalize text-slate-900">
          {level} view
        </h2>

        <p className="text-xs text-slate-500">
          Double-click a node to drill into the next level.
        </p>

      </div>


      {/* No nodes */}

      {flowNodes.length === 0 ? (

        <div className="flex h-[500px] items-center justify-center text-sm text-slate-500">
          No nodes available for this level.
        </div>

      ) : (

        <div className="h-[500px]">

          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}

            onNodesChange={
              onNodesChange
            }

            onEdgesChange={
              onEdgesChange
            }

            onNodeDoubleClick={
              handleNodeDoubleClick
            }

            fitView

            deleteKeyCode={null}
          >

            <Background
              gap={20}
              size={1}
            />

            <Controls />

            <MiniMap />

          </ReactFlow>

        </div>

      )}

    </div>
  );
}