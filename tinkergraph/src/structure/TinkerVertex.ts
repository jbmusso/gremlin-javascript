import TinkerVertexProperty from './TinkerVertexProperty';
import TinkerElement from './TinkerElement';
import * as TinkerHelper from './TinkerHelper';
import TinkerGraph, { TinkerId } from './TinkerGraph';
import VertexProperty, { Cardinality } from './core/structure/VertexProperty';
import Edge from './core/structure/Edge';
import KeyValues from './core/structure/KeyValues';
import Vertex from './core/structure/Vertex';
import Direction from './core/structure/Direction';
import Graph from './core/structure/Graph';

class TinkerVertex extends TinkerElement implements Vertex {
  _properties: Map<string, VertexProperty<any /* ? */>[]>;
  outEdges: Map<string, Set<Edge>>;
  inEdges: Map<string, Set<Edge>>;
  _graph: TinkerGraph;

  constructor(id: any, label: string, graph: TinkerGraph) {
    super(id, label);
    this._graph = graph;
    this._properties = new Map();
    this.outEdges = new Map();
    this.inEdges = new Map();
  }

  graph(): Graph {
    return this._graph;
  }

  // Signatures
  property<V>(key: string, value?: any): VertexProperty<V>;
  property<V>(keyValues?: KeyValues<any>, cardinality?: Cardinality): VertexProperty<V>;
  // Implementation
  property<V>(keyOrKeyValues?: string | KeyValues<any>, valueOrCardinality?: any | Cardinality): VertexProperty<V> {
    if (typeof keyOrKeyValues === 'string' && !valueOrCardinality) {
      // property(key)
      const _key: string = keyOrKeyValues as string;
      return this.__getProperty(_key);
    }

    if (typeof keyOrKeyValues === 'string' && valueOrCardinality) {
      const _key: string = keyOrKeyValues as string;
      const _value = valueOrCardinality;
      return this.__setProperty(_key, _value);
    }

    throw new Error('Not fully implemented');

    return;
  }

  __getProperty<V>(key: string): VertexProperty<V> {
    if (this._removed) {
      return VertexProperty.empty();
    }
    const p = this._properties.get(key);

    return p[0];
  }

  __setProperty<V>(key: string, value: any): VertexProperty<V> {
    if (this._removed) {
      throw new Error('Vertex element already removed');
    }

    // TODO:
    // ElementHelper.legalPropertyKeyValueArray(keyValues);
    // ElementHelper.validateProperty(key, value);

    // TODO: support for optional id

    const propertyId = this._graph.vertexPropertyIdManager.getNextId(this._graph);

    // TODO: check impl.
    // this._properties.set(key, value);

    const property = new TinkerVertexProperty(propertyId, this, key, value);

    if (!this._properties.has(key)) {
      this._properties.set(key, []);
    }

    this._properties.get(key).push(property);

    return property;
  }

  addEdge(label: string, vertex: Vertex, keyValues?: KeyValues<any>): Edge {
    if (!vertex) {
      throw new Error('Must supply a vertex to add an edge to');
    }

    return TinkerHelper.addEdge(this._graph, this, vertex, label, keyValues);
  }

  remove() {
    // TODO: impl.
  }

  edges(direction: Direction, ...edgeLabels: string[]): Iterator<Edge> {
    const edgeIterator = TinkerHelper.getEdges(this, direction, edgeLabels);
    return edgeIterator;
  }

  vertices(): Iterator<Vertex> {
    //
    return;
  }

  properties<V>(...propertyKeys: string[]): Iterator<VertexProperty<V>> {
    if (this._removed) {
      return [].values();
    }

    if (this._properties === null) {
      return [].values();
    }

    if (propertyKeys.length === 1) {
      const properties: VertexProperty<V>[] = this._properties.get(propertyKeys[0]) || [];

      if (properties.length === 1) {
        return [properties[0]].values();
      } else if (properties.length === 0) {
        return [].values();
      } else {
        return properties.values();
      }
    } else {
      // TODO: impl.
      // https://github.com/apache/tinkerpop/blob/master/tinkergraph-gremlin/src/main/java/org/apache/tinkerpop/gremlin/tinkergraph/structure/TinkerVertex.java#L180

      return;
    }
  }

  keys(): Set<string> {
    throw new Error('Not yet implemented');
  }
}

export default TinkerVertex;
