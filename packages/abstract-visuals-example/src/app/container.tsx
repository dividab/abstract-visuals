import * as React from "react";
import { merge } from "./utils";
import { AbstractImageExample } from "./abstract-image-example";
import { AbstractImageExampleDxf } from "./abstract-image-example-dxf";
import { AbstractChartExample } from "./abstract-chart-example";
// import { AbstractDocumentExample } from "./abstract-document-example";

// tslint:disable

interface Example {
  readonly name: string;
  readonly component: React.SFC<any>;
}

export interface State {
  readonly examples: Example[];
  readonly selectedExample: number;
}

export class Container extends React.Component<{}, State> {
  constructor() {
    console.log(123);
    super();
    this.state = {
      selectedExample: 0,
      examples: [
        {
          name: "AbstractChart",
          component: AbstractChartExample
        },
        {
          name: "AbstractImage",
          component: AbstractImageExample
        },
        {
          name: "DXF",
          component: AbstractImageExampleDxf
        } /* ,
        {
          name: "AbstractDocument",
          component: AbstractDocumentExample
        } */
      ]
    };
  }

  render() {
    const SelectedComponent = this.state.examples[this.state.selectedExample]
      .component;

    return (
      <div>
        <div>
          <ExampleSelector
            examples={this.state.examples}
            selectedExample={this.state.selectedExample}
            selectedExampleChanged={index =>
              this.setState(merge(this.state, { selectedExample: index }))
            }
          />
        </div>
        <div>
          <SelectedComponent />
        </div>
      </div>
    );
  }
}

/*interface ExampleRendererProps {
  example: Example;
}
*/

interface ExampleSelectorProps {
  readonly examples: Array<Example>;
  readonly selectedExample: number;
  readonly selectedExampleChanged: (index: number) => void;
}

function ExampleSelector({
  examples,
  selectedExample,
  selectedExampleChanged
}: ExampleSelectorProps) {
  return (
    <select
      value={selectedExample}
      onChange={e => selectedExampleChanged((e.target as any).value)}
    >
      {examples.map((example, index) => (
        <option key={example.name} value={index}>
          {example.name}
        </option>
      ))}
    </select>
  );
}
