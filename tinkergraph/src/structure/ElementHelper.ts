import TinkerElement from './TinkerElement';
import KeyValues from './core/structure/KeyValues';

export function attachProperties(element: TinkerElement, keyValues: KeyValues<any> = {}) {
  Object.keys(keyValues).forEach((key: string) => {
    element.property(key, keyValues[key]);
  });
}
