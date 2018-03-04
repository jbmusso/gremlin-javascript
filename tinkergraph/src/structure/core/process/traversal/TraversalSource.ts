import Graph from '../../structure/Graph';

import TraversalStrategies from './TraversalStrategies';
import TraversalStrategy from './TraversalStrategy';
import Bytecode from './Bytecode';

export interface Cloneable {
  close(): void;
}

export interface AutoCloseable {
  close(): void;
}

export type Supplier<A> = () => A;

export type UnaryOperator<T> = (a: T) => T;

export type BinaryOperator<T> = (a: T, b: T) => T;

interface TraversalSource extends Cloneable, AutoCloseable {
  //
  getStrategies(): TraversalStrategies;

  getGraph(): Graph;

  getBytecode(): Bytecode;

  // TODO: implement
  withStrategies(...traversalStrategies: TraversalStrategy[]): TraversalSource;

  withoutStrategies(...traversalStrategyClasses: (new () => TraversalStrategy)[]): TraversalSource;

  withSideEffect<A>(key: string, initialValue: Supplier<A> | A, reducer?: BinaryOperator<A>): TraversalSource;

  withSack<A>(
    initialValue: Supplier<A> | A,
    // TODO: 2nd can be split or merge operator
    splitOperator?: UnaryOperator<A>,
    mergeOperator?: BinaryOperator<A>,
  ): TraversalSource;

  withRemote(config: object): TraversalSource;
}

export class Symbols {
  readonly withSack: string = 'withSack';
  readonly withStrategies: string = 'withStrategies';
  readonly withoutStrategies: string = 'withoutStrategies';
  readonly withComputer: string = 'withComputer';
  readonly withSideEffect: string = 'withSideEffect';
  readonly withRemote: string = 'withRemote';
}

export default TraversalSource;
