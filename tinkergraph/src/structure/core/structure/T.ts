export enum TEnum {
  id,
  label,
  key,
  value,
}

export interface TInterface {
  getAccessor(): string;
}

abstract class T implements TInterface {
  static readonly LABEL = 'label';
  static readonly ID = 'id';
  static readonly KEY = 'key';
  static readonly VALUE = 'value';

  public static fromString(accessor: string): TEnum {
    switch (accessor) {
      case this.LABEL:
        return TEnum.label;
      case this.ID:
        return TEnum.id;
      case this.KEY:
        return TEnum.key;
      case this.VALUE:
        return TEnum.value;
      default:
        throw new Error(`The following token string is unknown: ${accessor}`);
    }
  }

  abstract getAccessor(): string;

  abstract apply(element: Element): object;
}

export default T;
