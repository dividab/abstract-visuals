import { textCellElement, textParagraphElement, textRowElement } from "./custom-elements.js";

export const abstractDoc = `<xs:element name="AbstractDoc">
    <xs:complexType>
		<xs:sequence>
				<xs:element name="StyleNames" type="StyleNames" minOccurs="0"></xs:element>
				<xs:element name="Section" type="Section"></xs:element>
		</xs:sequence>
	</xs:complexType>
</xs:element>`;

export const section = `<xs:complexType name="Section">
	<xs:choice maxOccurs="unbounded">
		<xs:element name="Table" type="Table" minOccurs="0" />
		<xs:element name="Group" type="Group" minOccurs="0" />
		<xs:element name="PageBreak" type="PageBreak" minOccurs="0" />
		<xs:element name="Paragraph" type="Paragraph" minOccurs="0" />
		${textParagraphElement}
		<xs:element name="Markdown" type="Markdown" minOccurs="0" />
		<xs:element name="page" type="page" minOccurs="0" maxOccurs="1"></xs:element>
	</xs:choice>
</xs:complexType>`;

export const page = `<xs:complexType name="page">
	<xs:annotation>
		<xs:documentation>Define header and footer.</xs:documentation>
	</xs:annotation>
	<xs:all>
		<xs:element name="style" type="MasterPageStyle" />
		<xs:element name="header" type="SectionElement" minOccurs="0" />
		<xs:element name="footer" type="SectionElement" minOccurs="0"/>
	</xs:all>
</xs:complexType>`;

export const sectionElement = `<xs:complexType name="SectionElement">
	<xs:choice maxOccurs="unbounded">
		<xs:element name="Table" type="Table" minOccurs="0" />
		<xs:element name="Group" type="Group" minOccurs="0" />
		<xs:element name="PageBreak" type="PageBreak" minOccurs="0" />
		<xs:element name="Paragraph" type="Paragraph" minOccurs="0" />
		${textParagraphElement}
		<xs:element name="Markdown" type="Markdown" minOccurs="0" />
	</xs:choice>
</xs:complexType>`;

export const group = `<xs:complexType name="Group">
	<xs:choice maxOccurs="unbounded">
		<xs:element name="Table" type="Table" minOccurs="0" />
		<xs:element name="Group" type="Group" minOccurs="0" />
		<xs:element name="PageBreak" type="PageBreak" minOccurs="0" />
		<xs:element name="Paragraph" type="Paragraph" minOccurs="0" />
		${textParagraphElement}
		<xs:element name="style" type="GroupStyle" minOccurs="0" />
	</xs:choice>
	<xs:attribute name="keepTogether" type="xs:boolean" />
</xs:complexType>`;

export const table = `<xs:complexType name="Table">
	<xs:choice maxOccurs="unbounded">
		<xs:element name="headerRows" type="headerRows" minOccurs="0" maxOccurs="1" />
		<xs:element name="style" type="TableStyle" minOccurs="0" maxOccurs="1" />
		<xs:sequence>
			<xs:choice minOccurs="1">
				<xs:element name="TableRow" type="TableRow"  maxOccurs="unbounded" />
				${textRowElement}
			</xs:choice>
		</xs:sequence>
	</xs:choice>
	<xs:attribute name="styleName" type="xs:string" >
		<xs:annotation>
			<xs:documentation>Refrence to a TextStyle that is defined in \\<AbstractDoc> \\<StyleNames> \\<StyleName name="..." /> \\</StyleNames> \\</AbstractDoc></xs:documentation>
		</xs:annotation>
	</xs:attribute>
	<xs:attribute name="columnWidths" type="xs:string" use="required">
		<xs:annotation>
			<xs:documentation>ColumnWidths of table. Seperated by ,. Eg. "100,399,200". Need atleast one columnWidth. Use "inf" to automatically adjust width: "100,Inf" </xs:documentation>
		</xs:annotation>
	</xs:attribute>
</xs:complexType>`;

export const headerRows = `<xs:complexType name="headerRows">
	<xs:sequence>
		<xs:choice minOccurs="1" maxOccurs="unbounded">
			<xs:element name="TableRow" type="TableRow"/>
			${textRowElement}
		</xs:choice>
	</xs:sequence>
</xs:complexType>`;

export const tableRow = `<xs:complexType name="TableRow">
	<xs:choice maxOccurs="unbounded">
		<xs:element name="TableCell" type="TableCell" minOccurs="0" maxOccurs="unbounded" />
		${textCellElement}
	</xs:choice>
</xs:complexType>`;

export const tableCell = `<xs:complexType name="TableCell">
	<xs:choice maxOccurs="unbounded">
		<xs:element name="style" type="TableCellStyle" minOccurs="0" maxOccurs="1" />
		<xs:element name="Table" type="Table" minOccurs="0" maxOccurs="unbounded" />
		<xs:element name="Group" type="Group" minOccurs="0" maxOccurs="unbounded" />
		<xs:element name="PageBreak" type="PageBreak" minOccurs="0" maxOccurs="unbounded" />
		<xs:element name="Paragraph" type="Paragraph" minOccurs="0" maxOccurs="unbounded" />
		${textParagraphElement}
		<xs:element name="Markdown" type="Markdown" minOccurs="0" maxOccurs="unbounded" />
	</xs:choice>
	<xs:attribute name="rowSpan" type="xs:integer" />
	<xs:attribute name="columnSpan" type="xs:integer" />
	<xs:attribute name="styleName" type="xs:string" >
		<xs:annotation>
			<xs:documentation>Refrence to a TextStyle that is defined in \\<AbstractDoc> \\<StyleNames> \\<StyleName name="..." /> \\</StyleNames> \\</AbstractDoc></xs:documentation>
		</xs:annotation>
	</xs:attribute>
</xs:complexType>`;

export const markdown = `<xs:complexType name="Markdown">
	<xs:attribute name="keepTogetherSections" type="xs:boolean" />
	<xs:attribute name="text" type="xs:string" />
</xs:complexType>`;

export const paragraph = `<xs:complexType name="Paragraph">
	<xs:choice minOccurs="0" maxOccurs="unbounded">
		<xs:element name="TextRun" type="TextRun" minOccurs="0" maxOccurs="unbounded"></xs:element>
		<xs:element name="TextField" type="TextField" minOccurs="0" maxOccurs="1"></xs:element>
		<xs:element name="Image" type="Image" minOccurs="0" maxOccurs="unbounded"></xs:element>
		<xs:element name="HyperLink" type="HyperLink" minOccurs="0" maxOccurs="unbounded"></xs:element>
		<xs:element name="LinkTarget" type="LinkTarget" minOccurs="0" maxOccurs="unbounded"></xs:element>
		<xs:element name="TocSeperator" type="TocSeperator" minOccurs="0" maxOccurs="unbounded"></xs:element>
		<xs:element name="style" type="ParagraphStyle" minOccurs="0" maxOccurs="1"></xs:element>
	</xs:choice>
	<xs:attribute name="styleName" type="xs:string" >
		<xs:annotation>
			<xs:documentation>Refrence to a TextStyle that is defined in \\<AbstractDoc> \\<StyleNames> \\<StyleName name="..." /> \\</StyleNames> \\</AbstractDoc></xs:documentation>
		</xs:annotation>
	</xs:attribute>
</xs:complexType>`;

export const hyperLink = `<xs:complexType name="HyperLink">
	<xs:choice>
		<xs:element name="style" type="TextStyle" minOccurs="0"/>
	</xs:choice>
	<xs:attribute name="styleName" type="xs:string" >
		<xs:annotation>
			<xs:documentation>Refrence to a TextStyle that is defined in \\<AbstractDoc> \\<StyleNames> \\<StyleName name="..." /> \\</StyleNames> \\</AbstractDoc></xs:documentation>
		</xs:annotation>
	</xs:attribute>
	<xs:attribute name="target" type="xs:string" />
	<xs:attribute name="text" type="xs:string" />
</xs:complexType>`;

export const tocSeparator = `<xs:complexType name="TocSeperator">
	<xs:attribute name="width" type="xs:decimal" />
</xs:complexType>`;

export const linkTarget = `<xs:complexType name="LinkTarget">
	<xs:attribute name="name" type="xs:string" />
</xs:complexType>`;

export const textRun = `<xs:complexType name="TextRun">
	<xs:choice minOccurs="0" maxOccurs="1">
		<xs:element name="style" type="TextStyle" />
	</xs:choice>
	<xs:attribute name="styleName" type="xs:string" >
		<xs:annotation>
			<xs:documentation>Refrence to a TextStyle that is defined in \\<AbstractDoc> \\<StyleNames> \\<StyleName name="..." /> \\</StyleNames> \\</AbstractDoc></xs:documentation>
		</xs:annotation>
	</xs:attribute>
	<xs:attribute name="target" type="xs:string" />
	<xs:attribute name="text" type="xs:string" use="required" />
</xs:complexType>`;

export const textField = `<xs:complexType name="TextField">
	<xs:sequence>
		<xs:element name="style" type="TextStyle" />
	</xs:sequence>
	<xs:attribute name="styleName" type="xs:string">
		<xs:annotation>
			<xs:documentation>Refrence to a TextStyle that is defined in \\<AbstractDoc> \\<StyleNames> \\<StyleName name="..." /> \\</StyleNames> \\</AbstractDoc></xs:documentation>
		</xs:annotation>
	</xs:attribute>
	<xs:attribute name="fieldType">
		<xs:simpleType>
			<xs:restriction base="xs:string">
				<xs:enumeration value="Date" />
				<xs:enumeration value="PageNumber" />
				<xs:enumeration value="TotalPages" />
				<xs:enumeration value="PageNumberOf" />
			</xs:restriction>
		</xs:simpleType>
	</xs:attribute>
	<xs:attribute name="target" type="xs:string" />
	<xs:attribute name="text" type="xs:string" />
</xs:complexType>`;

export const image = `<xs:complexType name="Image">
        <xs:attribute name="src" type="xs:string" use="required" />
        <xs:attribute name="width" type="xs:decimal" use="required" />
        <xs:attribute name="height" type="xs:decimal" use="required" />
</xs:complexType>`;

export const pageBreak = `<xs:complexType name="PageBreak" />`;
