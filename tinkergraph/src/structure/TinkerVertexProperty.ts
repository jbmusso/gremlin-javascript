import TinkerElement from './TinkerElement';
import Vertex from './core/structure/Vertex';
import KeyValues from './core/structure/KeyValues';
import * as ElementHelper from './ElementHelper';
import { TinkerId } from './TinkerGraph';
import VertexProperty from './core/structure/VertexProperty';
import TinkerVertex from './TinkerVertex';

class TinkerVertexProperty<V> extends TinkerElement implements VertexProperty<V> {
  _properties: Map<String, Property>;
  vertex: TinkerVertex;
  _key: string;
  _value: V;

  constructor(id: TinkerId, vertex: Vertex, key: string, value: V, ...propertyKeyValues: KeyValues<any>[]) {
    super(0 /* todo: fix id */, key);

    this.vertex = vertex;
    this._key = key;
    this._value = value;
  }

  element(): Vertex {
    return this.vertex;
  }

  key() {
    return this._key;
  }

  get value() {
    // OK: getter

    return this._value;
  }

  properties() {
    //
  }

  /*
  @Override
    public <U> Iterator<Property<U>> properties(final String... propertyKeys) {
        if (null == this.properties) return Collections.emptyIterator();
        if (propertyKeys.length == 1) {
            final Property<U> property = this.properties.get(propertyKeys[0]);
            return null == property ? Collections.emptyIterator() : IteratorUtils.of(property);
        } else
            return (Iterator) this.properties.entrySet().stream().filter(entry -> ElementHelper.keyExists(entry.getKey(), propertyKeys)).map(entry -> entry.getValue()).collect(Collectors.toList()).iterator();
    }
  */
}

export default TinkerVertexProperty;
