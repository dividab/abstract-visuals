import { describe, expect, it } from "vitest";
import { group } from "../../abstract-3d.js";
import { groupPropsEqual, type ReactGroupProps } from "./react-group.js";

const base: ReactGroupProps = {
  g: group([]),
  hoveredIdsExternal: undefined,
  selectedIds: { a: true },
  hotSpotsActive: false,
  activeComponents: { a: "Error" },
  id: "a",
  rootData: undefined,
  onClickGroup: () => undefined,
};

describe("groupPropsEqual", () => {
  it("is equal for the same props", () => {
    expect(groupPropsEqual(base, { ...base })).toBe(true);
  });

  it("ignores selectedIds and activeComponents objects that hold the same values for the group's id", () => {
    expect(groupPropsEqual(base, { ...base, selectedIds: { a: true, b: false }, activeComponents: { a: "Error", b: "Warning" } })).toBe(true);
  });

  it("is not equal when the group's own selection changes", () => {
    expect(groupPropsEqual(base, { ...base, selectedIds: {} })).toBe(false);
    expect(groupPropsEqual(base, { ...base, selectedIds: { a: false } })).toBe(false);
  });

  it("is not equal when the group's own material state changes", () => {
    expect(groupPropsEqual(base, { ...base, activeComponents: { a: "Warning" } })).toBe(false);
    expect(groupPropsEqual(base, { ...base, activeComponents: undefined })).toBe(false);
  });

  it("is equal when only other groups' selection or material state changes", () => {
    expect(groupPropsEqual(base, { ...base, selectedIds: { a: true, b: true }, activeComponents: { a: "Error", b: "Accept" } })).toBe(true);
  });

  it("is not equal when another prop changes identity", () => {
    expect(groupPropsEqual(base, { ...base, g: group([]) })).toBe(false);
    expect(groupPropsEqual(base, { ...base, onClickGroup: () => undefined })).toBe(false);
    expect(groupPropsEqual(base, { ...base, hotSpotsActive: true })).toBe(false);
    expect(groupPropsEqual(base, { ...base, id: "b" })).toBe(false);
  });

  it("is not equal when a prop is added or removed", () => {
    expect(groupPropsEqual(base, { ...base, useAlphaTest: true })).toBe(false);
    expect(groupPropsEqual({ ...base, useAlphaTest: true }, base)).toBe(false);
  });

  it("looks up the next id when the group has none", () => {
    const anonymous = { ...base, id: undefined, selectedIds: { "": true }, activeComponents: undefined };
    expect(groupPropsEqual(anonymous, { ...anonymous, selectedIds: { "": true, a: true } })).toBe(true);
    expect(groupPropsEqual(anonymous, { ...anonymous, selectedIds: {} })).toBe(false);
  });
});
