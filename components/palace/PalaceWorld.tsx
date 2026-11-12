"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { Text, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  palaceNpcs,
  palaceRooms,
  productRelics,
  type NpcId,
  type PalaceRoom,
} from "@/config/palace";
import { moodEmissive, palacePalette } from "@/components/palace/materials";
import { PlayerController } from "@/components/palace/PlayerController";

export type Collider = { minX: number; maxX: number; minZ: number; maxZ: number };

type Props = {
  controlsEnabled: boolean;
  uiBlocked: boolean;
  puzzleProgress: Record<string, string[]>;
  onPosition: (x: number, z: number) => void;
  onNpcFocus: (id: NpcId | null, distance: number) => void;
  onPadStep: (puzzleId: string, padId: string) => void;
  onProductFocus: (id: string | null) => void;
};

function roomBounds(room: PalaceRoom): Collider {
  const [cx, , cz] = room.center;
  const [sx, , sz] = room.size;
  return {
    minX: cx - sx / 2,
    maxX: cx + sx / 2,
    minZ: cz - sz / 2,
    maxZ: cz + sz / 2,
  };
}

function wallColliders(room: PalaceRoom): Collider[] {
  const b = roomBounds(room);
  const t = 0.55;
  return [
    { minX: b.minX - t, maxX: b.maxX + t, minZ: b.minZ - t, maxZ: b.minZ + t },
    { minX: b.minX - t, maxX: b.maxX + t, minZ: b.maxZ - t, maxZ: b.maxZ + t },
    { minX: b.minX - t, maxX: b.minX + t, minZ: b.minZ - t, maxZ: b.maxZ + t },
    { minX: b.maxX - t, maxX: b.maxX + t, minZ: b.minZ - t, maxZ: b.maxZ + t },
  ];
}

function collidersForRoom(room: PalaceRoom, all: PalaceRoom[]): Collider[] {
  const walls = wallColliders(room);
  const doorWidth = 3.2;
  const filtered: Collider[] = [];

  for (const wall of walls) {
    const horizontal = wall.maxZ - wall.minZ < wall.maxX - wall.minX;
    let keep = true;
    for (const linkId of room.links) {
      const other = all.find((entry) => entry.id === linkId);
      if (!other) continue;
      const midX = (room.center[0] + other.center[0]) / 2;
      const midZ = (room.center[2] + other.center[2]) / 2;
      if (horizontal) {
        const onWall =
          Math.abs(wall.minZ - midZ) < 1.2 || Math.abs(wall.maxZ - midZ) < 1.2;
        if (onWall && Math.abs(midX - (wall.minX + wall.maxX) / 2) < room.size[0]) {
          const left: Collider = { ...wall, maxX: midX - doorWidth / 2 };
          const right: Collider = { ...wall, minX: midX + doorWidth / 2 };
          if (left.maxX > left.minX + 0.2) filtered.push(left);
          if (right.maxX > right.minX + 0.2) filtered.push(right);
          keep = false;
          break;
        }
      } else {
        const onWall =
          Math.abs(wall.minX - midX) < 1.2 || Math.abs(wall.maxX - midX) < 1.2;
        if (onWall && Math.abs(midZ - (wall.minZ + wall.maxZ) / 2) < room.size[2]) {
          const top: Collider = { ...wall, maxZ: midZ - doorWidth / 2 };
          const bottom: Collider = { ...wall, minZ: midZ + doorWidth / 2 };
          if (top.maxZ > top.minZ + 0.2) filtered.push(top);
          if (bottom.maxZ > bottom.minZ + 0.2) filtered.push(bottom);
          keep = false;
          break;
        }
      }
    }
    if (keep) filtered.push(wall);
  }

  return filtered;
}

function mazeExtraColliders(room: PalaceRoom): Collider[] {
  if (!room.id.startsWith("maze-")) return [];
  const [cx, , cz] = room.center;
  const ribs: Collider[] = [];
  for (const ox of [-8, -2.5, 2.5, 8]) {
    ribs.push({
      minX: cx + ox - 0.4,
      maxX: cx + ox + 0.4,
      minZ: cz - 10,
      maxZ: cz + 4,
    });
  }
  ribs.push({ minX: cx - 10, maxX: cx - 2, minZ: cz + 2, maxZ: cz + 2.8 });
  ribs.push({ minX: cx + 2, maxX: cx + 10, minZ: cz - 3.2, maxZ: cz - 2.4 });
  return ribs;
}

function Chamber({ room }: { room: PalaceRoom }) {
  const [cx, , cz] = room.center;
  const [sx, sy, sz] = room.size;
  const emissive = moodEmissive(room.mood);
  const texture = useTexture(room.wallTexture || "/portal/horns-obsidian-glass.png");
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.2, 1.4);
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <group position={[cx, 0, cz]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[sx, sz]} />
        <meshStandardMaterial
          color={room.mood === "halos" ? "#1c1a16" : "#0a0908"}
          metalness={0.55}
          roughness={0.28}
        />
      </mesh>
      <mesh position={[0, sy, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[sx, sz]} />
        <meshStandardMaterial color="#070708" metalness={0.4} roughness={0.55} />
      </mesh>

      {(
        [
          [0, sy / 2, -sz / 2, sx, sy, false],
          [0, sy / 2, sz / 2, sx, sy, false],
          [-sx / 2, sy / 2, 0, sz, sy, true],
          [sx / 2, sy / 2, 0, sz, sy, true],
        ] as Array<[number, number, number, number, number, boolean]>
      ).map((wall, index) => (
        <mesh
          key={index}
          position={[wall[0], wall[1], wall[2]]}
          rotation={wall[5] ? [0, Math.PI / 2, 0] : [0, 0, 0]}
          castShadow
          receiveShadow
        >
          <planeGeometry args={[wall[3], wall[4]]} />
          <meshStandardMaterial
            map={texture}
            color="#9a9590"
            metalness={0.35}
            roughness={0.45}
            emissive={emissive}
            emissiveIntensity={room.mood === "void" ? 0.03 : 0.08}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      <Text
        position={[0, sy - 1.2, sz / 2 - 0.8]}
        fontSize={0.55}
        color={palacePalette.bone}
        anchorX="center"
        anchorY="middle"
        maxWidth={sx - 2}
      >
        {room.name}
      </Text>
      <pointLight
        position={[0, sy - 1.5, 0]}
        intensity={room.mood === "liminal" ? 28 : 18}
        distance={sx * 1.4}
        color={emissive}
        castShadow
      />
      <spotLight
        position={[0, sy - 0.5, 0]}
        angle={0.55}
        penumbra={0.6}
        intensity={12}
        color={palacePalette.bone}
      />
    </group>
  );
}

function Corridor({ a, b }: { a: PalaceRoom; b: PalaceRoom }) {
  const midX = (a.center[0] + b.center[0]) / 2;
  const midZ = (a.center[2] + b.center[2]) / 2;
  const dx = b.center[0] - a.center[0];
  const dz = b.center[2] - a.center[2];
  const length = Math.hypot(dx, dz);
  const angle = Math.atan2(dx, dz);
  return (
    <group position={[midX, 0, midZ]} rotation={[0, angle, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[3.4, length]} />
        <meshStandardMaterial color="#121014" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[-1.7, 2.2, 0]}>
        <boxGeometry args={[0.25, 4.4, length]} />
        <meshStandardMaterial color="#1a1612" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[1.7, 2.2, 0]}>
        <boxGeometry args={[0.25, 4.4, length]} />
        <meshStandardMaterial color="#1a1612" metalness={0.4} roughness={0.5} />
      </mesh>
      <pointLight position={[0, 3.2, 0]} intensity={8} distance={10} color="#C7CCD4" />
    </group>
  );
}

function NpcAvatar({
  id,
  position,
  color,
  name,
  nearestRef,
}: {
  id: NpcId;
  position: [number, number, number];
  color: string;
  name: string;
  nearestRef: MutableRefObject<{ id: NpcId | null; dist: number }>;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ camera }) => {
    if (!group.current) return;
    const dist = camera.position.distanceTo(group.current.position);
    if (dist < nearestRef.current.dist) {
      nearestRef.current = { id, dist };
    }
  });

  return (
    <group ref={group} position={position}>
      <mesh position={[0, 1.05, 0]} castShadow>
        <capsuleGeometry args={[0.35, 1.1, 6, 12]} />
        <meshStandardMaterial
          color="#141210"
          metalness={0.65}
          roughness={0.3}
          emissive={color}
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh position={[0, 2.05, 0]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      <pointLight position={[0, 2.2, 0]} intensity={6} distance={6} color={color} />
      <Text
        position={[0, 2.7, 0]}
        fontSize={0.28}
        color={palacePalette.bone}
        anchorX="center"
        outlineWidth={0.01}
        outlineColor="#000"
      >
        {name}
      </Text>
    </group>
  );
}

function PuzzlePads({
  room,
  progress,
  onPadStep,
}: {
  room: PalaceRoom;
  progress: string[];
  onPadStep: (puzzleId: string, padId: string) => void;
}) {
  const puzzle = room.puzzle;
  const stepped = useRef(new Set<string>());
  const [cx, , cz] = room.center;

  const pads = useMemo(() => {
    if (!puzzle) return [];
    return puzzle.sequence.map((padId, index) => {
      const angle = (index / puzzle.sequence.length) * Math.PI * 2;
      return {
        id: padId,
        x: cx + Math.cos(angle) * 6.5,
        z: cz + Math.sin(angle) * 6.5,
      };
    });
  }, [puzzle, cx, cz]);

  useFrame(({ camera }) => {
    if (!puzzle) return;
    for (const pad of pads) {
      const dist = Math.hypot(camera.position.x - pad.x, camera.position.z - pad.z);
      if (dist < 1.1 && !stepped.current.has(pad.id)) {
        stepped.current.add(pad.id);
        onPadStep(puzzle.id, pad.id);
      }
    }
  });

  if (!puzzle) return null;

  return (
    <group>
      {pads.map((pad) => {
        const lit = progress.includes(pad.id);
        return (
          <mesh key={pad.id} position={[pad.x, 0.05, pad.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.85, 32]} />
            <meshStandardMaterial
              color={lit ? palacePalette.gold : palacePalette.crimson}
              emissive={lit ? palacePalette.gold : palacePalette.crimson}
              emissiveIntensity={lit ? 0.9 : 0.25}
              metalness={0.6}
              roughness={0.25}
            />
          </mesh>
        );
      })}
      <Text
        position={[cx, 3.2, cz]}
        fontSize={0.32}
        color={palacePalette.bone}
        maxWidth={12}
        textAlign="center"
        anchorX="center"
      >
        {puzzle.prompt}
      </Text>
    </group>
  );
}

function ProductPedestal({
  index,
  total,
  image,
  name,
  side,
  id,
  focusRef,
}: {
  index: number;
  total: number;
  image: string;
  name: string;
  side: "horns" | "halos";
  id: string;
  focusRef: MutableRefObject<{ id: string | null; dist: number }>;
}) {
  const texture = useTexture(image);
  texture.colorSpace = THREE.SRGBColorSpace;
  const x = (index - (total - 1) / 2) * 4.2;
  const z = -78;

  useFrame(({ camera }) => {
    const dist = Math.hypot(camera.position.x - x, camera.position.z - z);
    if (dist < focusRef.current.dist) {
      focusRef.current = { id, dist };
    }
  });

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.7, 0.9, 24]} />
        <meshStandardMaterial
          color={side === "horns" ? "#1A1612" : "#2a2824"}
          metalness={0.7}
          roughness={0.25}
          emissive={side === "horns" ? palacePalette.crimson : palacePalette.silver}
          emissiveIntensity={0.15}
        />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshStandardMaterial map={texture} toneMapped={false} />
      </mesh>
      <Text position={[0, 2.55, 0]} fontSize={0.22} color={palacePalette.bone} anchorX="center">
        {name}
      </Text>
    </group>
  );
}

function OvermindCore() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.y += delta * 0.35;
  });
  return (
    <group position={[0, 3.5, -138]}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshStandardMaterial
          color={palacePalette.silver}
          metalness={0.9}
          roughness={0.12}
          emissive={palacePalette.gold}
          emissiveIntensity={0.55}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.55, 0]} />
        <meshBasicMaterial color={palacePalette.gold} wireframe transparent opacity={0.35} />
      </mesh>
      <pointLight intensity={40} distance={28} color={palacePalette.gold} />
      <Text position={[0, 2.4, 0]} fontSize={0.4} color={palacePalette.bone} anchorX="center">
        OVERMIND
      </Text>
    </group>
  );
}

function FocusReporter({
  nearestRef,
  productRef,
  onNpcFocus,
  onProductFocus,
}: {
  nearestRef: MutableRefObject<{ id: NpcId | null; dist: number }>;
  productRef: MutableRefObject<{ id: string | null; dist: number }>;
  onNpcFocus: (id: NpcId | null, distance: number) => void;
  onProductFocus: (id: string | null) => void;
}) {
  useFrame(() => {
    if (nearestRef.current.dist < 3.2 && nearestRef.current.id) {
      onNpcFocus(nearestRef.current.id, nearestRef.current.dist);
    } else {
      onNpcFocus(null, nearestRef.current.dist);
    }
    if (productRef.current.dist < 2.4 && productRef.current.id) {
      onProductFocus(productRef.current.id);
    } else {
      onProductFocus(null);
    }
    nearestRef.current = { id: null, dist: Infinity };
    productRef.current = { id: null, dist: Infinity };
  });
  return null;
}

export function buildPalaceColliders(): Collider[] {
  const all = palaceRooms;
  const list: Collider[] = [];
  for (const room of all) {
    list.push(...collidersForRoom(room, all));
    list.push(...mazeExtraColliders(room));
  }
  list.push(
    { minX: -70, maxX: 70, minZ: 20, maxZ: 22 },
    { minX: -70, maxX: 70, minZ: -190, maxZ: -188 },
    { minX: -72, maxX: -70, minZ: -190, maxZ: 22 },
    { minX: 70, maxX: 72, minZ: -190, maxZ: 22 },
  );
  return list;
}

export function PalaceWorld({
  controlsEnabled,
  uiBlocked,
  puzzleProgress,
  onPosition,
  onNpcFocus,
  onPadStep,
  onProductFocus,
}: Props) {
  const colliders = useMemo(() => buildPalaceColliders(), []);
  const nearestRef = useRef<{ id: NpcId | null; dist: number }>({
    id: null,
    dist: Infinity,
  });
  const productRef = useRef<{ id: string | null; dist: number }>({
    id: null,
    dist: Infinity,
  });

  const corridorPairs = useMemo(() => {
    const seen = new Set<string>();
    const pairs: Array<[PalaceRoom, PalaceRoom]> = [];
    for (const room of palaceRooms) {
      for (const link of room.links) {
        const key = [room.id, link].sort().join(":");
        if (seen.has(key)) continue;
        seen.add(key);
        const other = palaceRooms.find((entry) => entry.id === link);
        if (other) pairs.push([room, other]);
      }
    }
    return pairs;
  }, []);

  return (
    <>
      <color attach="background" args={[palacePalette.void]} />
      <fog attach="fog" args={[palacePalette.void, 18, 70]} />
      <ambientLight intensity={0.32} color="#b8b0a4" />
      <hemisphereLight args={["#c7ccd4", "#1a1612", 0.45]} />
      <directionalLight
        position={[8, 24, 10]}
        intensity={0.85}
        color="#e8e2d6"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {palaceRooms.map((room) => (
        <Chamber key={room.id} room={room} />
      ))}
      {corridorPairs.map(([a, b]) => (
        <Corridor key={`${a.id}-${b.id}`} a={a} b={b} />
      ))}

      {palaceRooms
        .filter((room) => room.puzzle)
        .map((room) => (
          <PuzzlePads
            key={room.id}
            room={room}
            progress={puzzleProgress[room.puzzle!.id] ?? []}
            onPadStep={onPadStep}
          />
        ))}

      {palaceNpcs.map((npc) => (
        <NpcAvatar
          key={npc.id}
          id={npc.id}
          position={npc.position}
          color={npc.color}
          name={npc.name}
          nearestRef={nearestRef}
        />
      ))}

      {productRelics.map((relic, index) => (
        <ProductPedestal
          key={relic.id}
          id={relic.id}
          index={index}
          total={productRelics.length}
          image={relic.image}
          name={relic.name}
          side={relic.side}
          focusRef={productRef}
        />
      ))}

      <OvermindCore />

      <mesh position={[0, 0.2, -168]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 3.4, 48]} />
        <meshStandardMaterial
          color={palacePalette.gold}
          emissive={palacePalette.gold}
          emissiveIntensity={0.7}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <Text position={[0, 2.8, -168]} fontSize={0.42} color={palacePalette.gold} anchorX="center">
        Threshold of Death
      </Text>

      <FocusReporter
        nearestRef={nearestRef}
        productRef={productRef}
        onNpcFocus={onNpcFocus}
        onProductFocus={onProductFocus}
      />

      <PlayerController
        enabled={controlsEnabled}
        blocked={uiBlocked}
        colliders={colliders}
        onPosition={onPosition}
        spawn={[0, 1.65, 5]}
      />
    </>
  );
}
