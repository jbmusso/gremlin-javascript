import Vertex from './Vertex';
import Direction from './Direction';
import Property from './Property';
import Element from './Element';

export default interface Edge extends Element {
  // ** EXTRA **
  _properties: Map<string, Property>; // Extra. Ok?
  _inVertex: Vertex;
  _outVertex: Vertex;
  _label: string;
  _removed: boolean;
  _setProperty<V>(key: String, value: V): Property<V>;
  equals(object: any): boolean;
  // ** /EXTRA **

  // TODO: implementation
  vertices(direction: Direction): Iterator<Vertex>;

  // TODO: implementation
  outVertex(): Vertex; // SKIP

  // TODO: implementation
  inVertex(): Vertex; // SKIP

  // abstract impl. done in TinkerEdge
  bothVertices(): Iterator<Vertex>;

  properties<V>(...propertyKeys: string[]): Iterator<Property<V>>;

  // tslint:disable-next-line
};
