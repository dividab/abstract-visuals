import React from "react";
import * as monaco from "monaco-editor";
import { Editor, loader } from "@monaco-editor/react";

loader.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs" } });

export const monacoBaseOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  lineNumbers: "off",
  contextmenu: false,
  fontSize: 14,
  lineHeight: 17,
  scrollBeyondLastLine: false,
  scrollBeyondLastColumn: 0,
  renderLineHighlight: "none",
  fontFamily: "Consolas, Menlo, monospace",
  fontLigatures: false,
  glyphMargin: false,
  folding: false,
  overviewRulerLanes: 0,
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 0,
  automaticLayout: true,
  tabSize: 2,
  letterSpacing: 0,
  padding: { bottom: 0, top: 0 },
  scrollbar: { verticalSliderSize: 6, horizontalSliderSize: 6, useShadows: false },
};

export const JsonMonacoEditor = ({
  value,
  schema,
  onChange,
}: {
  readonly value: string;
  readonly schema: string;
  readonly onChange: (value: string) => void;
}): JSX.Element => {
  const monacoRef = React.useRef<typeof monaco>(undefined!);
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor>(undefined!);

  React.useEffect(() => {
    const model = editorRef.current?.getModel();
    if (model && monacoRef.current) {
      monacoRef.current.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
          {
            uri: "http://myserver/foo-schema.json",
            fileMatch: [model.uri.toString()],
            schema: (() => {
              try {
                return JSON.parse(schema);
              } catch {
                return {};
              }
            })(),
          },
        ],
        schemaValidation: "error",
      });
    }
  }, [schema]);

  return <Editor loading={<></>} onMount={(e) => (editorRef.current = e)} value={value} onChange={onChange} />;
};
