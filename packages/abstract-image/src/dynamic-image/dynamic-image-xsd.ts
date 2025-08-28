export const xsd = `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
           targetNamespace="urn:adml"
           xmlns="urn:adml"
           elementFormDefault="qualified"
           attributeFormDefault="unqualified">

  <!-- ========= Root ========= -->
  <xs:element name="abstractImage" type="AbstractImage"/>

  <xs:group name="Component">
    <xs:choice>
      <xs:element name="image" type="Image"/>
      <xs:element name="ellipse" type="Ellipse"/>
      <xs:element name="line" type="Line"/>
      <xs:element name="polyline" type="PolyLine"/>
      <xs:element name="polygon" type="Polygon"/>
      <xs:element name="rectangle" type="Rectangle"/>
      <xs:element name="text" type="Text"/>
      <xs:element name="group" type="Group"/>
    </xs:choice>
  </xs:group>

  <xs:complexType name="AbstractImage">
    <xs:sequence>
      <xs:element name="components">
        <xs:complexType>
          <xs:sequence>
            <xs:group ref="Component" minOccurs="0" maxOccurs="unbounded"/>
          </xs:sequence>
        </xs:complexType>
      </xs:element>
    </xs:sequence>
    <xs:attribute name="topLeft" type="PointString" use="required"/>
    <xs:attribute name="size" type="SizeString" use="required"/>
    <xs:attribute name="backgroundColor" type="ColorString" use="optional"/>
  </xs:complexType>

  <xs:simpleType name="PointString"><xs:restriction base="xs:string"/></xs:simpleType>
  <xs:simpleType name="SizeString"><xs:restriction base="xs:string"/></xs:simpleType>
  <xs:simpleType name="ColorString"><xs:restriction base="xs:string"/></xs:simpleType>
  <xs:simpleType name="PointsString"><xs:restriction base="xs:string"/></xs:simpleType>
  <xs:simpleType name="DashArray"><xs:restriction base="xs:string"/></xs:simpleType>
  <xs:simpleType name="DashOffset"><xs:restriction base="xs:string"/></xs:simpleType>

  <!-- ========= Components ========= -->

  <!-- Group -->
  <xs:complexType name="Group">
    <xs:sequence>
      <xs:element name="children">
        <xs:complexType>
          <xs:sequence>
            <xs:group ref="Component" minOccurs="0" maxOccurs="unbounded"/>
          </xs:sequence>
        </xs:complexType>
      </xs:element>
    </xs:sequence>
    <xs:attribute name="name" type="xs:string" use="optional"/>
  </xs:complexType>

  <!-- Image -->
  <xs:complexType name="Image">
    <xs:attribute name="url" type="xs:anyURI" use="required"/>
    <xs:attribute name="topLeft" type="PointString" use="required"/>
    <xs:attribute name="bottomRight" type="PointString" use="required"/>
    <xs:attribute name="id" type="xs:string" use="optional"/>
  </xs:complexType>

  <!-- Ellipse -->
  <xs:complexType name="Ellipse">
    <xs:attribute name="topLeft" type="PointString" use="required"/>
    <xs:attribute name="bottomRight" type="PointString" use="required"/>
    <xs:attribute name="strokeColor" type="ColorString" use="optional"/>
    <xs:attribute name="strokeThickness" type="xs:double" use="optional"/>
    <xs:attribute name="strokeDashArray" type="DashArray" use="optional"/>    
    <xs:attribute name="strokeDashOffset" type="DashOffset" use="optional"/>
    <xs:attribute name="fillColor" type="ColorString" use="optional"/>
    <xs:attribute name="id" type="xs:string" use="optional"/>
  </xs:complexType>

  <!-- Line -->
  <xs:complexType name="Line">
    <xs:attribute name="start" type="PointString" use="required"/>
    <xs:attribute name="end" type="PointString" use="required"/>
    <xs:attribute name="strokeColor" type="ColorString" use="optional"/>
    <xs:attribute name="strokeThickness" type="xs:double" use="optional"/>
    <xs:attribute name="strokeDashArray" type="DashArray" use="optional"/>    
    <xs:attribute name="strokeDashOffset" type="DashOffset" use="optional"/>
    <xs:attribute name="id" type="xs:string" use="optional"/>
  </xs:complexType>

 <!-- PolyLine -->
  <xs:complexType name="PolyLine">
    <xs:attribute name="points" type="PointsString" use="required"/>
    <xs:attribute name="strokeColor" type="ColorString" use="optional"/>
    <xs:attribute name="strokeThickness" type="xs:double" use="optional"/>
    <xs:attribute name="strokeDashArray" type="DashArray" use="optional"/>    
    <xs:attribute name="strokeDashOffset" type="DashOffset" use="optional"/>
    <xs:attribute name="id" type="xs:string" use="optional"/>
  </xs:complexType>

  <!-- Polygon -->
  <xs:complexType name="Polygon">
    <xs:attribute name="points" type="PointsString" use="required"/>
    <xs:attribute name="strokeColor" type="ColorString" use="optional"/>
    <xs:attribute name="strokeThickness" type="xs:double" use="optional"/>
    <xs:attribute name="strokeDashArray" type="DashArray" use="optional"/>    
    <xs:attribute name="strokeDashOffset" type="DashOffset" use="optional"/>
    <xs:attribute name="fillColor" type="ColorString" use="optional"/>
    <xs:attribute name="id" type="xs:string" use="optional"/>
  </xs:complexType>

  <!-- Rectangle -->
  <xs:complexType name="Rectangle">
    <xs:attribute name="topLeft" type="PointString" use="required"/>
    <xs:attribute name="bottomRight" type="PointString" use="required"/>
    <xs:attribute name="strokeColor" type="ColorString" use="optional"/>
    <xs:attribute name="strokeThickness" type="xs:double" use="optional"/>
    <xs:attribute name="strokeDashArray" type="DashArray" use="optional"/>    
    <xs:attribute name="strokeDashOffset" type="DashOffset" use="optional"/>
    <xs:attribute name="fillColor" type="ColorString" use="optional"/>
    <xs:attribute name="id" type="xs:string" use="optional"/>
    <xs:attribute name="radius" type="PointString" use="optional"/>
  </xs:complexType>

  <!-- Text -->
  <xs:complexType name="Text">
    <xs:attribute name="position" type="PointString" use="required"/>
    <xs:attribute name="text" type="xs:string" use="required"/>
    <xs:attribute name="fontFamily" type="xs:string" use="optional"/>
    <xs:attribute name="fontSize" type="xs:double" use="optional"/>
    <xs:attribute name="textColor" type="ColorString" use="optional"/>
	<xs:attribute name="fontWeight" use="optional">
		<xs:simpleType>
		<xs:restriction base="xs:string">
			<xs:enumeration value="light"/>
			<xs:enumeration value="normal"/>
			<xs:enumeration value="mediumBold"/>
			<xs:enumeration value="bold"/>
			<xs:enumeration value="extraBold"/>
		</xs:restriction>
		</xs:simpleType>
	</xs:attribute>
	<xs:attribute name="clockwiseRotationDegrees" type="xs:double" use="optional"/>
	<xs:attribute name="textAlignment" use="optional">
		<xs:simpleType>
		<xs:restriction base="xs:string">
			<xs:enumeration value="left"/>
			<xs:enumeration value="center"/>
			<xs:enumeration value="right"/>
		</xs:restriction>
		</xs:simpleType>
	</xs:attribute>
	<xs:attribute name="horizontalGrowthDirection" use="optional">
		<xs:simpleType>
		<xs:restriction base="xs:string">
			<xs:enumeration value="up"/>
			<xs:enumeration value="down"/>
			<xs:enumeration value="uniform"/>
			<xs:enumeration value="left"/>
			<xs:enumeration value="right"/>
		</xs:restriction>
		</xs:simpleType>
	</xs:attribute>
	<xs:attribute name="verticalGrowthDirection" use="optional">
		<xs:simpleType>
		<xs:restriction base="xs:string">
			<xs:enumeration value="up"/>
			<xs:enumeration value="down"/>
			<xs:enumeration value="uniform"/>
			<xs:enumeration value="left"/>
			<xs:enumeration value="right"/>
		</xs:restriction>
		</xs:simpleType>
	</xs:attribute>
    <xs:attribute name="strokeThickness" type="xs:double" use="optional"/>
    <xs:attribute name="strokeColor" type="ColorString" use="optional"/>
    <xs:attribute name="italic" type="xs:boolean" use="optional"/>
    <xs:attribute name="id" type="xs:string" use="optional"/>
  </xs:complexType>

</xs:schema>
`;
