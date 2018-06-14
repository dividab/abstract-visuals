import * as React from "react";

import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { linkTo } from "@storybook/addon-links";

import { Button, Welcome } from "@storybook/react/demo";

import { ReactSvgExportExample1 } from "./react-svg-export/example-1";
import { SvgExportExample1 } from "./svg-export/example-1";

storiesOf("Welcome", module).add("to Storybook", () => (
  <Welcome showApp={linkTo("Button")} />
));

storiesOf("Button", module)
  .add("with text", () => (
    <Button onClick={action("clicked")}>Hello Button</Button>
  ))
  .add("with some emoji", () => (
    <Button onClick={action("clicked")}>😀 😎 👍 💯</Button>
  ));

storiesOf("React Svg Export", module).add("example 1", () => (
  <ReactSvgExportExample1 />
));

storiesOf("Svg Export (not a component?)", module).add("example 1", () => (
  <SvgExportExample1 />
));
