import Element from './core/structure/Element';
import Property from './core/structure/Property';

import TinkerProperty from './TinkerProperty';
import * as ElementHelper from './ElementHelper';
import { TinkerId } from './TinkerGraph';

class TinkerElement implements Element {
  id: TinkerId;

  _label: string;

  _removed: boolean;

  constructor(id: any, label: string) {
    this.id = id;
    this._label = label;
    this._removed = false;
  }

  // id(): TinkerId {
  //   return this._id;
  // }

  label(): string {
    return this._label;
  }

  keys(): Set<string> {
    const keys = new Set();
    this._properties.values().for;
  }

  equals(object: any): boolean {
    return ElementHelper.areEqual(this, object);
  }

  // property<V>(keyValues?: KeyValues<any>, cardinality?: Cardinality): Property<V>;
  // property<V>(key: string, value?: V): Property<V> {}

  properties<V>(): Iterator<Property<V>> {
    throw new Error('Must be implemented in child classes');
  }

  // Originally: default impl. in 'Element' interface
  value<V>(key: string): V {
    const value = this.property(key);
    if (value) {
      return value;
    }

    throw new Error('Property does not exist');
  }

  values<V>(...propertyKeys: string[]): Iterator<V> {
    // TODO: impl
    throw new Error('Not yet implemented');
    // return;
  }
}

export default TinkerElement;
