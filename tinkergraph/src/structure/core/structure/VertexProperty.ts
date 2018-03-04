import Element from './Element';
import Graph from './Graph';
import Property from './Property';
import Vertex from './Vertex';

interface VertexProperty<V> extends Property<V>, Element {
  element: Vertex;

  graph(): Graph;

  label(): string;

  empty<V>(): VertexProperty<V>;

  properties<U>(...propertyKeys: string[]): Iterator<Property<U>>; // correct
  // properties<U>(...propertyKeys: string[]): Iterator<new () => Property<U>>;
}

export function empty<V>() {
  //
  throw new Error('Not yet implemented');
}

export enum Cardinality {
  single,
  list,
  set,
}

export default VertexProperty;
