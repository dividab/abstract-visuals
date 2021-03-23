import { configure } from "@storybook/react";

function loadStories() {
  require("../packages/_stories/lib");
  // require("../packages/_stories/lib/react-properties-selector");
  // require("../packages/_stories/lib/react-property-selectors");
}

configure(loadStories, module);
