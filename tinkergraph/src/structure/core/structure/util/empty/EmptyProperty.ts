import Property from '../../Property';
import Element from '../../Element';
import { Supplier } from '../../../process/traversal/TraversalSource';

export type Consumer<T> = () => T;

class EmptyProperty<V> implements Property<V> {
  static readonly INSTANCE = new EmptyProperty();

  static instance<V>(): EmptyProperty<V> {
    return this.INSTANCE;
  }

  // static empty<V>(): EmptyProperty<V> {
  //   return this.INSTANCE;
  // }

  key(): string {
    throw new Error('Property does not exist');
  }

  value<V>(): V {
    throw new Error('Property does not exist');
  }

  isPresent(): boolean {
    return false;
  }

  // ifPresent(consumer: Consumer<new () => V>): void {
  ifPresent(consumer: Consumer<V>): void {
    if (this.isPresent()) {
      consumer;
      // consumer(this.value());
    }
  }

  orElse(otherValue: V): V {
    return this.isPresent() ? this.value() : otherValue;
  }

  orElseGet(valueSupplier: Supplier<V>): V {
    return this.isPresent() ? this.value() : valueSupplier();
  }

  get element(): Element {
    throw new Error('Property does not exist');
  }

  remove(): void {
    // ok
  }
}

export default EmptyProperty;
