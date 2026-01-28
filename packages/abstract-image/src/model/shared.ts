export type Optional<T> = { readonly [K in keyof T]?: T[K] };
