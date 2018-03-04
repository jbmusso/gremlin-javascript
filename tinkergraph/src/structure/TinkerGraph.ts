import TinkerVertex from './TinkerVertex';
import TinkerIndex from './TinkerIndex';
import TinkerEdge from './TinkerEdge';

import { Maybe } from '../types';
import KeyValues from './core/structure/KeyValues';
import Graph, { Variables, Features } from './core/structure/Graph';
import Vertex from './core/structure/Vertex';
import { Cardinality } from './core/structure/VertexProperty';
import Edge from './core/structure/Edge';

class NumberIdManager implements IdManager<number> {
  getNextId(graph: TinkerGraph): number {
    graph.currentId = graph.currentId + 1;

    // // TODO: make this lazy
    const ids: number[] = Array.from(Array(graph.currentId).keys());
    const [nextId] = ids
      .filter((value: number) => {
        return !graph._vertices.has(value + 1) && !graph._edges.has(value + 1);
      })
      .slice(-1); // get last

    return nextId;
  }

  convert(id: string | number): Maybe<number> {
    if (id === null) {
      return null;
    } else if (typeof id === 'number') {
      return id;
    } else if (typeof id === 'string') {
      return parseInt(id, 10);
    } else {
      throw new Error(`Expected an id that is convertible to Integer but received ${typeof id}`);
    }
  }

  allow(id: number | string) {
    return typeof id === 'number' || typeof id === 'string';
  }
}

const numberIdManager = new NumberIdManager();

export interface BaseConfig {
  vertexIdManager: IdManager<number>; // todo: wildcard
  edgeIdManager: IdManager<number>;
  vertexPropertyIdManager: IdManager<number>;
}

const baseConfig: BaseConfig = {
  vertexIdManager: numberIdManager,
  edgeIdManager: numberIdManager,
  vertexPropertyIdManager: numberIdManager,
};

export type TinkerId = number | string;

class TinkerGraph implements Graph {
  _vertices: Map<any, TinkerVertex>;
  _edges: Map<any, TinkerEdge>;

  // variables: TinkerGraphVariables;
  vertexIndex: Maybe<TinkerIndex<any /* ? */>>;
  edgeIndex: Maybe<TinkerIndex<any /* ? */>>;

  currentId: number;

  // https://stackoverflow.com/a/33248218/72351
  vertexIdManager: IdManager<number>; // todo: wildcard
  edgeIdManager: IdManager<number>;
  vertexPropertyIdManager: IdManager<number>;
  defaultVertexPropertyCardinality: Cardinality;

  constructor(config: BaseConfig = baseConfig) {
    this._vertices = new Map();
    this._edges = new Map();
    this.currentId = 0;

    this.vertexIdManager = config.vertexIdManager;
    this.edgeIdManager = config.edgeIdManager;
    this.vertexPropertyIdManager = config.vertexPropertyIdManager;
    // TODO: make configurable
    this.defaultVertexPropertyCardinality = Cardinality.list; // TODO

    this.vertexIndex = null;
    this.edgeIndex = null;
  }

  // Signatures
  addVertex(label: string, keyValues?: KeyValues<any>): TinkerVertex;
  addVertex(keyValues?: KeyValues<any>): TinkerVertex;
  // Implementation
  addVertex(labelOrKeyValues?: string | KeyValues<any>, keyValues?: KeyValues<any>): TinkerVertex {
    let label: string;

    if (!keyValues) {
      // Method was called with 0 or 1 argument
      keyValues = labelOrKeyValues as KeyValues<any>;
      label = 'vertex';
    } else {
      label = labelOrKeyValues as string;
    }

    const idValue: TinkerId = this.vertexIdManager.getNextId(this);

    const vertex = new TinkerVertex(idValue, label, this);
    this._vertices.set(idValue, vertex);

    Object.keys(keyValues || {}).forEach((key: string) => {
      vertex.property(key, (keyValues || {})[key]);
    });

    return vertex;
  }

  createIndex(key: string, elementClass: string = ''): void {
    if (typeof key !== 'string') {
      throw new Error('Index key must be a string value');
    }

    if (key.length === 0) {
      throw new Error('Index key cannot be an empty string');
    }

    switch (elementClass.toLowerCase()) {
      case 'vertex':
        if (!this.vertexIndex) {
          this.vertexIndex = new TinkerIndex(this, elementClass);
        }
        // console.log(this.vertexIndex);
        this.vertexIndex.createKeyIndex(key);
        break;
      case 'edge':
        if (!this.edgeIndex) {
          this.edgeIndex = new TinkerIndex(this, elementClass);
        }
        this.edgeIndex.createKeyIndex(key);
        break;
      default:
        throw new Error(`Class is not indexable: ${elementClass}`);
    }
  }

  dropIndex<E>(key: string, elementClass: E): void {
    //
  }

  getIndexedKeys(elementClass: string): Set<string> {
    switch (elementClass.toLowerCase()) {
      case 'vertex':
        return this.vertexIndex ? this.vertexIndex.getIndexedKeys() : new Set();
      case 'edge':
        return this.edgeIndex ? this.edgeIndex.getIndexedKeys() : new Set();
      default:
        throw new Error('Not fully implemented');
    }
  }

  close(): void {
    throw new Error('Not yet implemented');
  }

  variables(): Variables {
    throw new Error('Not yet implemented');
  }

  configuration(): object /* Configuration */ {
    throw new Error('Not yet implemented');
  }

  features(): Features {
    throw new Error('Not yet implemented');
  }

  vertices(...vertexIds: any[]): Iterator<Vertex> {
    return this._createElementIterator<Vertex>('Vertex', this._vertices, this.vertexIdManager, ...vertexIds);
  }

  edges(...edgeIds: any[]): Iterator<Edge> {
    return this._createElementIterator<Edge>('Edge', this._edges, this.vertexIdManager, ...edgeIds);
  }

  _createElementIterator<T>(
    elementClass: 'Vertex' | 'Edge',
    elements: Map<any, T>,
    idManager: IdManager<number /* ? */>,
    ...ids: any[]
  ): Iterator<T> {
    console.warn('Partial implementation of _createElementIterator');
    return ids.map((id: any) => elements.get(id)).values() as Iterator<T>;
  }
}

export interface IdManager<T> {
  getNextId(graph: TinkerGraph): T;

  convert(id: any): Maybe<T>;

  allow(id: any): boolean;
}

export default TinkerGraph;
