import Element from './Element';
import EmptyProperty from './util/empty/EmptyProperty';

interface Property<V> {
  // TODO: impl.
  // See: https://github.com/Microsoft/TypeScript/issues/13462#issuecomment-272804818
  // static
  // empty<V>(): Property<V>;

  element: Element;
  // element(): Element; // OK, can skip getter

  // key(): string;
  _key: string;
  // value(): V;

  value<V>(key?: string): V; // OK

  isPresent(): boolean;

  // TODO: impl.
  ifPresent(): void;

  orElse(otherValue: V): V;

  orElseGet(valueSupplier: new () => V): V;

  // TODO: impl.
  orElseThrow<E /*extends Throwable*/>(exceptionSupplier: new () => E): V;

  remove(): void;

  empty<V>(): Property<V>;
}

export function empty<V>(): Property<V> {
  //
  return EmptyProperty.instance();
}

export default Property;
