export interface ValidationContextSnapshot {
  elements: string[];
  currentElement?: string;
  parentElements: string[];
}

export class ValidationContext {
  #elements: string[] = [];

  get currentPath(): string {
    if (this.#elements.length > 0) {
      return this.#elements.join(" > ");
    }
    return "";
  }

  enterElement(element: string): void {
    this.#elements.push(element);
  }

  exitElement(): void {
    this.#elements.pop();
  }

  getSnapshot(): ValidationContextSnapshot {
    return {
      elements: this.#elements.slice(),
      currentElement: this.#elements[this.#elements.length - 1],
      parentElements: this.#elements.slice(0, -1),
    };
  }
}
