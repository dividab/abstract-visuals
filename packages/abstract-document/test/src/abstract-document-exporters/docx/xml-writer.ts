import { assert } from "chai";
import { XmlWriter } from "../../../../src/abstract-document-exporters/docx/xml-writer";

describe("XmlWriter", () => {
  it("should write xml processing instruction at start-document", () => {
    const writer = new XmlWriter();
    writer.WriteStartDocument(true);
    assert.equal(
      writer.getXml(),
      `<?xml version="1.0" encoding="utf-8" standalone="yes"?>`
    );
  });

  it("should shorthand close tag if no content and no attribute", () => {
    const writer = new XmlWriter();
    writer.WriteStartElement("localName");
    writer.WriteEndElement();
    assert.equal(writer.getXml(), `<localName />`);
  });

  it("should shorthand close tag if no content but attribute", () => {
    const writer = new XmlWriter();
    writer.WriteStartElement("localName");
    writer.WriteAttributeString("localName", "value");
    writer.WriteEndElement();
    assert.equal(writer.getXml(), `<localName localName="value" />`);
  });

  it("should write without namespace", () => {
    const writer = new XmlWriter();
    writer.WriteStartElement("localName");
    writer.WriteAttributeString("localName", "value");
    writer.WriteString("Some content");
    writer.WriteEndElement();
    assert.equal(
      writer.getXml(),
      `<localName localName="value">Some content</localName>`
    );
  });

  it("should write with namespace and prefix", () => {
    const writer = new XmlWriter();
    writer.WriteStartElement("localName", "ns", "prefix");
    writer.WriteAttributeString("localName", "value", "ns", "prefix");
    writer.WriteString("Some content");
    writer.WriteEndElement();
    assert.equal(
      writer.getXml(),
      `<prefix:localName prefix:localName="value" xmlns:prefix="ns">Some content</prefix:localName>`
    );
  });

  it("should write with namespace without prefix", () => {
    const writer = new XmlWriter();
    writer.WriteStartElement("localName", "ns");
    writer.WriteAttributeString("localName", "value", "ns");
    writer.WriteString("Some content");
    writer.WriteEndElement();
    assert.equal(
      writer.getXml(),
      `<localName p1:localName="value" xmlns="ns" xmlns:p1="ns">Some content</localName>`
    );
  });

  it("should not repeat namespaces in elements", () => {
    const writer = new XmlWriter();
    writer.WriteStartElement("parent", "ns");
    writer.WriteStartElement("child", "ns");
    writer.WriteStartElement("grandChild", "ns");
    writer.WriteEndElement();
    writer.WriteEndElement();
    writer.WriteEndElement();
    assert.equal(
      writer.getXml(),
      `<parent xmlns="ns">\n  <child>\n    <grandChild />\n  </child>\n</parent>`
    );
  });

  it("should invent new prefix for attributes if the namespace has blank prefix", () => {
    const writer = new XmlWriter();
    writer.WriteStartElement("parent", "ns");
    writer.WriteAttributeString("foo", "bar", "ns");
    writer.WriteEndElement();
    assert.equal(
      writer.getXml(),
      `<parent p1:foo="bar" xmlns="ns" xmlns:p1="ns" />`
    );
  });

  it("should not not invent new prefix for attributes if the  namespace already has a prefix", () => {
    const writer = new XmlWriter();
    writer.WriteStartElement("root", "ns", "prefix");
    writer.WriteAttributeString("foo", "bar", "ns");
    writer.WriteEndElement();
    assert.equal(
      writer.getXml(),
      `<prefix:root prefix:foo="bar" xmlns:prefix="ns" />`
    );
  });

  // it("should error if writing passed root", () => {
  //   const writer = new XmlWriter();
  //   writer.WriteStartElement("root", "ns", "prefix");
  //   writer.WriteEndElement();
  //   assert.throws(writer.WriteEndElement, "function throws a reference error");
  // });

  it("should WriteElementString", () => {
    const writer = new XmlWriter();
    writer.WriteElementString("root", "value", "ns", "prefix");
    assert.equal(
      writer.getXml(),
      `<prefix:root xmlns:prefix="ns">value</prefix:root>`
    );
  });

  it("should self-close WriteElementString if value is blank", () => {
    const writer = new XmlWriter();
    writer.WriteElementString("root", "", "ns", "prefix");
    assert.equal(writer.getXml(), `<prefix:root xmlns:prefix="ns" />`);
  });
});
