import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import {
  Paragraph,
  AbstractDoc,
  Section,
  TextRun,
  PageBreak,
  LinkTarget,
  HyperLink,
} from "../../../abstract-document-jsx/index.js";

const paragraph = (
  <Paragraph>
    <TextRun text={"Hello"} />
    <HyperLink target={"#first"} text={"first "} />
    <HyperLink target={"#second"} text={"second "} />
    <HyperLink target={"#third"} text={"third "} />
    <HyperLink target={"#fourth"} text={"fourth "} />
    <HyperLink target={"#fifth"} text={"fifth "} />
    <HyperLink target={"#sixth"} text={"sixth "} />
  </Paragraph>
);

export const testHyperLinkInternalLinkTarget: ExportTestDef = {
  name: "Hyperlink internal linktarget",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph>
          <LinkTarget name={"first"} />
        </Paragraph>
        {paragraph}
        <PageBreak />
      </Section>

      <Section>
        <Paragraph>
          <LinkTarget name={"second"} />
        </Paragraph>
        {paragraph}
        <PageBreak />
      </Section>

      <Section>
        <Paragraph>
          <LinkTarget name={"third"} />
        </Paragraph>
        {paragraph}
        <PageBreak />
      </Section>

      <Section>
        <Paragraph>
          <LinkTarget name={"fourth"} />
        </Paragraph>
        {paragraph}
        <PageBreak />
      </Section>

      <Section>
        <Paragraph>
          <LinkTarget name={"fifth"} />
        </Paragraph>
        {paragraph}
        <PageBreak />
      </Section>

      <Section>
        <Paragraph>
          <LinkTarget name={"sixth"} />
        </Paragraph>
        {paragraph}
      </Section>
    </AbstractDoc>
  ),
  expectedPdfJson: {
    Transcoder: "pdf2json@2.0.1 [https://github.com/modesty/pdf2json]",
    Meta: {
      CreationDate: "*",
      Creator: "PDFKit",
      IsAcroFormPresent: false,
      IsXFAPresent: false,
      Metadata: {},
      PDFFormatVersion: "1.3",
      Producer: "PDFKit",
    },
    Pages: [
      {
        Height: 52.625,
        Width: 37.188,
        HLines: [],
        VLines: [],
        Fills: [],
        Texts: [
          {
            x: -0.25,
            y: -0.301,
            w: 22.78,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 1.174,
            y: -0.301,
            w: 18.89,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "first%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 2.354,
            y: -0.301,
            w: 35.02,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "second%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 4.543,
            y: -0.301,
            w: 22.23,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "third%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 5.933,
            y: -0.301,
            w: 28.35,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "fourth%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 7.711,
            y: -0.301,
            w: 18.9,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "fifth%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 8.892,
            y: -0.301,
            w: 23.34,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "sixth%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
        ],
        Fields: [],
        Boxsets: [],
      },
      {
        Height: 52.625,
        Width: 37.188,
        HLines: [],
        VLines: [],
        Fills: [],
        Texts: [
          {
            x: -0.25,
            y: -0.301,
            w: 22.78,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 1.174,
            y: -0.301,
            w: 18.89,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "first%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 2.354,
            y: -0.301,
            w: 35.02,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "second%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 4.543,
            y: -0.301,
            w: 22.23,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "third%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 5.933,
            y: -0.301,
            w: 28.35,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "fourth%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 7.711,
            y: -0.301,
            w: 18.9,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "fifth%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 8.892,
            y: -0.301,
            w: 23.34,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "sixth%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
        ],
        Fields: [],
        Boxsets: [],
      },
      {
        Height: 52.625,
        Width: 37.188,
        HLines: [],
        VLines: [],
        Fills: [],
        Texts: [
          {
            x: -0.25,
            y: -0.301,
            w: 22.78,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 1.174,
            y: -0.301,
            w: 18.89,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "first%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 2.354,
            y: -0.301,
            w: 35.02,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "second%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 4.543,
            y: -0.301,
            w: 22.23,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "third%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 5.933,
            y: -0.301,
            w: 28.35,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "fourth%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 7.711,
            y: -0.301,
            w: 18.9,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "fifth%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 8.892,
            y: -0.301,
            w: 23.34,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "sixth%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
        ],
        Fields: [],
        Boxsets: [],
      },
      {
        Height: 52.625,
        Width: 37.188,
        HLines: [],
        VLines: [],
        Fills: [],
        Texts: [
          {
            x: -0.25,
            y: -0.301,
            w: 22.78,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 1.174,
            y: -0.301,
            w: 18.89,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "first%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 2.354,
            y: -0.301,
            w: 35.02,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "second%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 4.543,
            y: -0.301,
            w: 22.23,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "third%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 5.933,
            y: -0.301,
            w: 28.35,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "fourth%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 7.711,
            y: -0.301,
            w: 18.9,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "fifth%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 8.892,
            y: -0.301,
            w: 23.34,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "sixth%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
        ],
        Fields: [],
        Boxsets: [],
      },
      {
        Height: 52.625,
        Width: 37.188,
        HLines: [],
        VLines: [],
        Fills: [],
        Texts: [
          {
            x: -0.25,
            y: -0.301,
            w: 22.78,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 1.174,
            y: -0.301,
            w: 18.89,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "first%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 2.354,
            y: -0.301,
            w: 35.02,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "second%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 4.543,
            y: -0.301,
            w: 22.23,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "third%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 5.933,
            y: -0.301,
            w: 28.35,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "fourth%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 7.711,
            y: -0.301,
            w: 18.9,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "fifth%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 8.892,
            y: -0.301,
            w: 23.34,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "sixth%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
        ],
        Fields: [],
        Boxsets: [],
      },
      {
        Height: 52.625,
        Width: 37.188,
        HLines: [],
        VLines: [],
        Fills: [],
        Texts: [
          {
            x: -0.25,
            y: -0.301,
            w: 22.78,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 1.174,
            y: -0.301,
            w: 18.89,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "first%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 2.354,
            y: -0.301,
            w: 35.02,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "second%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 4.543,
            y: -0.301,
            w: 22.23,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "third%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 5.933,
            y: -0.301,
            w: 28.35,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "fourth%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 7.711,
            y: -0.301,
            w: 18.9,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "fifth%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 8.892,
            y: -0.301,
            w: 23.34,
            sw: 0.32553125,
            clr: 35,
            A: "left",
            R: [
              {
                T: "sixth%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
        ],
        Fields: [],
        Boxsets: [],
      },
    ],
  },
};
