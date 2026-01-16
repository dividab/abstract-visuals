export const StyleNames = `<xs:complexType name="StyleNames">
	<xs:sequence>
		<xs:element name="StyleName" minOccurs="0" maxOccurs="unbounded" />
	</xs:sequence>
</xs:complexType>`;

export const paddingAttributes = `
  <xs:attribute name="paddingTop" type="xs:decimal"/>
  <xs:attribute name="paddingRight" type="xs:decimal"/>
  <xs:attribute name="paddingBottom" type="xs:decimal"/>
  <xs:attribute name="paddingLeft" type="xs:decimal"/>
`;

export const bordersAttributes = `
  <xs:attribute name="borderTop" type="xs:decimal"/>
  <xs:attribute name="borderRight" type="xs:decimal"/>
  <xs:attribute name="borderBottom" type="xs:decimal"/>
  <xs:attribute name="borderLeft" type="xs:decimal"/>
`;

export const marginsAttributes = `
  <xs:attribute name="marginTop" type="xs:decimal"/>
  <xs:attribute name="marginRight" type="xs:decimal"/>
  <xs:attribute name="marginBottom" type="xs:decimal"/>
  <xs:attribute name="marginLeft" type="xs:decimal"/>
`;

export const borderColorsAttributes = `
  <xs:attribute name="borderColorTop" type="xs:string"/>
  <xs:attribute name="borderColorRight" type="xs:string"/>
  <xs:attribute name="borderColorBottom" type="xs:string"/>
  <xs:attribute name="borderColorLeft" type="xs:string"/>
`;

export const StyleName = `<xs:complexType name="StyleName">
	${borderColorsAttributes}
	${marginsAttributes}
	${bordersAttributes}
	${paddingAttributes}
	<xs:attribute name="name" type="xs:string" use="required" />
	<xs:attribute name="type" use="required">
		<xs:annotation>
			<xs:documentation>The type of style used. One of: "GroupStyle", "TableStyle", "TableCellStyle", "ParagraphStyle", "TextStyle", </xs:documentation>
		</xs:annotation>
		<xs:simpleType>
			<xs:restriction base="xs:string">
				<xs:enumeration value="GroupStyle" />
				<xs:enumeration value="TableStyle" />
				<xs:enumeration value="TableCellStyle" />
				<xs:enumeration value="ParagraphStyle" />
				<xs:enumeration value="TextStyle" />
			</xs:restriction>
		</xs:simpleType>
	</xs:attribute>
	<xs:attribute name="margins" type="xs:string" />
	<xs:attribute name="position" type="Position"/>
	<xs:attribute name="background" type="xs:string" />
	<xs:attribute name="border" type="xs:string" />
	<xs:attribute name="borders" type="xs:string" />
	<xs:attribute name="borderColor" type="xs:string" />
	<xs:attribute name="borderColors" type="xs:string" />
	<xs:attribute name="padding" type="xs:string" />
	<xs:attribute name="verticalAlignment">
		<xs:simpleType>
			<xs:restriction base="xs:string">
				<xs:enumeration value="Top" />
				<xs:enumeration value="Middle" />
				<xs:enumeration value="Bottom" />
			</xs:restriction>
		</xs:simpleType>
	</xs:attribute>
	<xs:attribute name="underline" type="xs:boolean" />
	<xs:attribute name="superScript" type="xs:boolean" />
	<xs:attribute name="subScript" type="xs:boolean" />
	<xs:attribute name="italic" type="xs:boolean" />
	<xs:attribute name="lineBreak" type="xs:boolean" />
	<xs:attribute name="mediumBold" type="xs:boolean" />
	<xs:attribute name="bold" type="xs:boolean" />
	<xs:attribute name="fontScale" type="xs:decimal" />
	<xs:attribute name="fontSize" type="xs:decimal" />
	<xs:attribute name="lineGap" type="xs:decimal" />
	<xs:attribute name="characterSpacing" type="xs:decimal" />
	<xs:attribute name="verticalPosition" type="xs:decimal" />
	<xs:attribute name="indent" type="xs:decimal" />
	<xs:attribute name="color" type="xs:string" />
	<xs:attribute name="fontFamily" type="xs:string" />
	<xs:attribute name="alignment">
		<xs:simpleType>
			<xs:restriction base="xs:string">
				<xs:enumeration value="Start" />
				<xs:enumeration value="Center" />
				<xs:enumeration value="End" />
				<xs:enumeration value="Justify" />
			</xs:restriction>
		</xs:simpleType>
	</xs:attribute>
	<xs:attribute name="baseline">
		<xs:simpleType>
			<xs:restriction base="xs:string">
				<xs:enumeration value="top" />
				<xs:enumeration value="bottom" />
				<xs:enumeration value="middle" />
				<xs:enumeration value="alphabetic" />
				<xs:enumeration value="hanging" />
			</xs:restriction>
		</xs:simpleType>
	</xs:attribute>
</xs:complexType>`;

export const groupStyle = `<xs:complexType name="GroupStyle">
	${marginsAttributes}
	<xs:annotation>
		<xs:documentation>Group style</xs:documentation>
	</xs:annotation>
	<xs:attribute name="position" type="Position">
		<xs:annotation>
			<xs:documentation>Alignment possible values "absolute" | "relative" </xs:documentation>
		</xs:annotation>
	</xs:attribute>
	<xs:attribute name="margins" type="xs:string" >
		<xs:annotation>
			<xs:documentation>Margin "top right bottom left"</xs:documentation>
		</xs:annotation>
	</xs:attribute>
</xs:complexType>`;

export const tableCellStyle = `<xs:complexType name="TableCellStyle">
	${paddingAttributes}
	${bordersAttributes}
	${borderColorsAttributes}
	<xs:annotation>
		<xs:documentation>Table cell style</xs:documentation>
	</xs:annotation>
	<xs:attribute name="background" type="xs:string" />
	<xs:attribute name="border" type="xs:string" >
		<xs:annotation>
			<xs:documentation>Border "top right bottom left"</xs:documentation>
		</xs:annotation>
	</xs:attribute>
	<xs:attribute name="borders" type="xs:string" >
		<xs:annotation>
			<xs:documentation>Border "top right bottom left"</xs:documentation>
		</xs:annotation>
	</xs:attribute>
	<xs:attribute name="borderColor" type="xs:string" >
		<xs:annotation>
			<xs:documentation>Bordercolor "top right bottom left"</xs:documentation>
		</xs:annotation>
	</xs:attribute>
	<xs:attribute name="borderColors" type="xs:string" >
		<xs:annotation>
			<xs:documentation>Bordercolor "top right bottom left"</xs:documentation>
		</xs:annotation>
	</xs:attribute>
	<xs:attribute name="padding" type="xs:string" >
		<xs:annotation>
			<xs:documentation>Padding "top right bottom left"</xs:documentation>
		</xs:annotation>
	</xs:attribute>
	<xs:attribute name="verticalAlignment">
		<xs:annotation>
			<xs:documentation>Vertical alignment possible values "Top" | "Middle" | "Bottom" </xs:documentation>
		</xs:annotation>
		<xs:simpleType>
			<xs:restriction base="xs:string">
				<xs:enumeration value="Top" />
				<xs:enumeration value="Middle" />
				<xs:enumeration value="Bottom" />
			</xs:restriction>
		</xs:simpleType>
	</xs:attribute>
</xs:complexType>`;

export const tableStyle = `<xs:complexType name="TableStyle">
	${marginsAttributes}
	<xs:annotation>
		<xs:documentation>Table style</xs:documentation>
	</xs:annotation>
	<xs:sequence>
		<xs:element name="cellStyle" type="TableCellStyle" minOccurs="0" maxOccurs="1" />
	</xs:sequence>
	<xs:attribute name="position" type="Position">
		<xs:annotation>
			<xs:documentation>Alignment possible values "absolute" | "relative" </xs:documentation>
		</xs:annotation>
	</xs:attribute>
	<xs:attribute name="margins" type="xs:string" >
		<xs:annotation>
			<xs:documentation>Margin "top right bottom left"</xs:documentation>
		</xs:annotation>
	</xs:attribute>
	<xs:attribute name="alignment">
		<xs:annotation>
			<xs:documentation>Alignment possible values "Left" | "Center" | "Right" </xs:documentation>
		</xs:annotation>
		<xs:simpleType>
			<xs:restriction base="xs:string">
				<xs:enumeration value="Left" />
				<xs:enumeration value="Center" />
				<xs:enumeration value="Right" />
			</xs:restriction>
		</xs:simpleType>
	</xs:attribute>
</xs:complexType>`;

export const paragraphStyle = `<xs:complexType name="ParagraphStyle">
	${paddingAttributes}
	<xs:annotation>
		<xs:documentation>Paragraph style</xs:documentation>
	</xs:annotation>
	<xs:sequence>
		<xs:element name="textStyle" type="TextStyle" minOccurs="0" />
	</xs:sequence>
	<xs:attribute name="position" type="Position">
		<xs:annotation>
			<xs:documentation>Alignment possible values "absolute" | "relative" </xs:documentation>
		</xs:annotation>
	</xs:attribute>
	<xs:attribute name="margins" type="xs:string" >
		<xs:annotation>
			<xs:documentation>Margin "top right bottom left"</xs:documentation>
		</xs:annotation>
	</xs:attribute>
	<xs:attribute name="alignment">
		<xs:annotation>
			<xs:documentation>Alignment possible values "Start" | "Center" | "End" | "Justify" </xs:documentation>
		</xs:annotation>
		<xs:simpleType>
			<xs:restriction base="xs:string">
				<xs:enumeration value="Start" />
				<xs:enumeration value="Center" />
				<xs:enumeration value="End" />
				<xs:enumeration value="Justify" />
			</xs:restriction>
		</xs:simpleType>
	</xs:attribute>
</xs:complexType>`;

export const textStyle = `<xs:complexType name="TextStyle">
	<xs:annotation>
		<xs:documentation>Text style</xs:documentation>
	</xs:annotation>
	<xs:attribute name="underline" type="xs:boolean" />
	<xs:attribute name="superScript" type="xs:boolean" />
	<xs:attribute name="subScript" type="xs:boolean" />
	<xs:attribute name="italic" type="xs:boolean" />
	<xs:attribute name="lineBreak" type="xs:boolean" />
	<xs:attribute name="mediumBold" type="xs:boolean" />
	<xs:attribute name="bold" type="xs:boolean" />
	<xs:attribute name="fontScale" type="xs:decimal" />
	<xs:attribute name="fontSize" type="xs:decimal" />
	<xs:attribute name="lineGap" type="xs:decimal" />
	<xs:attribute name="characterSpacing" type="xs:decimal" />
	<xs:attribute name="verticalPosition" type="xs:decimal" />
	<xs:attribute name="indent" type="xs:decimal" />
	<xs:attribute name="color" type="xs:string" />
	<xs:attribute name="fontFamily" type="xs:string" />
	<xs:attribute name="baseline">
		<xs:simpleType>
			<xs:restriction base="xs:string">
				<xs:enumeration value="top" />
				<xs:enumeration value="bottom" />
				<xs:enumeration value="middle" />
				<xs:enumeration value="alphabetic" />
				<xs:enumeration value="hanging" />
			</xs:restriction>
		</xs:simpleType>
	</xs:attribute>
</xs:complexType>`;

export const masterPageStyle = `<xs:complexType name="MasterPageStyle">
	<xs:all>
		<xs:element name="headerMargins" type="LayoutFoundation" />
		<xs:element name="footerMargins" type="LayoutFoundation" />
		<xs:element name="firstPageHeaderMargins" type="LayoutFoundation" minOccurs="0" />
		<xs:element name="firstPageFooterMargins" type="LayoutFoundation" minOccurs="0" />
		<xs:element name="contentMargins" type="LayoutFoundation" />
		<xs:element name="columnLayout" type="PageColumnLayout" minOccurs="0" maxOccurs="1" />
	</xs:all>
	<xs:attribute name="paperSize" use="required">
		<xs:simpleType>
		<xs:annotation>
		<xs:documentation>PaperSize possible values "A4" | "Letter" </xs:documentation>
		</xs:annotation>
			<xs:restriction base="xs:string">
				<xs:enumeration value="A4" />
				<xs:enumeration value="Letter" />
			</xs:restriction>
		</xs:simpleType>
	</xs:attribute>
	<xs:attribute name="orientation">
		<xs:simpleType>
			<xs:restriction base="xs:string">
				<xs:enumeration value="Portrait" />
				<xs:enumeration value="Landscape" />
			</xs:restriction>
		</xs:simpleType>
	</xs:attribute>
	<xs:attribute name="noTopBottomMargin" type="xs:boolean" />
</xs:complexType>`;

export const position = `<xs:simpleType name="Position">
	<xs:annotation>
	<xs:documentation>Alignment possible values "absolute" | "relative" </xs:documentation>
	</xs:annotation>
	<xs:restriction base="xs:string">
		<xs:enumeration value="absolute" />
		<xs:enumeration value="relative" />
	</xs:restriction>
</xs:simpleType>`;

export const layoutFoundation = `<xs:complexType name="LayoutFoundation">
	<xs:attribute name="top" type="xs:decimal" />
	<xs:attribute name="bottom" type="xs:decimal" />
	<xs:attribute name="left" type="xs:decimal" />
	<xs:attribute name="right" type="xs:decimal" />
</xs:complexType>`;

export const pageColumnLayout = `<xs:complexType name="PageColumnLayout">
	<xs:attribute name="columnCount" type="xs:decimal" />
	<xs:attribute name="columnGap" type="xs:decimal" />
</xs:complexType>`;