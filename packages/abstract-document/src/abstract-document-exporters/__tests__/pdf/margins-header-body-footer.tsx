/* eslint-disable max-lines */
import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import * as AD from "../../../index.js";
import { Paragraph, AbstractDoc, Section, TextRun, render } from "../../../abstract-document-jsx/index.js";
import * as PageStyle from "../../../abstract-document/styles/page-style.js";

const fillerString = "a b c d e f g h i j k l m n o p q r s t u v x y z å ä ö 1 2 3 4 5 6 7 8 9 0 ! # ¤ % & / ( ) = ?";

const header = [
  render(
    <Paragraph>
      <TextRun text="I am a header with padding. " />
      <TextRun text={fillerString} />
    </Paragraph>
  ),
];

const footer = [
  render(
    <Paragraph>
      <TextRun text="I am a footer with padding. " />
      <TextRun text={fillerString} />
    </Paragraph>
  ),
];

const margins = { left: 50, bottom: 50, right: 50, top: 50 };
const pageStyle = {
  headerMargins: margins,
  footerMargins: margins,
  contentMargins: margins,
  firstPageFooterMargins: margins,
  firstPageHeaderMargins: margins,
  //paperSize: "A4",
  //orientation: "Portrait",
  noTopBottomMargin: false,
};

const elementList = [];
//eslint-disable-next-line
for (let i = 0; i < 25; i++) {
  elementList.push(
    <Paragraph key={i}>
      <TextRun text={"I am a body and I have padding " + fillerString} />
    </Paragraph>
  );
}

const page = AD.AbstractDoc.MasterPage.create({ header: header, footer: footer, style: PageStyle.create(pageStyle) });

export const testMarginsHeaderBodyFooter: ExportTestDef = {
  name: "Margins header body footer",
  abstractDocJsx: (
    <AbstractDoc>
      <Section page={page}>{elementList}</Section>
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
        Width: 37.188,
        Height: 52.625,
        HLines: [],
        VLines: [],
        Fills: [],
        Texts: [
          {
            x: 2.875,
            y: 2.824,
            w: 493.9,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20header%20with%20padding.%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20(%20)%20%3D%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 3.5460000000000003,
            w: 5.56,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 48.476,
            w: 493.9,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20footer%20with%20padding.%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 10.519,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 11.241,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 11.964,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 12.686,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 13.409,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 14.131,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 14.854,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 15.576,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 16.299,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 17.021,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 17.744,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 18.466,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 19.189,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 19.911,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 20.634,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 21.356,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 22.079,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 22.801,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 23.524,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 24.246,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 24.969,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 25.691,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 26.414,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 27.136,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 27.859,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 28.581,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 29.304,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 30.026,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 30.749,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 31.470999999999997,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 32.194,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 32.916,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 33.639,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 34.361,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 35.084,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 35.806,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 36.529,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 37.251,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 37.974,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 38.696,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 39.419,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 40.141,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          }
        ],
        Fields: [],
        Boxsets: []
      },
      {
        Width: 37.188,
        Height: 52.625,
        HLines: [],
        VLines: [],
        Fills: [],
        Texts: [
          {
            x: 2.875,
            y: 2.824,
            w: 493.9,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20header%20with%20padding.%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20(%20)%20%3D%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 3.5460000000000003,
            w: 5.56,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 48.476,
            w: 493.9,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20footer%20with%20padding.%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 10.519,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 11.241,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 11.964,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 12.686,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 13.409,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 14.131,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 14.854,
            w: 489.75,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20body%20and%20I%20have%20padding%20a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t%20u%20v%20x%20y%20z%20%C3%A5%20%C3%A4%20%C3%B6%201%202%203%204%205%206%207%208%209%200%20!%20%23%20%C2%A4%20%25%20%26%20%2F%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 2.875,
            y: 15.576,
            w: 26.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "(%20)%20%3D%20%3F",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          }
        ],
        Fields: [],
        Boxsets: []
      }
    ],
  },
};
