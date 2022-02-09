import React from "react";
import { ExportTestDef } from "../export-test-def";
import * as AD from "../../../../index";
import { Paragraph, AbstractDoc, Section, TextRun, TextField, Group, render } from "../../../../abstract-document-jsx";

const header = [
  render(
    <Group>
      <Paragraph>
        <TextRun text="I am a header" />
      </Paragraph>
      <Paragraph
        style={AD.AbstractDoc.ParagraphStyle.create({
          position: "absolute",
          margins: AD.AbstractDoc.LayoutFoundation.create({ right: 20 }),
          alignment: "End",
        })}
      >
        <TextField fieldType="PageNumber" />
        <TextRun text="/" />
        <TextField fieldType="TotalPages" />
      </Paragraph>
    </Group>
  ),
];

const footer = [
  render(
    <Group>
      <Paragraph>
        <TextRun text="I am a footer" />
      </Paragraph>
      <Paragraph
        style={AD.AbstractDoc.ParagraphStyle.create({
          position: "absolute",
          margins: AD.AbstractDoc.LayoutFoundation.create({ top: 20, left: 20 }),
        })}
      >
        <TextRun text="I am a footer" />
      </Paragraph>
    </Group>
  ),
];

const page = AD.AbstractDoc.MasterPage.create({ header: header, footer: footer });

export const test: ExportTestDef = {
  name: "Absolute position header and footer",
  abstractDocJsx: (
    <AbstractDoc>
      <Section page={page}>
        <Paragraph>
          <TextRun text={"I am body"} />
        </Paragraph>
      </Section>
    </AbstractDoc>
  ),
  expectedPdfJson: {},
};
