declare module "unified" {
  interface Processor {
    use: (plugin: unknown, ...settings: Array<unknown>) => Processor;
    parse: (source: string) => unknown;
  }
  function unified(): Processor;
  export default unified;
}
