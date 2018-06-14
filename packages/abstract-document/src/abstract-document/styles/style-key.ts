export type StyleKey = string;

export function create(type: string, name: string): StyleKey {
  return `${type}_${name}`;
}
