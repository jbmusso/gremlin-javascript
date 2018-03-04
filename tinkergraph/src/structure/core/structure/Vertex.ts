import Edge from './Edge';
import Property from './Property';
import Direction from './Direction';
import VertexProperty, { Cardinality } from './VertexProperty';

import KeyValues from './KeyValues';
import Element from './Element';
import { TinkerId } from '../../TinkerGraph';
// import Graph from './Graph';

export default interface Vertex extends Element {
  addEdge(label: string, inVertex: Vertex, keyValues?: KeyValues<any>): Edge;

  // TODO: implement all
  // property<V>(keyValues?: KeyValues<any>): Property<V>; // ???
  property<V>(key: string, value?: V): Property<V>;
  property<V>(keyValues?: KeyValues<any>, cardinality?: Cardinality): Property<V>;
  // property<V>(keyOrKeyValues?: string | KeyValues<any>, valueOrCardinality?: any | Cardinality): Property<V>;

  // TODO: workaround for overload
  // property<V>(cardinality?: TinkerVertexProperty.Cardinality, key: string, value?: V, keyValues?: KeyValues): Property<V>;

  edges(direction: Direction, ...edgeLabels: string[]): Iterator<Edge>;

  vertices(direction: Direction, ...edgeLabels: string[]): Iterator<Vertex>;

  // properties<V>(...propertyKeys: string[]): Iterator<VertexProperty<V>>; // in code, but OK commented

  // tslint:disable-next-line
};
