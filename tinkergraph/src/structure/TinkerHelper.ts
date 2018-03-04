import TinkerEdge from './TinkerEdge';
import * as ElementHelper from './ElementHelper';

export function addEdge(graph, outVertex, inVertex, label, keyValues) {
  const idValue = 0;

  const edge: TinkerEdge = new TinkerEdge(idValue, outVertex, label, inVertex);
  ElementHelper.attachProperties(edge, keyValues);
  graph._edges.set(edge.id, edge);

  addOutEdge(outVertex, label, edge);
  addInEdge(inVertex, label, edge);

  return edge;
}

function addOutEdge(vertex, label, edge) {
  if (!vertex.outEdges) {
    vertex.outEdges = new Map();
  }

  let edges = vertex.outEdges.get(label);
  if (!edges) {
    edges = new Set();
    vertex.outEdges.set(label, edges);
  }

  edges.add(edge);
}

function addInEdge(vertex, label, edge) {
  if (!vertex.inEdges) {
    vertex.inEdges = new Map();
  }

  let edges = vertex.inEdges.get(label);
  if (!edges) {
    edges = new Set();
    vertex.inEdges.set(label, edges);
  }

  edges.add(edge);
}

function getVertexEdges(vertex, direction, edgeLabel) {
  return edges.iterator();
}
