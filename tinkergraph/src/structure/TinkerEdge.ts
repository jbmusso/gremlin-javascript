import Vertex from './core/structure/Vertex';

import TinkerElement from './TinkerElement';
import TinkerProperty from './TinkerProperty';
import Property from './core/structure/Property';
import Edge from './core/structure/Edge';
import TinkerVertex from './TinkerVertex';
import * as TinkerHelper from './TinkerHelper';
import Graph from './core/structure/Graph';
import Direction from './core/structure/Direction';

class TinkerEdge extends TinkerElement implements Edge {
  _properties: Map<string, Property>;
  _inVertex: Vertex;
  _outVertex: Vertex;

  constructor(id: object | number | string, outVertex: Vertex, label: string, inVertex: Vertex) {
    super(id, label);
    this._outVertex = outVertex;
    this._inVertex = inVertex;
    this._properties = new Map();
    // todo: autoupdate index
  }

  property<V>(key: string, value?: V): Property<V> {
    if (!value) {
      const property = this._properties.get(key);

      return property;
    }

    const property = new TinkerProperty(this, key, value);
    this._properties.set(key, property);

    return property;
  }

  _setProperty<V>(key: String, value: V): Property<V> {
    // ElementHelper.validateProperty(key, value);

    const oldProperty = super.property(key);
    const newProperty = new TinkerProperty(this, key, value);

    // this.properties.put(key, Arrays.asList(newProperty));
    this._properties.set(key, [newProperty]);
    // this.graph.edgeIndex.autoUpdate(key, value, oldProperty.isPresent() ? oldProperty.value() : null, this); // todo: reenable index

    return newProperty;
  }

  remove(): void {
    const outVertex = this._outVertex as TinkerVertex;
    const inVertex = this._inVertex as TinkerVertex;

    if (outVertex !== null && outVertex.outEdges !== null) {
      const edges: Set<Edge> = outVertex.outEdges.get(this.label);
      if (edges !== null) {
        edges.remove(this);
      }
    }

    if (inVertex !== null && inVertex.inEdges !== null) {
      const edges: Set<Edge> = inVertex.inEdges.get(this.label);
      if (edges !== null) {
        edges.remove(this);
      }
    }

    TinkerHelper.removeElementIndex(this);
    this.graph()._edges.remove(this.id);
  }

  toString(): string {
    // TODO: impl.
  }

  outVertex(): Vertex {
    return this._outVertex;
  }

  inVertex(): Vertex {
    return this._inVertex;
  }

  vertices(direction: Direction): Iterator<Vertex> {
    if (this.removed) {
      return [].values();
    }

    switch (direction) {
      case Direction.OUT:
        return [this._outVertex].values();
      case Direction.IN:
        return [this._inVertex].values();
      default:
        return [this._outVertex, this._inVertex].values();
    }
  }

  graph(): Graph {
    const inVertex = this._inVertex as TinkerVertex;

    return inVertex._graph;
  }

  bothVertices() {
    return this.vertices(Direction.BOTH);
  }

  properties<V>(...propertyKeys: string[]): Iterator<Property<V>> {
    if (this._properties === null) {
      return [].values(); // empty iterator
    }

    if (propertyKeys.length === 1) {
      const property: Property<V> = this._properties.get(propertyKeys[0]);
      return property == null ? [].values() : [property].values();
    } else {
      // TODO: impl.
      // https://github.com/apache/tinkerpop/blob/master/tinkergraph-gremlin/src/main/java/org/apache/tinkerpop/gremlin/tinkergraph/structure/TinkerEdge.java#L140
      return;
    }
  }
}

export default TinkerEdge;
