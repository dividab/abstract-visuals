# Change Log

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [8.1.0] - 2024-09-17

### Added

- Support for custom pixels per tick to configure how many ticks should be generated. Default is 40 px/tick as before.

## [8.0.0] - 2024-06-14

### Added

- Added support for multiple axises per side of the chart grid. The data points will always refer to the first axis of the indicated side. Migrating from old to new is simple, just change it to an array.

  Old:

  ```
  createChart({
    ...
    xAxisBottom: myXAxis,
    ...
  })
  ```

  New:

  ```
  createChart({
    ...
    xAxisesBottom: [myXAxis],
    ...
  })
  ```

- Added `axisWidth` for customizing the width of the axises.
- Added support for data axises, a separately rendered axis type whose tick labels are a function values. Just supply some points defining the function These are rendered outside of the normal axises.

### Changed

- Padding is now additional space outside of the rendered elements, so the layout from left to right is now like this, the x-axises and paddings and heights are calculated in the same manner:

  1. Empty space defined by `padding.left`.
  2. One data axis per `chartDataAxisesLeft` in reverse order, each `axisWidth` wide.
  3. One data axis per `yAxisesLeft` in reverse order, each `axisWidth` wide.
  4. Grid area filling up remaining space.
  5. One data axis per `yAxisesRight` in normal order, each `axisWidth` wide.
  6. One data axis per `chartDataAxisesRight` in normal order, each `axisWidth` wide.
  7. Empty space defined by `padding.right`.

## [7.4.1] - 2024-05-29

### Changed

- Updated rendering of chart lines to be clipped within chart bounds

## [7.2.0] - 2024-05-22

### Added

- Support for id on abstract chart axises

## [7.1.0] - 2024-05-10

### Added

- Support for id parameter on chart objects to support abstract-image click functionality
- Text color and text outline color in charts

### Changed

- Changed text growth direction from down/right to automatic for point and line labels to keep them inside the grid

## [7.0.0] - 2024-05-06

### Added

- Chart padding
- Overridable font sizes for all texts.
- Discrete axises
- Rotate tick labels
- Disp tick labels

### Changed

- Separate x-grid & y-grid
- Separate styling of all axises
- Previous chart padding was {top: 40, right: 80, bottom: 40, left: 80}. New default padding is depending on axises.

### Example migrate 6 -> 7

- { ... gridColor: AI.black; gridThickness: 1; ... } ->
  { ... xGrid: { color: AI.black; thickness: 1 }, yGrid: { color: AI.black; thickness: 1 }, yGrid: { color: AI.black; thickness: 1 }, xAxisBottom: {... axisColor: AI.black, thickness: 1 ...}, yAxisLeft: {... axisColor: AI.black, thickness: 1 ...} ... };
- { ... ... } - > { ... padding: {top: 40, right: 80, bottom: 40, left: 80} ... }

## [6.0.0] - 2024-04-05

### Added

### Changed

- React 16 -> 18

### Removed

- Rambda

## [4.0.1](https://github.com/promaster-sdk/property/compare/abstract-chart@3.2.3...master)

### Added

- Support for larger axis numbers

### Changed

### Removed

## [v3.2.1](https://github.com/promaster-sdk/property/compare/abstract-chart@3.0.0...abstract-chart@3.2.1) - 2022-06-02

### Added

- Support for other font than Arial.

## v3.0.0 - 2021-03-24

- Start of changelog.
