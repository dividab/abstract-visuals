# Change Log

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased](https://github.com/dividab/property/compare/abstract-document@6.0.1...master)

### Added

### Changed

- Catch-up of the changelog.
- Parsing svg colors to lower case to work with Svg-To-PdfKit.

### Removed

## [v6.0.1](https://github.com/dividab/property/compare/abstract-document@6.0.0...abstract-document@6.0.1) - 2021-09-02

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
