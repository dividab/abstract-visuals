export const xsd = `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">

	<xs:element name="AbstractSheet">
		<xs:complexType>
			<xs:sequence>
				<xs:element name="Styles" type="Styles" minOccurs="0" />
				<xs:element name="Sheets" type="Sheets" minOccurs="0" />
			</xs:sequence>
		</xs:complexType>
	</xs:element>


	<xs:complexType name="Sheets">
		<xs:sequence>
			<xs:element name="Sheet" type="Sheet" minOccurs="0" />
		</xs:sequence>
	</xs:complexType>

	<xs:complexType name="Sheet">
		<xs:sequence>
			<xs:element name="Rows" type="Rows" minOccurs="0" maxOccurs="1" />
			<xs:element name="RowInfos" type="RowInfos" minOccurs="0" maxOccurs="1" />
			<xs:element name="ColInfos" type="ColInfos" minOccurs="0" maxOccurs="1" />
		</xs:sequence>
		<xs:attribute name="name" type="xs:string" use="required" />
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


	<xs:complexType name="Rows">
		<xs:sequence>
			<xs:element name="Row" type="Row" />
		</xs:sequence>
	</xs:complexType>

	<xs:complexType name="Row">
		<xs:sequence>
			<xs:element name="Cell" type="Cell" />
		</xs:sequence>
	</xs:complexType>

	<xs:complexType name="Cell">
		<xs:attribute name="value" type="NumberOrString" use="required" />
		<xs:attribute name="styles" type="xs:string" />
		<xs:attribute name="type">
			<xs:simpleType>
				<xs:restriction base="xs:string">
					<xs:enumeration value="string" />
					<xs:enumeration value="number" />
				</xs:restriction>
			</xs:simpleType>
		</xs:attribute>
	</xs:complexType>

	<xs:simpleType name="NumberOrString">
		<xs:union>
			<xs:simpleType>
				<xs:restriction base="xs:double" />
			</xs:simpleType>
			<xs:simpleType>
				<xs:restriction base="xs:string" />
			</xs:simpleType>
		</xs:union>
	</xs:simpleType>

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
		<xs:attribute name="textRotation" type="xs:boolean" />
		<xs:attribute name="borderStyle" type="xs:string" />
		<xs:attribute name="borderColor" type="xs:string" />
		<xs:attribute name="fillType">
			<xs:simpleType>
				<xs:restriction base="xs:string">
					<xs:enumeration value="solid" />
					<xs:enumeration value="none" />
				</xs:restriction>
			</xs:simpleType>
		</xs:attribute>
		<xs:attribute name="foreground" type="xs:string" />
		<xs:attribute name="background" type="xs:string" />
		<xs:attribute name="bold" type="xs:boolean" />
		<xs:attribute name="color" type="xs:string" />
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

</xs:schema>`;
