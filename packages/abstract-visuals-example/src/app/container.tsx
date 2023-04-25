import * as React from "react";
import { merge } from "./utils";
import { AbstractImageExampleReact } from "./abstract-image-example-react";
import { AbstractImageExampleSvg } from "./abstract-image-example-svg";
import { AbstractImageExampleDxf } from "./abstract-image-example-dxf";
import { AbstractChartExample } from "./abstract-chart-example";
import { AbstractDocumentExample } from "./abstract-document-example";
import { AbstractDocumentXMLExample } from "./abstract-document-xml-example";

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
    super({});
    this.state = {
      selectedExample: 0,
      examples: [
        {
          name: "AbstractChart",
          component: AbstractChartExample,
        },
        {
          name: "AbstractImageSvg",
          component: AbstractImageExampleSvg,
        },
        {
          name: "AbstractImageReact",
          component: AbstractImageExampleReact,
        },
        {
          name: "AbstractImageDxf",
          component: AbstractImageExampleDxf,
        },
        {
          name: "AbstractDocument",
          component: AbstractDocumentExample,
        },
        {
          name: "AbstractDocumentXML",
          component: AbstractDocumentXMLExample,
        },
      ],
    };
  }

  render(): JSX.Element {
    const SelectedComponent = this.state.examples[this.state.selectedExample].component;

    return (
      <div>
        <div>
          <ExampleSelector
            examples={this.state.examples}
            selectedExample={this.state.selectedExample}
            selectedExampleChanged={(index) => this.setState(merge(this.state, { selectedExample: index }))}
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

function ExampleSelector({ examples, selectedExample, selectedExampleChanged }: ExampleSelectorProps): JSX.Element {
  return (
    <select value={selectedExample} onChange={(e) => selectedExampleChanged((e.target as any).value)}>
      {examples.map((example, index) => (
        <option key={example.name} value={index}>
          {example.name}
        </option>
      ))}
    </select>
  );
}
