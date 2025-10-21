import { Parser, type Program } from "acorn";
import jsx from "acorn-jsx";
import { ParseError } from "./parse-error.js";

const JSXParser = Parser.extend(jsx());

export function parse(source: string): Program {
  try {
    return JSXParser.parse(source, {
      ecmaVersion: "latest",
      sourceType: "module",
      locations: true,
      allowReturnOutsideFunction: true,
    });
  } catch (error: unknown) {
    // Acorn throws syntax errors with location info when parsing fails.
    // We steal this info and pass it to our own ParseError.
    if (isAcornError(error)) {
      // Remove location (the line:column part) from message if present
      const message = error.message.replace(ACORN_LOCATION_SUFFIX_RX, "");

      throw new ParseError(message, error.loc);
    }

    throw new ParseError(error instanceof Error ? error.message : "Parsing failed");
  }
}

const ACORN_LOCATION_SUFFIX_RX = /\s+\(\d+:\d+\)$/;

function isAcornError(error: unknown): error is AcornError {
  return error instanceof Error && (error as AcornError).loc !== undefined;
}

type AcornError = Error & {
  loc: {
    line: number;
    column: number;
  };
};
