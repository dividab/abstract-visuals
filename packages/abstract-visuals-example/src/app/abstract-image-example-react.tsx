import React from "react";
import {
  createLine,
  createPoint,
  red,
  createAbstractImage,
  createSize,
  white,
  createSVG,
  createDashStyle,
  black,
  createRectangle,
  blue,
  fromArgb,
  createBinaryImage,
  createEllipse,
  transparent,
  createText,
  ReactSvg,
} from "../../../abstract-image/src/index.js";

const pngEncoded =
  "iVBORw0KGgoAAAANSUhEUgAAAMgAAACWCAIAAAAUvlBOAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAwaSURBVHhe7Z0/T9tcG4d5X8WWW0OU0MgFKRKKGnXojL8BUhFTN8asMLwLYmNmq1g6lJWRrVNFpXyDZO5QpYqQIkGj9EmUJ24t28NrJy6N49uxj+1DnPC7FOlxeKgJ9sV93+ePz/nPz3J1DYC0+a/7XwBSBWIBLkAswAWIBbgAsQAXIBbgAsQCXIBYgAsQC3ABYgEuQCzABYgFuACxABcgFuACxAJcgFiACxALcAFiAS5ALMAFiAW4ALEAFyAW4ALEAlyAWIALEAtwAU9Ch2GZdV37bI6+mmsNQ3e/OEYVpbU18c1z8UCS93KC+1UwJjWx6v3Ooea57gSipNp3QhAPNiLdifaoezwYNtx3fxClWv7lhRThRurd/d7UPxfz55vKUc59F4ZZH/Xf+396MKqYP90swrAJKYmld1/0hu5xVCRVLn4syhX3rQ9rsH/fC7qvamHnZj3kFtb7rUPNPZ5QK1Uv7CgTRlvvHk8byYIqlz4WC4G/1JNhgTWW3tDudjudS8t9P4tlzLm1jcGPwH+YCPOy29qNa5VNQ+sdj0z3zRNm4cW7fnbfOQlLoRT62b/ecJQcSzvp3J4Z7rvYNMzEp1h+stAq1K963bp7zILWTzVoaSf3d1fusQ+7PittN7eqduXw8Gpu7VyXSjWnhAezcBTLLoOmb8NP+zYU8qr7P2cYHvZjhJ8Ug5adAQOsEvPXtk+KciTJFW/hX8kJe1LhQin/LO80S3lVdL8ObB4xYtm3YV25KW/X3PdeNC08aDmNSi/aXaw0Okt79IPOgPJ2U1H2whuSQkVSbpSqo5f9FyVAsQWkQvliq0TFLaMVmteE9Xe+W3Y1HLTdw9hoHwaUnmKpOafRSuHoVa6GNlefAouosXKy3w87r30LL5iEo3zePXzA6H1IFrTaoz6VBPPXCnoN4rOQ4l2oUn/SX60IrXSpeJ5y0DK//CLEVAvFPfcQxGEhYiWBDlrxu44s7RNRXeVPkc6SsRCxzBalwZvQwRDTdCKTJPvL/8agH6fDwulkHxF9obKMcJWQhYhlfCOChPQ66iie/L+Cv+to+D5W0PpuEnmw9kx2j0BcFiBWQLEsVqOKtVZZf+mvtGIN8pCxM7riIJBHF8saHJNte7bsQ1VacfpLydgZoLjefdFphb+6sUYRVo7HE6ttmfV+5wU9YUE632DMPlTzMO1BHg9tK9oIoBEzKa8YHMVqDG6n/5R372+DJmyphZeRp0k9kEbQssyv7tEUovjKPfJAVmMkGIS2WUjx7kGVt2N2VdNBK/Egj2F8d488vBIw2MzAgsVy5usVYzfByKDF0l+aE964R+FUcsRwAQhiYWKpcul6K/GwGhm0kg7yBIxaSopnssbkRY97gkcVS1JFqSaXzks7zXL1pliIMGsglIRBS3xNhKEoo5YgBI5izc7HKpdvlPJFsXAkCWkO7krKtT+XRg1aCUYtwVwWX7wnZ2+DyEd20FqLUG7vPSMCXuOXlngqzlNnFcRayxVOiaA1+hwl7uREokhKPBUHrIRYdNDSr0Kfc7ShJ4elMn/wSbMiYtFBKxJ0+Z9oKg5YHbECKq1IkH0W45GDfbgVl9URK1HQ2qSldNzqD+rofWBnhcRKErRyhZsSlRBtt7Te4X1rv9u91M32lGFtS7vsd+YsAvDEWSmxEgQtpz+sScwfdGkYw7Pe7e799Jj63Zmmw6ogVkssO2gVA55bjEBlvTx5MDAheK7QZtXEcp5bDEhqUXAeDNzariUSQ3oXZYmlVSclsXLyzBIGqphPen0l+5zu4Rip9jza46N2UrMDz6wcUq2wE2UNI/t3uVCqTUcvtnky9q88HgYts88tW0Gwol8IbV378lv75Mzd0xueCXyS464gvhPkqiRivbUZIBbgwurVWCATQCzABYgFuACxABcgFuACxAJcgFiACxALcAFiAS5ALMAFiAW4ALEAFyAW4ALEAlyAWIALEAtwAWIBLkAswAWIBbgAsQAXIBbgAsQCXIBYgAsQC3ABYgEuQCzABYgFuACxABewKMiCsMy6rn02R1/NtYbhWTZcdZZPEt88Fw8keXkXsUlJLEs7+ad/NXWBnPWxNhVypaj2qHs8GBKLLIqSKhQ/FqMtguWlrQ+Ohz3vMkMuzgZjTFtBWYOTf3pX/lOJ+fOA34gFsz7qvyd//QDsK3m6WZxjWL3fCdoIci7S+RbHpbxSEkvvvugN3eM/0HfUGoQsCCuWmkqBzS3qp09TK1UjLbk2pt5vHQZtphnjs03R1rvHPQalplHl0sci9aNDr2cwTJeFlUevsSwj5Cowr9xvXg7nWWXDsumS9nnOFq3G6EvMpbnNy25rN65VNg0t4LKEXs8FkcXinW2PJL1/luJOubpG7bD/gP5JZ99SwK4TOrfJP+Ry7QicyVYhS2Co/w4JV0yEno19YzDt5P4uUFZn2dLt5tb05nvV5tbOdanEugIqO9JrnmulZkGsfG12cfbogcGXuewWgHsUg7l5cAJbNrQzYIBVYv7a9klRjiS54r3BlZywJxUulPLP8g61Sm84vp0iyRffRXgzEbEOfJsGNgb9uns4j/aoP3Pb1Ofr0bd5noE4m+xf9p0hG7ZHP+gMKG83FSXCBrOCszy4Up2sPr9cy8dnIxVKsm/V/+Hn8Ba0+eXXzDflT+NvMu0/m/Ruo+jfdC6i9Hb8+zCgfge7acnYpeLoVU68f/bjkpEaSz7wbVVy9TssLVnap5l4IMt77hE7/rOJ629zwtvn/lonivRE/BuTv07QYbFEZKV4J7bQ1bT5gaGtj2Za2rVnsXfSIc6mjvcrqEjr/qItXHoi/jmohWJ89ZeKrIjFng39iSZ/EL8hReXByc4a5BasYdIT8c8hSaZeMjIjFms29Hc4pZ8HJ0dxsqE//jkk+YTLRnbEIrNh/zKgbe/vcOKRByfEyIbfTcK7JJ9w6ciQWFQ2DGrb+zuckuRBf1b17uDFnA3NFvGp+XZITtMY3D7sq0i+TuaG21TIklhUNiR7uokOpyRFsT+r/s2DE+hs+D5wTNP4RhRYYpUUS+/O3HX61e1G6+OIBMvgaUwyJRa19y7R0x1caMfCn1Wn8+AEMhuyD+8QtC3CQQJjjsdZJFtiUUnHlw3nFdox8GdVSlMyGwYN71jmV/doClF85R55IKsxEgxCJ4FIOjM93fMLbWbC8+AEMhuyTHYwjO/ukYdXQvzaMDZv+E9MzZpYZNKZbtuHFdqMRMmDExiyYU6IPl5ZyfkjYVJCB6H5ze97IHNikUnnb9s+aoCJSLQ8OIEpGxIYLfI7JWXmrjuvLV+tuWxkTywy6fxp20cPMFEghvPmaRo9G4qviTCkf4uq4CqQQbGCs6E1eB89wIRDDecZvd2Zdv7Ua5earUBNdhCq1Id6hEZ+dsiiWHQ2HA7q/nESuRh/tho9nBcDYniHGEVIqXtiWcikWGTSMXqHvoCR7jBObIjhnZxIFElG7wMR8laTbIpFN8F8pDudIQH+4R2y0h/H3ScStDIqVtCN8ZDudIZE+LOhcJQnsiH7w23LSlbFoptgHtLOg/nrmTZ/wKtZID4YkQ2l4jn1t9EY3O4/AbcyK1ZoNkw7D0aOf/QHIyY7CEebdHeU41Z/UF/p3ofsihWSDZPkQeoZV4ZnYOgPRg0S5wo3JSoh2m5pvcP71n63e6mb7SnD2pZ22e/Efmp+Qui0mfGrEzTXLRUyLFZQmeIgnW/Ez4PUU6lM/WF0mqZ7EySFTJ0TGsbwrHe7e//3fu/e351pelrN1bmwDHSyk2Wx7Lvin/o3JuVhHOYT0tkwYHinsl6ePBiYEDxXmCLE1D+blKczxDghnQ0DY4DzYODWdi2RGAExlewwywApiZWTZ9YacNbHCrgQ3u+UVJmeqDRhb8N3P8T5z7rYLnqfsp/5JL47oYol9odnhLd5fxCS5k1HyckXSrXp6MXW6LCv5Hlppxn0RHyucCqznfAPiWaFhIIV/RZDW9e+/NY+OXP3dO96cZKzWIMgvhPkqiQ++RX9APCS8RoLLCsQC3ABYgEuQCzABYgFuACxABcgFuACxAJcgFiACxALcAFiAS5ALMAFiAW4ALEAFyAW4ALEAlyAWIALEAtwAWIBLkAswAWIBbgAsQAXIBbgAsQCHFhb+z9FDDmDWJC9LAAAAABJRU5ErkJggg==";

export function AbstractImageExampleReact(): React.JSX.Element {
  const [hovered, setHovered] = React.useState("");
  const subData = new TextEncoder().encode(svg);
  const raw = window.atob(pngEncoded);
  const rawLength = raw.length;
  const pngData = new Uint8Array(new ArrayBuffer(rawLength));

  for (let i = 0; i < rawLength; i++) {
    pngData[i] = raw.charCodeAt(i);
  }

  const components = [
    createLine(createPoint(25, 125), createPoint(280, 125), red, 2, undefined, createDashStyle([10, 5])),
    createLine(createPoint(25, 100), createPoint(280, 100), red, 2, undefined, createDashStyle([10, 5], 5)),
    createLine(createPoint(25, 25), createPoint(80, 60), black, 2),
    createRectangle(createPoint(10, 50), createPoint(40, 80), blue, 2, fromArgb(100, 0, 0, 0), "rect"),
    createBinaryImage(
      createPoint(150, 100),
      createPoint(170, 130),
      "svg",
      { type: "bytes", bytes: subData },
      "subImage"
    ),
    createBinaryImage(
      createPoint(50, 100),
      createPoint(70, 130),
      "svg",
      { type: "url", url: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` },
      "subImage"
    ),
    createBinaryImage(createPoint(0, 0), createPoint(100, 100), "png", {
      type: "bytes",
      bytes: pngData,
    }),
    createEllipse(createPoint(20, 20), createPoint(60, 60), red, 1, transparent),
    createText(
      createPoint(120, 50),
      "Hej<sub>12</sub>",
      "Helvetica",
      12,
      black,
      "normal",
      0,
      "center",
      "uniform",
      "uniform",
      0,
      black,
      false,
      "my-text"
    ),
  ];
  const image = createAbstractImage(createPoint(0, 0), createSize(400, 400), white, components);

  return (
    <div>
      <h1>React</h1>
      <div>
        <ReactSvg
          image={image}
          callbacks={{
            onClick: (id, position) => window.alert(JSON.stringify({ id, position })),
            onMouseMove: (id) => setHovered(id ?? ""),
          }}
        />
      </div>
      <div>{hovered}</div>
    </div>
  );
}

const svg = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM9.25 3.75C9.25 4.44036 8.69036 5 8 5C7.30964 5 6.75 4.44036 6.75 3.75C6.75 3.05964 7.30964 2.5 8 2.5C8.69036 2.5 9.25 3.05964 9.25 3.75ZM12 8H9.41901L11.2047 13H9.081L8 9.97321L6.91901 13H4.79528L6.581 8H4V6H12V8Z" fill="#000000"/>
</svg>`;
