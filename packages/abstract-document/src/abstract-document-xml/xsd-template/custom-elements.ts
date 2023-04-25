/* eslint-disable no-useless-escape */
export const textParagraph = `<xs:complexType name="TextParagraph">
	<xs:annotation>
		<xs:documentation>Shortcut to create \\<Paragraph> \\<TextRun text="..." /> \\</Paragraph></xs:documentation>
	</xs:annotation>
	<xs:choice minOccurs="0" maxOccurs="1">
		<xs:element name="style" type="TextStyle" />
	</xs:choice>
	<xs:attribute name="styleNames" type="xs:string" >
		<xs:annotation>
			<xs:documentation>Refrence to a TextStyle that is defined in \\<AbstractDoc> \\<StyleNames> \\<StyleName name="..." /> \\</StyleNames> \\</AbstractDoc></xs:documentation>
		</xs:annotation>
	</xs:attribute>
	<xs:attribute name="target" type="xs:string" />
	<xs:attribute name="text" type="xs:string" use="required" />
</xs:complexType>`;
export const textParagraphElement = `<xs:element name="TextParagraph" type="TextParagraph" maxOccurs="unbounded" />`;

export const textCell = `<xs:complexType name="TextCell">
	<xs:annotation>
		<xs:documentation>Shortcut to create a \\<TableCell> \\<Paragraph> \\<TextRun text="..." /> \\</Paragraph> \\</TableCell></xs:documentation>
	</xs:annotation>
	<xs:choice minOccurs="0" maxOccurs="1">
		<xs:element name="style" type="TextStyle" />
	</xs:choice>
	<xs:attribute name="styleNames" type="xs:string" >
		<xs:annotation>
		<xs:documentation>Refrence to a TextStyle that is defined in \\<AbstractDoc> \\<StyleNames> \\<StyleName name="..." /> \\</StyleNames> \\</AbstractDoc></xs:documentation>
		</xs:annotation>
	</xs:attribute>
	<xs:attribute name="target" type="xs:string" />
	<xs:attribute name="columnSpan" type="xs:string" />
	<xs:attribute name="rowSpan" type="xs:string" />
	<xs:attribute name="text" type="xs:string" use="required" />
</xs:complexType>`;
export const textCellElement = `<xs:element name="TextCell" type="TextCell" minOccurs="0" maxOccurs="unbounded" />`;

export const textRow = `<xs:complexType name="TextRow">
	<xs:annotation>
		<xs:documentation>Shortcut to create a \\<TableRow> \\<TableCell> \\<Paragraph> \\<TextRun text="..." /> \\</Paragraph> \\</TableCell> \\</TableRow></xs:documentation>
	</xs:annotation>
	<xs:choice minOccurs="0" maxOccurs="1">
		<xs:element name="style" type="TextStyle" />
	</xs:choice>
	<xs:attribute name="styleNames" type="xs:string" >
		<xs:annotation>
		<xs:documentation>Refrence to a TextStyle that is defined in \\<AbstractDoc> \\<StyleNames> \\<StyleName name="..." /> \\</StyleNames> \\</AbstractDoc></xs:documentation>
		</xs:annotation>
	</xs:attribute>
	<xs:attribute name="target" type="xs:string" />
	<xs:attribute name="columnSpan" type="xs:string" />
	<xs:attribute name="rowSpan" type="xs:string" />
	<xs:attribute name="text" type="xs:string" use="required" />
</xs:complexType>`;

export const textRowElement = `<xs:element name="TextRow" type="TextRow" maxOccurs="unbounded" />`;
