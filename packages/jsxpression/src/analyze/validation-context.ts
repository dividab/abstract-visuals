export interface ValidationContextSnapshot {
  elements: Array<string>;
  currentElement?: string;
  parentElements: Array<string>;
}

export interface ValidationContext {
  readonly currentPath: string;
  enterElement: (element: string) => void;
  exitElement: () => void;
  getSnapshot: () => ValidationContextSnapshot;
}

export function createValidationContext(): ValidationContext {
  const elements: Array<string> = [];

  return {
    get currentPath(): string {
      if (elements.length > 0) {
        return elements.join(" > ");
      }
      return "";
    },

    enterElement(element: string): void {
      elements.push(element);
    },

    exitElement(): void {
      elements.pop();
    },

    getSnapshot(): ValidationContextSnapshot {
      return {
        elements: elements.slice(),
        currentElement: elements[elements.length - 1],
        parentElements: elements.slice(0, -1),
      };
    },
  };
}
