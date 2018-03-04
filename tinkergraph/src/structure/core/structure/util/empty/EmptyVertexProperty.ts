import VertexProperty from '../../VertexProperty';
import Vertex from '../../Vertex';
import Graph from '../../Graph';
import Property, * as PropertyStatic from '../../Property';

class EmptyVertexProperty<V> implements VertexProperty<V> {
  static readonly INSTANCE = new EmptyVertexProperty();

  static instance<V>(): VertexProperty<V> {
    return this.INSTANCE;
  }

  element(): Vertex {
    throw new Error('Property does not exist'); // TODO
  }

  id(): Object {
    throw new Error('Property does not exist');
  }

  graph(): Graph {
    throw new Error('Property does not exist');
  }

  property<U>(key: string): Property<U> {
    return PropertyStatic.empty<U>();
  }

  label(): string {
    return this.key();
  }

  key(): string {
    throw new Error('Property does not exist');
  }

  value<V>(key: string): V {
    throw new Error('Property does not exist');
  }

  isPresent(): boolean {
    return false;
  }

  remove(): void {
    // Ok
  }

  toString() {
    throw new Error('Not yet implemented');
    // return StringFactory.propertyString(this);
  }

  public properties<U>(...propertyKeys: string[]): Iterator<Property<U>> {
    return [].values();
  }
}

export default EmptyVertexProperty;
