# Change Log

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased](https://github.com/dividab/abstract-visuals/compare/abstract-document@6.7.0...master)

### Added

### Changed

### Removed

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
