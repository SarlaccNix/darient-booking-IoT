import type { Space } from '@/types';
import { SpaceMesh } from './SpaceMesh';
import { sceneConfig } from './sceneConfig';

interface SiteSceneProps {
  spaces: Space[];
  selectedSpaceId?: string;
  onSpaceSelect: (spaceId: string) => void;
  getColor: (spaceId: string) => string;
  getPulse: (spaceId: string) => boolean;
}

export function SiteScene({
  spaces,
  selectedSpaceId,
  onSpaceSelect,
  getColor,
  getPulse,
}: SiteSceneProps) {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[13, 0.1, 11]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.8} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 0.5, -5.55]}>
        <boxGeometry args={[13, 1, 0.1]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
      <mesh position={[0, 0.5, 5.55]}>
        <boxGeometry args={[13, 1, 0.1]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
      <mesh position={[-6.55, 0.5, 0]}>
        <boxGeometry args={[0.1, 1, 11]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
      <mesh position={[6.55, 0.5, 0]}>
        <boxGeometry args={[0.1, 1, 11]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>

      {/* Space boxes */}
      {spaces.map((space) => {
        const cfg = sceneConfig[space.id];
        if (!cfg) return null;
        return (
          <SpaceMesh
            key={space.id}
            label={space.name}
            position={cfg.position}
            size={cfg.size}
            color={getColor(space.id)}
            isSelected={selectedSpaceId === space.id}
            pulse={getPulse(space.id)}
            onClick={() => onSpaceSelect(space.id)}
          />
        );
      })}
    </group>
  );
}
