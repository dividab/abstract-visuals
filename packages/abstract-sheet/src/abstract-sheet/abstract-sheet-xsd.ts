export const xsd = `<?xml version="1.1" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">

	<xs:element name="AbstractSheet">
		<xs:complexType>
			<xs:sequence>
				<xs:element name="Styles" type="Styles" minOccurs="0" maxOccurs="1" />
				<xs:element name="Sheet" type="Sheet" />
			</xs:sequence>
		</xs:complexType>
	</xs:element>

	<xs:complexType name="Sheet">
		<xs:sequence>
			<xs:element name="Cells" type="Cells" />
			<xs:element name="RowInfos" type="RowInfos" minOccurs="0" maxOccurs="1" />
			<xs:element name="ColInfos" type="ColInfos" minOccurs="0" maxOccurs="1" />
		</xs:sequence>
		<xs:attribute name="name" type="xs:string" use="required" />
		<xs:attribute name="direction">
			<xs:simpleType>
				<xs:restriction base="xs:string">
					<xs:enumeration value="row" />
					<xs:enumeration value="col" />
				</xs:restriction>
			</xs:simpleType>
		</xs:attribute>
	</xs:complexType>

	<xs:complexType name="ColInfos">
		<xs:sequence>
			<xs:element name="ColInfo" type="ColInfo" />
		</xs:sequence>
	</xs:complexType>

	<xs:complexType name="ColInfo">
		<xs:attribute name="hidden" type="xs:boolean" />
		<xs:attribute name="widthPixels" type="xs:integer" />
	</xs:complexType>

	<xs:complexType name="RowInfos">
		<xs:sequence>
			<xs:element name="RowInfo" type="RowInfo" />
		</xs:sequence>
	</xs:complexType>

	<xs:complexType name="RowInfo">
		<xs:attribute name="hidden" type="xs:boolean" />
		<xs:attribute name="heightPixels" type="xs:integer" />
	</xs:complexType>

	<xs:complexType name="Cells">
		<xs:sequence>
			<xs:element name="Cell" type="Cell" />
		</xs:sequence>
	</xs:complexType>

	<xs:complexType name="Cell">
		<xs:attribute name="number" type="xs:string" use="optional" />
		<xs:attribute name="text" type="xs:string" use="optional" />
		<xs:attribute name="bool" type="xs:string" use="optional" />
		<xs:attribute name="date" type="xs:string" use="optional" />
		<xs:attribute name="styles" type="xs:string" />
	</xs:complexType>

	<xs:complexType name="Styles">
		<xs:sequence>
			<xs:element name="Style" minOccurs="0" maxOccurs="unbounded" />
		</xs:sequence>
	</xs:complexType>

	<xs:complexType name="Style">
		<xs:attribute name="name" type="xs:string" use="required" />
		<xs:attribute name="vertical">
			<xs:simpleType>
				<xs:restriction base="xs:string">
					<xs:enumeration value="top" />
					<xs:enumeration value="center" />
					<xs:enumeration value="bottom" />
				</xs:restriction>
			</xs:simpleType>
		</xs:attribute>
		<xs:attribute name="horizontal">
			<xs:simpleType>
				<xs:restriction base="xs:string">
					<xs:enumeration value="left" />
					<xs:enumeration value="center" />
					<xs:enumeration value="right" />
				</xs:restriction>
			</xs:simpleType>
		</xs:attribute>
		<xs:attribute name="wrapText" type="xs:boolean" />
		<xs:attribute name="textRotation" type="xs:double" />
		<xs:attribute name="borderStyle" type="BorderStyle" />
		<xs:attribute name="borderColor" type="BorderColor" />
		<xs:attribute name="fillType">
			<xs:simpleType>
				<xs:restriction base="xs:string">
					<xs:enumeration value="solid" />
					<xs:enumeration value="none" />
				</xs:restriction>
			</xs:simpleType>
		</xs:attribute>
		<xs:attribute name="foreground" type="HexColorWithOpacity" />
		<xs:attribute name="background" type="HexColorWithOpacity" />
		<xs:attribute name="bold" type="xs:boolean" />
		<xs:attribute name="color" type="HexColorWithOpacity" />
		<xs:attribute name="italic" type="xs:boolean" />
		<xs:attribute name="font" type="xs:string" />
		<xs:attribute name="strike" type="xs:boolean" />
		<xs:attribute name="size" type="xs:double" />
		<xs:attribute name="underline" type="xs:boolean" />
		<xs:attribute name="script">
			<xs:simpleType>
				<xs:restriction base="xs:string">
					<xs:enumeration value="superscript" />
					<xs:enumeration value="subscript" />
				</xs:restriction>
			</xs:simpleType>
		</xs:attribute>
		<xs:attribute name="numberFormat" type="xs:string" />
	</xs:complexType>

	<xs:simpleType name="HexColorWithOpacity">
		<xs:restriction base="xs:string">
			<xs:pattern value="#[0-9a-fA-F]{8}" />
		</xs:restriction>
	</xs:simpleType>

	<xs:simpleType name="BorderColor">
		<xs:restriction base="xs:string">
			<xs:pattern value="^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})(\\s#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})){0,3}$" />
		</xs:restriction>
	</xs:simpleType>

	<xs:simpleType name="BorderStyle">
		<xs:restriction base="xs:string">
			<xs:pattern value="^(dashDotDot|dashDot|dashed|dotted|hair|mediumDashDotDot|mediumDashDot|mediumDashed|medium|slantDashDot|thick|thin)(\\s(dashDotDot|dashDot|dashed|dotted|hair|mediumDashDotDot|mediumDashDot|mediumDashed|medium|slantDashDot|thick|thin)){0,3}$" />
		</xs:restriction>
	</xs:simpleType>

</xs:schema>`;
