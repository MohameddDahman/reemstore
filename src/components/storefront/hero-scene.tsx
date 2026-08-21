"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

const TEAL = "#1d4a47";
const TEAL_LIGHT = "#2f6f66";
const MUSTARD = "#e0a63c";
const LEAF = "#3f8272";

/**
 * Paints the tube's wrapper as a 2D canvas and returns it as a texture.
 *
 * Drawing the artwork ourselves keeps the hero fully self-contained: no
 * font file, no image, nothing to download or fail at runtime. The canvas
 * is laid out in texture space, where x wraps around the tube's
 * circumference and y runs bottom-to-top.
 */
function createLabelTexture() {
  const W = 1024;
  const H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = TEAL;
  ctx.fillRect(0, 0, W, H);

  // Mustard band across the lower third (the tube's cap end).
  ctx.fillStyle = MUSTARD;
  ctx.beginPath();
  ctx.moveTo(0, H * 0.78);
  for (let x = 0; x <= W; x += 16) {
    ctx.lineTo(x, H * 0.78 + Math.sin((x / W) * Math.PI * 4) * 26);
  }
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  // Mustard blob in the upper area, echoing the reference's leaf shape.
  ctx.fillStyle = MUSTARD;
  ctx.beginPath();
  ctx.ellipse(W * 0.2, H * 0.16, 150, 120, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Palm fronds — a stroked fan of tapering lines, repeated around.
  const frond = (cx: number, cy: number, scale: number, rot: number, color: string) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.scale(scale, scale);
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -190);
    ctx.stroke();
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const y = -30 - t * 150;
      const len = 80 * (1 - t * 0.65);
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.quadraticCurveTo(len * 0.6, y - 18, len, y - 46);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.quadraticCurveTo(-len * 0.6, y - 18, -len, y - 46);
      ctx.stroke();
    }
    ctx.restore();
  };

  frond(W * 0.72, H * 0.34, 1.0, 0.35, LEAF);
  frond(W * 0.9, H * 0.2, 0.75, -0.25, TEAL_LIGHT);
  frond(W * 0.08, H * 0.42, 0.8, -0.4, TEAL_LIGHT);
  frond(W * 0.55, H * 0.95, 0.85, 0.15, LEAF);
  frond(W * 0.3, H * 0.98, 0.7, -0.2, LEAF);

  // Emblem: concentric rings with an eye-like lens, as on the reference.
  const ex = W * 0.42;
  const ey = H * 0.30;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(ex, ey, 74, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(ex, ey, 52, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(ex, ey, 34, 20, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(ex, ey, 9, 0, Math.PI * 2);
  ctx.fill();

  // "SPF 50" — the tube's whole reason for existing.
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "600 132px 'Helvetica Neue', Helvetica, Arial, sans-serif";
  ctx.fillText("SPF", ex, H * 0.47);
  ctx.font = "600 156px 'Helvetica Neue', Helvetica, Arial, sans-serif";
  ctx.fillText("50", ex, H * 0.60);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  // Cylinder UVs put v=1 at the top and three.js flips the image by
  // default, so canvas-top already lands on tube-top. Rotating here would
  // both invert the artwork and mirror the "SPF 50" text.
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

/**
 * The signature element: a Reem SPF 50 sunscreen tube, built procedurally
 * from Three.js primitives — a squeeze-tube body with a crimped seam at
 * the top, standing on a white flip-cap.
 *
 * Deliberately cheap to render: plain MeshStandardMaterial lit by a
 * three-point rig, with no HDR environment map, no contact shadows and no
 * clearcoat. Those look nicer but stack up render targets and cost enough
 * GPU memory to lose the WebGL context on modest hardware — and a crashed
 * canvas in the hero is far worse than a slightly flatter highlight.
 *
 * Scroll is read through a ref updated imperatively by the caller, so
 * scrolling never re-renders the React tree underneath the canvas.
 */
function SunscreenTube({ scrollProgress }: { scrollProgress: React.RefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const label = useMemo(() => createLabelTexture(), []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    group.rotation.y += delta * 0.3;
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, scrollProgress.current * 0.6, 0.06);
    const { x, y } = state.pointer;
    group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, -x * 0.12, 0.04);
    group.position.y = THREE.MathUtils.lerp(group.position.y, y * 0.12, 0.04);
  });

  return (
    <Float speed={1.4} rotationIntensity={0.1} floatIntensity={0.45}>
      <group ref={groupRef} scale={0.95} position={[0, -0.05, 0]}>
        {/* Tube body — printed wrapper */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.62, 0.56, 2.35, 64, 1, false]} />
          <meshStandardMaterial map={label ?? undefined} roughness={0.42} metalness={0.02} />
        </mesh>

        {/* Crimped seal at the top of the tube */}
        <mesh position={[0, 1.44, 0]} scale={[1, 1, 0.12]}>
          <cylinderGeometry args={[0.63, 0.63, 0.16, 32]} />
          <meshStandardMaterial color={TEAL} roughness={0.5} metalness={0.02} />
        </mesh>

        {/* Flip cap the tube stands on */}
        <mesh position={[0, -1.18, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.42, 48]} />
          <meshStandardMaterial color="#fdfdfc" roughness={0.32} metalness={0.02} />
        </mesh>
        {/* Cap shoulder, tucking the body into the cap */}
        <mesh position={[0, -0.95, 0]}>
          <cylinderGeometry args={[0.57, 0.6, 0.08, 48]} />
          <meshStandardMaterial color="#f0efec" roughness={0.4} metalness={0.02} />
        </mesh>
      </group>
    </Float>
  );
}

export function HeroScene({
  scrollProgress,
  onContextLost,
}: {
  scrollProgress: React.RefObject<number>;
  onContextLost?: () => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 38 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          // Stop the browser painting its "broken canvas" state, and let
          // the caller swap in the static fallback instead.
          event.preventDefault();
          onContextLost?.();
        });
      }}
    >
      {/* Three-point rig standing in for an HDR environment. */}
      <ambientLight intensity={1.15} />
      <directionalLight position={[3, 4, 5]} intensity={2.0} />
      <directionalLight position={[-4, 1.5, 2]} intensity={0.85} />
      <directionalLight position={[0, 2, -5]} intensity={0.6} />
      <SunscreenTube scrollProgress={scrollProgress} />
    </Canvas>
  );
}
