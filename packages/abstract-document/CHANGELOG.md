# Change Log

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [15.2.0] - 2025-08-21

- Added helper functions for Handlebars

## [15.1.0] - 2025-08-14

- Added characterSpacing

## [15.0.12] - 2025-04-29

- Handlebars fixes
- Handlebars helpers

## [15.0.0] - 2025-04-29

- Replaced Mustache with Handlebars

## [14.0.1] - 2025-03-27

- Changed Markdown.create so it always returns a Group since downstream functions assume no arrays.
- Added default format for unordered lists

## [14.0.0] - 2024-11-29

- ~~Switch to ES Modules from CommonJS~~ Libraries should be in commonjs, for now...

## [13.0.0] - 2024-11-28

- Switch from yarn to pnpm.

## [12.0.0] - 2024-11-27

- AD xml fixes.

## [11.2.0] - 2024-07-08

### Added

- Support abstract images with dashed lines in the PDF exporter

## [11.0.0] - 2024-05-19

### Changed

- pdfkit 0.12.x -> 0.15.0

## [10.0.0] - 2024-04-05

### Added

### Changed

- React 16 -> 18

### Removed

- Rambda

## [6.17.0](https://github.com/dividab/abstract-visuals/compare/abstract-document@6.15.0...abstract-document@6.17.0)

### Added

- Added added `fontWeight` to TextStyle as an alternative to specify font weight. This will override the flags `light`, `normal`, `bold`, `mediumBold` and `extraBold`.
- Added the additional font weights `light` and `extraBold` to TextSyle

### Changed

- Fixed bug where descendant text styles didn't override font weight correctly

### Removed

## [6.15.0](https://github.com/dividab/abstract-visuals/compare/abstract-document@6.10.4...abstract-document@6.15.0) - 2024-02-09

### Added

- Added support for explicit line breaks inside paragraphs
- Custom XML elements
- Exported ImageResources type
- Added an XML validator using Mustache
- Added export options for creating PDFs, allows setting a compression flag for smaller file size

### Changed

### Removed

## [6.10.4](https://github.com/dividab/abstract-visuals/compare/abstract-document@6.9.6...abstract-document@6.10.4) - 2023-04-25

### Added

- Abstract doc xml

### Changed

### Removed

## [v.6.9.6](https://github.com/dividab/abstract-visuals/compare/abstract-document@6.9.5...abstract-document@6.9.6) - 2023-04-13

### Added

### Changed

- Improve table layout measurement for long cells combined with row spans

### Removed

## [v.6.9.5](https://github.com/dividab/abstract-visuals/compare/abstract-document@6.9.4...abstract-document@6.9.5) - 2023-04-13

### Added

### Changed

- Improve table layout measurement for long cells combined with row spans

### Removed

## [v.6.9.4](https://github.com/dividab/abstract-visuals/compare/abstract-document@6.9.3...abstract-document@6.9.4) - 2022-10-03

### Added

### Changed

- Word text uses the font from style.fontFamily

### Removed

## [v.6.9.3](https://github.com/dividab/abstract-visuals/compare/abstract-document@6.9.0...abstract-document@6.9.3) - 2022-06-09

### Added

- Placeholder for TocSeparator in word

### Changed

- Grouping implemented with keepNext for word
- Fix for page orientation in word

### Removed

## [v.6.9.0](https://github.com/dividab/abstract-visuals/compare/abstract-document@6.8.2...abstract-document@6.9.0) - 2022-06-03

### Added

- Support for PNG and URL images with upgrade of abstract-image to 3.3.0

### Changed

### Removed

## [v.6.8.2](https://github.com/dividab/abstract-visuals/compare/abstract-document@6.8.1......abstract-document@6.8.2)

### Added

### Changed

- Fix for docx, now parsing page dimensions.

### Removed

## [v6.8.1](https://github.com/dividab/abstract-visuals/compare/abstract-document@6.8.0...abstract-document@6.8.1) - 2022-04-07

### Changed

- Fixed crash when an SVG has 0 in a dasharray

## [v6.8.0](https://github.com/dividab/abstract-visuals/compare/abstract-document@6.7.2...abstract-document@6.8.0) - 2022-03-04

### Added

- Added width field for TocSeparator

## [v6.7.2](https://github.com/dividab/abstract-visuals/compare/abstract-document@6.7.0...abstract-document@6.7.2) - 2022-02-16

### Changed

- Fixed footers height being too large when using absolute positioned elements
- Fixed text style property 'underline' now affecting if hyperlinks get underlined or not. By default hyperlinks are underlined.

## [v6.7.0](https://github.com/dividab/abstract-visuals/compare/abstract-document@6.6.0...abstract-document@6.7.0) - 2022-02-15

### Added

- Added baseline text style field

## [v6.6.0](https://github.com/dividab/abstract-visuals/compare/abstract-document@6.5.1...abstract-document@6.6.0) - 2022-02-09

### Added

- Added absolute positioning for section elements when rendering PDFs in abstract document

### Changed

- Fixed margin left and right not affecting paragraphs

## [v6.5.1](https://github.com/dividab/abstract-visuals/compare/abstract-document@6.4.0...abstract-document@6.5.1) - 2022-01-05

### Added

- Added italic and mediumBold as options for texts in abstract image

### Changed

- Fixed bold text rendering for abstract image texts

## [v6.4.0](https://github.com/dividab/abstract-visuals/compare/abstract-document@6.0.1...abstract-document@6.4.0) - 2021-11-24

### Added

- Add feature to allow setting border colors of cells separately
- Add table cell parameter "rowSpan" to allow setting the number of rows a cell should span
- Allow tables to be split and continue on the next page if they overflow a page
- Add support for repeatable headers for tables

### Changed

- Catch-up of the changelog.
- Parsing svg colors to lower case to work with Svg-To-PdfKit.
- Splitting tables if they are directly after each other.
- Fix crash when tables has no rows
- Fix table layout when using Infinity on column widths
- Fix cell border widths not setting properly

## [v6.0.1](https://github.com/dividab/abstract-visuals/compare/abstract-document@6.0.0...abstract-document@6.0.1) - 2021-09-02

### Added

- Reminder to update changelog.

## [v6.0.0](https://github.com/dividab/abstract-visuals/compare/abstract-document@5.1.2...abstract-document@6.0.0) - 2021-09-02

### Changed

- Positioning for sub/super script has been changed.
- New logic for concatinating textatoms within the same paragraph.
- Fixed alignment offset for underscore.
- Fixed so vertical alignment in cells consider cell padding.
- Update react from 15.0.34 to 16.9.0.
- Fixes a crash when creating pdfs with markdown/svgs. Importing with \* no longer works after the build/ts change.

## [v5.1.2](https://github.com/dividab/abstract-visuals/compare/abstract-document@5.0.3...abstract-document@5.1.2) - 2021-05-25

### Added

- Added hyperlinks for Docx exporter.
- Added page orientation for Docx exporter.
- Added option to render abstract document to the Docx format.

## [v5.0.3](https://github.com/dividab/abstract-visuals/compare/abstract-document@4.3.16...abstract-document@5.0.3) - 2021-03-29

### Added

- Added test for fonts.
- Added a compensation for text width in measure to avoid unintentional line break in pdfKit.
- Added a flag called 'lineBreak' to textStyle that if set to false will truncate text rather than making a line breaking if the available space is too short to fit the text. By default the flag is true.

### Changed

- Fixed for multiple elements in same cell to align.

- Fixed vertical alignment of atom in a tableCell.

## v4.3.16 - 2021-03-24

- Start of changelog.
