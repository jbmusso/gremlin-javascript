import Vertex from './Vertex';
import KeyValues from './KeyValues';

// import TraversalSource from '../process/traversal/TraversalSource';
import { Maybe } from '../../../types';
import Edge from './Edge';

interface Graph {
  // addVertex(keyValues?: KeyValues<any>): Vertex;
  // addVertex(label: string, keyValues?: KeyValues<any>): Vertex;
  // addVertex(keyValues?: KeyValues<any>): Vertex;
  addVertex(labelOrKeyValues?: string | KeyValues<any>, keyValues?: KeyValues<any>): Vertex;

  // TODO: default impl.
  // traversal<C extends TraversalSource>(): C;

  vertices(...vertexIds: object[] /*TODO: safer type?*/): Iterator<Vertex>;

  edges(...edgeIds: object[]): Iterator<Edge>;

  // tx(): Transaction;

  close(): void;

  // io<I extends Io>(builder: Io.Builder<I>): I;

  variables(): Variables;

  configuration(): object;

  features(): Features;
}

export interface Variables {
  keys(): Set<string>;

  get<R>(key: string): Maybe<R>;

  set(key: string, value: object): void;

  remove(key: string): void;

  asMap(): Map<string, object>;
}

export interface Features {
  graph(): GraphFeatures;

  vertex(): VertexFeatures;

  edge(): EdgeFeatures;
}

export interface GraphFeatures {
  // TODO
}

export interface VertexFeatures {
  // TODO
}

export interface EdgeFeatures {
  // TODO
}

export default Graph;
