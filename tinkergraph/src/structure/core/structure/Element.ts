import Property from './Property';
import Graph from './Graph';
import { TinkerId } from '../../TinkerGraph';

export default interface Element {
  id: TinkerId;
  // id(): TinkerId; // OK

  label(): string;

  graph(): Graph;

  // abstract impl. done in TinkerElement
  keys(): Set<string>;

  // abstract impl. done in TinkerElement
  property<V>(key: string, value?: V): Property<V>;

  // abstract impl. done in TinkerElement
  value<V>(key?: string): V;

  remove(): void;

  // abstract impl. done in TinkerElement
  values<V>(...propertyKeys: string[]): Iterator<V>;

  // properties<V>(...propertyKeys: string[]): Iterator<new () => Property<V>>;
  properties<V>(...propertyKeys: string[]): Iterator<Property<V>>;
  // tslint:disable-next-line
};
