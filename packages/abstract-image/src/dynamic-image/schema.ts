import { Schema } from "jsxpression";

export const baseSchema = {
  elements: {
    AbstractImage: {
      description: "Root container — defines the image canvas and its coordinate system.",
      props: {
        width: {
          type: "number",
          required: true,
          description: "Total width of the image canvas (in px).",
        },
        height: {
          type: "number",
          required: true,
          description: "Total height of the image canvas (in px).",
        },
      },
      allowedChildren: ["Image", "Text", "Rectangle", "Ellipse", "Line", "Polyline", "Polygon", "Group"],
    },

    Group: {
      description: "Groups elements together.",
      props: {},
      allowedChildren: ["Image", "Text", "Rectangle", "Ellipse", "Line", "Polyline", "Polygon", "Group"],
    },

    Image: {
      description: "Displays a raster image.",
      props: {
        src: {
          type: "string",
          required: true,
          description: "Source of the image (URL or asset ID).",
        },
        x: {
          type: "number",
          description: "X position in pixels.",
        },
        y: {
          type: "number",
          description: "Y position in pixels.",
        },
        width: {
          type: "number",
          description: "Display width in pixels.",
        },
        height: {
          type: "number",
          description: "Display height in pixels.",
        },
      },
      allowedChildren: [],
    },

    Ellipse: {
      description: "Draws an ellipse using x, y, width, and height.",
      props: {
        x: {
          type: "number",
          description: "X coordinate of the top-left of the ellipse box.",
        },
        y: {
          type: "number",
          description: "Y coordinate of the top-left of the ellipse box.",
        },
        width: {
          type: "number",
          description: "Box width.",
        },
        height: {
          type: "number",
          description: "Box height.",
        },
        stroke: {
          type: "string",
          format: "color",
          description: "Stroke color (CSS color string).",
        },
        strokeWidth: {
          type: "number",
          description: "Stroke width in pixels.",
        },
        fill: {
          type: "string",
          format: "color",
          description: "Fill color (inside the ellipse).",
        },
      },
      allowedChildren: [],
    },

    Line: {
      description: "Draws a straight line between two points.",
      props: {
        x1: {
          type: "number",
          description: "X coordinate of the start point.",
        },
        y1: {
          type: "number",
          description: "Y coordinate of the start point.",
        },
        x2: {
          type: "number",
          description: "X coordinate of the end point.",
        },
        y2: {
          type: "number",
          description: "Y coordinate of the end point.",
        },
        stroke: {
          type: "string",
          format: "color",
          description: "Stroke color of the line.",
        },
        strokeWidth: {
          type: "number",
          description: "Width of the stroke in px.",
        },
      },
      allowedChildren: [],
    },

    Polyline: {
      description: "A connected set of line segments (open shape).",
      props: {
        points: {
          type: "string",
          required: true,
          description: "List of points: 'x0,y0 x1,y1 x2,y2'.",
        },
        stroke: {
          type: "string",
          format: "color",
          description: "Stroke color.",
        },
        strokeWidth: {
          type: "number",
          description: "Stroke width in px.",
        },
      },
      allowedChildren: [],
    },

    Polygon: {
      description: "A closed polygon shape.",
      props: {
        points: {
          type: "string",
          required: true,
          description: "List of vertex points: 'x0,y0 x1,y1 ...'.",
        },
        stroke: {
          type: "string",
          format: "color",
          description: "Stroke color.",
        },
        strokeWidth: {
          type: "number",
          description: "Stroke width in px.",
        },
        fill: {
          type: "string",
          format: "color",
          description: "Fill color of the polygon.",
        },
      },
      allowedChildren: [],
    },

    Rectangle: {
      description: "Draws a rectangle, optionally with rounded corners.",
      props: {
        x: {
          type: "number",
          description: "X position of the rectangle (top-left).",
        },
        y: {
          type: "number",
          description: "Y position of the rectangle (top-left).",
        },
        width: {
          type: "number",
          description: "Rectangle width in px.",
        },
        height: {
          type: "number",
          description: "Rectangle height in px.",
        },
        stroke: {
          type: "string",
          format: "color",
          description: "Stroke color.",
        },
        strokeWidth: {
          type: "number",
          description: "Stroke width in px.",
        },
        fill: {
          type: "string",
          format: "color",
          description: "Fill color of the rectangle.",
        },
        radius: {
          type: "number",
          description: "Corner radius in px (uniform).",
        },
      },
      allowedChildren: [],
    },

    Text: {
      description: "Renders a text element.",
      props: {
        x: {
          type: "number",
          description: "X position of the text anchor.",
        },
        y: {
          type: "number",
          description: "Y position of the text baseline.",
        },
        fontFamily: {
          type: "string",
          description: "Font family, e.g. 'Inter, system-ui'.",
        },
        fontSize: {
          type: "number",
          description: "Font size in pixels.",
        },
        fontWeight: {
          type: "string",
          description: "Font weight, e.g. 'bold', '700'.",
        },
        fill: {
          type: "string",
          format: "color",
          description: "Fill color (text color).",
        },
      },
      allowedChildren: [],
    },
  },
} as const satisfies Schema;
