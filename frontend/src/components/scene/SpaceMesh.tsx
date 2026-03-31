'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import type { Mesh, MeshStandardMaterial } from 'three';

interface SpaceMeshProps {
  label: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  isSelected: boolean;
  pulse?: boolean;
  onClick: () => void;
}

export function SpaceMesh({
  label,
  position,
  size,
  color,
  isSelected,
  pulse = false,
  onClick,
}: SpaceMeshProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    const mat = meshRef.current?.material as MeshStandardMaterial | undefined;
    if (!mat) return;
    if (pulse) {
      mat.emissiveIntensity = 0.25 + Math.sin(Date.now() * 0.003) * 0.15;
    } else if (isSelected) {
      mat.emissiveIntensity = 0.35;
    } else if (hovered) {
      mat.emissiveIntensity = 0.2;
    } else {
      mat.emissiveIntensity = 0;
    }
  });

  const labelPos: [number, number, number] = [
    position[0],
    position[1] + size[1] / 2 + 0.35,
    position[2],
  ];

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={isSelected ? '#3b82f6' : color}
          emissive={isSelected ? '#3b82f6' : color}
          emissiveIntensity={0}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      <Billboard position={labelPos}>
        <Text
          fontSize={0.28}
          color="#1f2937"
          anchorX="center"
          anchorY="bottom"
        >
          {label}
        </Text>
      </Billboard>
    </group>
  );
}
