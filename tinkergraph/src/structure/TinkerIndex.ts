import TinkerGraph from './TinkerGraph';
import Element from './core/structure/Element';

class TinkerIndex<T extends Element> {
  index: Map<string, Map<any, Set<T>>>;
  indexedKeys: Set<string>;
  indexClass: T;
  graph: TinkerGraph;

  constructor(graph: TinkerGraph, indexClass: T) {
    this.index = new Map();
    this.indexedKeys = new Set(); // should be HashSet

    this.indexClass = indexClass;
    this.graph = graph;
  }

  put(key: string, value: any, element: T) {
    let keyMap = this.index.get(key);

    if (!keyMap) {
      keyMap = new Map();
      this.index.set(key, keyMap);
    }

    let objects = keyMap.get(value);
    if (!objects) {
      objects = new Set();
      keyMap.set(value, objects);
    }

    objects.add(element);
  }

  get(key: string, value: any) {
    const keyMap = this.index.get(key);

    if (!keyMap) {
      return []; // Java: Collections.emptyList()
    }
    const set = keyMap.get(value);

    return set === null ? [] : Array.from(set || []);
  }

  count(key: string, value: any) {
    const keyMap = this.index.get(key);

    if (!keyMap) {
      return 0;
    }
    const set = keyMap.get(value);

    return set ? set.size : 0;
  }

  remove(key: string, value: any, element: T): void {
    const keyMap = this.index.get(key);

    if (!keyMap) {
      const objects = keyMap.get(value);
      if (objects) {
        objects.remove(element);
        if (objects.size === 0) {
          keyMap.remove(value);
        }
      }
    }
  }

  removeElement(element: T): void {
    if (element.constructor.name === this.indexClass.name) {
      this.index.forEach(function(indexName) {
        indexName.forEach(function(set) {
          set.remove(element);
        });
      });
    }
  }

  autoUpdate(key: string, newValue: any, oldValue: any, element: T): void {
    if (this.indexedKeys.has(key)) {
      if (oldValue) {
        this.remove(key, oldValue, element);
      }
      this.put(key, newValue, element);
    }
  }

  autoRemove(key: string, oldValue: any, element: T): void {
    if (this.indexedKeys.has(key)) {
      this.remove(key, oldValue, element);
    }
  }

  createKeyIndex(key: string): void {
    if (typeof key !== 'string') {
      throw new Error(`Index key must be a string value: ${key}`);
    }

    if (key === '') {
      throw new Error('Index key cannot be an empty string');
    }

    if (this.indexedKeys.has(key)) {
      return;
    }

    this.indexedKeys.add(key);

    let values;

    // console.log(this.indexClass)
    if (this.indexClass.name === 'vertex') {
      values = this.graph._vertices;
    }

    if (this.indexClass.name === 'edge') {
      values = this.graph._edges;
    }

    throw new Error('Not fully implemented');
  }

  getIndexedKeys(): Set<string> {
    return this.indexedKeys;
  }

  dropKeyIndex(key): void {
    if (this.index.has(key)) {
      this.index.delete(key);
    }

    this.indexedKeys.delete(key);
  }
}

export default TinkerIndex;
