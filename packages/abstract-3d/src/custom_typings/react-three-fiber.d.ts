import type { ThreeElements } from "@react-three/fiber";

declare global {
  namespace React {
    namespace JSX {
      type IntrinsicElements = ThreeElements;
    }
  }
}
