import Property from './core/structure/Property';
import Element from './core/structure/Element';

class TinkerProperty<V> implements Property<V> {
  element: Element;
  _key: string;
  _value: V;

  constructor(element: Element, key: string, value: V) {
    this.element = element;
    this._key = key;
    this._value = value;
  }

  isPresent() {
    return this._value !== null || typeof this._value !== 'undefined';
  }

  get value<V>(): string {
    return this._value;
  }
}

export default TinkerProperty;
