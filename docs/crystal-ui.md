# Crystal UI System Documentation

## Overview
The **Crystal UI** is the bespoke design system of Stellar Nexus, characterized by a **"Dark Glassmorphism"** aesthetic and integrated **React Three Fiber (R3F)** 3D elements. It is designed to feel futuristic, immersive, and premium.

## 🎨 Design Principles
1.  **Pitch Black Base**: All backgrounds default to `#000000` or `#050505`. We avoid pure grays to maintain deep contrast.
2.  **Glassmorphism**: Cards and overlays use low-opacity backgrounds (e.g., `bg-white/5`) combined with `backdrop-blur-xl`.
3.  **Accent Glows**: We use radial gradients to denote functionality:
    *   🔵 **Blue**: Core Infrastructure / Text Processing
    *   🟣 **Purple**: Hashing / Cryptography
    *   🟢 **Green**: Output / Success
    *   🟡 **Yellow**: AI / Experimental

## 🧊 3D Components

### The Crystal Primitive (`src/components/Crystal.tsx`)
A reusable Icosahedron mesh with complex material properties.

#### Props
| Prop | Type | Description |
| :--- | :--- | :--- |
| `position` | `[x, y, z]` | Location in 3D space. |
| `rotation` | `[x, y, z]` | Initial rotation. |
| `scale` | `number` | Size multiplier. |
| `color` | `string` | Material transmission color. |

#### Material Configuration
We use `MeshTransmissionMaterial` from `@react-three/drei` to simulate refractive glass.
```jsx
<MeshTransmissionMaterial
    thickness={2}          // Depth of refraction
    chromaticAberration={0.5} // Rainbow edges (dispersion)
    anisotropy={0.5}       // Directional blurring
    distortion={0.5}       // Liquid-like warping
    iridescence={1}        // Surface oil-slick effect
    roughness={0.1}        // Surface smoothness
/>
```

## 📦 Dependencies

The UI system relies on the following key libraries:

```json
{
  "three": "^0.160.0",
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.96.0",
  "lucide-react": "^0.300.0", (Icons)
  "tailwindcss": "^3.3.0" (Styling)
}
```

## 🖌 Customization Guide

### Changing the Theme Color
To shift from the default "Blue/cyan" theme:
1.  Update the `Crystal` color prop in your Scene component.
2.  Update the Tailwind classes (e.g., `text-blue-500` -> `text-rose-500`).
3.  Adjust the `spotLight` color in the R3F Canvas.
