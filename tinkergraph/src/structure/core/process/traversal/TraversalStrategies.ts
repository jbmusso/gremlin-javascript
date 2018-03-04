import TraversalStrategy from './TraversalStrategy';

interface TraversalStrategies /* extends Serializable, Cloneable */ {
  //
  toList(): TraversalStrategy[];
}

export default TraversalStrategies;
