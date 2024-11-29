import * as React from "react";
import * as ReactDomClient from "react-dom/client";
import { Container } from "./app/container.js";

const container = document.getElementById("root");
const root = ReactDomClient.createRoot(container!);
root.render(<Container />);
