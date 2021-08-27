export function merge<T1, T2>(a: T1, b: T2): T1 & T2 {
  return Object.assign({}, a, b);
}
