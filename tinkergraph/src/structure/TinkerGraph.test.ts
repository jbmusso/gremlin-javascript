declare var describe;
declare var it;
declare var expect;

import { createGraph } from '../';
import TinkerVertex from './TinkerVertex';
import TinkerGraph from './TinkerGraph';
import TinkerEdge from './TinkerEdge';

describe('Graph', () => {
  describe('.addvertex()', () => {
    it('should add a vertex with no property', () => {
      const graph: TinkerGraph = createGraph();
      const v: TinkerVertex = graph.addVertex();

      expect(graph._vertices.size).toEqual(1);
      expect(v.id).toEqual(0);
    });

    it('should add a vertex with properties passed as a single object argument', () => {
      const graph: TinkerGraph = createGraph();
      const v: TinkerVertex = graph.addVertex({ name: 'bob', age: 25 });

      expect(graph._vertices.size).toEqual(1);
      expect(v.id).toEqual(0);
      expect(v.property('name').value).toEqual('bob');
      expect(v.property('age').value).toEqual(25);
    });

    describe('multiple vertices creation', () => {
      it('should add many vertices to the graph', () => {
        const graph: TinkerGraph = createGraph();
        const v1: TinkerVertex = graph.addVertex({ name: 'bob' });
        const v2: TinkerVertex = graph.addVertex({ name: 'alice' });

        // console.log(graph._vertices.get(0)._properties);

        expect(graph._vertices.size).toEqual(2);
      });

      it('should increment vertex ids properly', () => {
        const graph: TinkerGraph = createGraph();
        const v1: TinkerVertex = graph.addVertex({ name: 'bob' });
        const v2: TinkerVertex = graph.addVertex({ name: 'alice' });

        expect(v1.id).toEqual(0);
        // expect(v&&)
        expect(v2.id).toEqual(2);
      });

      it('should reallocate the lowest freed id', () => {
        const graph = createGraph();
        const v1 = graph.addVertex();
        const v2 = graph.addVertex();
        v2.remove();
        const v3 = graph.addVertex();

        expect(v1.id).toEqual(0);
        expect(v2.id).toEqual(1);
      });
    });
  });

  describe('.addEdge()', () => {
    it('should add an edge with no property', () => {
      const graph: TinkerGraph = createGraph();
      const v1: TinkerVertex = graph.addVertex();
      const v2: TinkerVertex = graph.addVertex();
      const edge: TinkerEdge = v1.addEdge('knows', v2);

      expect(graph._edges.size).toEqual(1);
      expect(edge._label).toEqual('knows');

      expect(v1.outEdges.size).toEqual(1);
      expect(v1.outEdges.get('knows').size).toEqual(1);
      expect(
        v1.outEdges
          .get('knows')
          .values()
          .next().value,
      ).toEqual(edge);

      expect(v2.inEdges.size).toEqual(1);
      expect(v2.inEdges.get('knows').size).toEqual(1);
      expect(
        v2.inEdges
          .get('knows')
          .values()
          .next().value,
      ).toEqual(edge);
    });

    it('should add an edge with properties', () => {
      const graph: TinkerGraph = createGraph();
      const v1: TinkerVertex = graph.addVertex({ name: 'bob' });
      const v2: TinkerVertex = graph.addVertex({ name: 'alice' });
      const e: TinkerEdge = v1.addEdge('likes', v2, { since: 'now' });

      expect(e.property('since').value).toEqual('now');

      expect(graph._edges.size).toEqual(1);
      expect(e._label).toEqual('likes');

      expect(v1.outEdges.size).toEqual(1);
      expect(v1.outEdges.get('likes').size).toEqual(1);
      expect(
        v1.outEdges
          .get('likes')
          .values()
          .next().value,
      ).toEqual(e);

      expect(v2.inEdges.size).toEqual(1);
      expect(v2.inEdges.get('likes').size).toEqual(1);
      expect(
        v2.inEdges
          .get('likes')
          .values()
          .next().value,
      ).toEqual(e);
    });
  });

  describe('Indices', () => {
    it.skip('should manage indices', () => {
      const graph: TinkerGraph = createGraph();
      const vertexKeys: Set<string> = graph.getIndexedKeys('vertex');
      expect(vertexKeys.size).toEqual(0);

      const edgeKeys = graph.getIndexedKeys('edge');
      expect(edgeKeys.size).toEqual(0);

      graph.createIndex('name1', 'vertex');
      graph.createIndex('name2', 'vertex');
      // Add the same index twice to check idempotence
      graph.createIndex('name1', 'vertex');
      graph.createIndex('oid1', 'edge');
      graph.createIndex('oid2', 'edge');

      expect(Array.from(vertexKeys.values())).toEqual(expect.arrayContaining(['name1', 'name2']));
      expect(Array.from(edgeKeys.values())).toEqual(expect.arrayContaining(['oid1', 'oid2']));

      graph.dropIndex('name2', 'vertex');
      expect(vertexKeys.size).toEqual(1);
      expect(vertexKeys.values().next().value).toEqual('name1');

      graph.dropIndex('name1', 'vertex');
      expect(vertexKeys.size).toEqual(0);

      graph.dropIndex('oid2', 'edge');
      expect(edgeKeys.size).toEqual(1);
      expect(edgeKeys.values().next().value).toEqual('oid1');

      graph.dropIndex('oid1', 'edge');
      expect(edgeKeys.size).toEqual(0);
    });

    it('should not create vertex index with a non-string key', () => {
      const graph: TinkerGraph = createGraph();
      const regex: RegExp = /^Index key must be a string value/;
      const VERTEX: string = 'vertex';

      expect(() => graph.createIndex(null, VERTEX)).toThrow(regex);
      expect(() => graph.createIndex(undefined, VERTEX)).toThrow(regex);
      expect(() => graph.createIndex(0, VERTEX)).toThrow(regex);
      expect(() => graph.createIndex(1, VERTEX)).toThrow(regex);
      expect(() => graph.createIndex([], VERTEX)).toThrow(regex);
      expect(() => graph.createIndex({}, VERTEX)).toThrow(regex);
    });

    it('should not create vertex index with a non-string key', () => {
      const graph = createGraph();
      const regex = /^Index key must be a string value/;
      const EDGE = 'edge';

      expect(() => graph.createIndex(null, EDGE)).toThrow(regex);
      expect(() => graph.createIndex(undefined, EDGE)).toThrow(regex);

      expect(() => graph.createIndex(0, EDGE)).toThrow(regex);
      expect(() => graph.createIndex(1, EDGE)).toThrow(regex);
      expect(() => graph.createIndex([], EDGE)).toThrow(regex);
      expect(() => graph.createIndex({}, EDGE)).toThrow(regex);
    });

    it('should not create vertex index with an empty key', () => {
      const graph = createGraph();
      const regex = /Index key cannot be an empty string/;

      expect(() => graph.createIndex('', 'vertex')).toThrow(regex);
    });

    it('should not create edge index with an empty key', () => {
      const graph = createGraph();
      const regex = /Index key cannot be an empty string/;

      expect(() => graph.createIndex('', 'edge')).toThrow(regex);
    });

    describe.skip('Hitting indices', function() {
      // Vertex indices update and removal
      it('should update vertex indices in a new graph', () => {
        //
      });

      it('should remove vertex from an index', () => {
        //
      });

      it('should update vertex indices in an existing graph', () => {
        //
      });

      // Edge indices update and removal
      it('should update edge indices in a new graph', () => {
        //
      });

      it('should remove edge from an index', () => {
        //
      });

      it('should update edge indices in an existing graph', () => {
        //
      });
    });

    describe.skip('Mutation of removed element', function() {
      it('should not modify a vertex that was removed', () => {
        //
      });

      it('should not add edge to a vertex that was removed', () => {
        //
      });

      it('should not read value of property on vertex that was removed', () => {
        //
      });
    });
  });
});
