"use client";

import { useEffect, useRef, type ComponentRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";

const SPEED = 7.2;
const EYE = 1.65;
const PLAYER_RADIUS = 0.45;

type Props = {
  enabled: boolean;
  blocked: boolean;
  colliders: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }>;
  onPosition?: (x: number, z: number) => void;
  spawn?: [number, number, number];
};

function blockedAt(
  x: number,
  z: number,
  colliders: Props["colliders"],
): boolean {
  for (const box of colliders) {
    if (
      x > box.minX - PLAYER_RADIUS &&
      x < box.maxX + PLAYER_RADIUS &&
      z > box.minZ - PLAYER_RADIUS &&
      z < box.maxZ + PLAYER_RADIUS
    ) {
      return true;
    }
  }
  return false;
}

export function PlayerController({
  enabled,
  blocked,
  colliders,
  onPosition,
  spawn = [0, EYE, 6],
}: Props) {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const controls = useRef<ComponentRef<typeof PointerLockControls>>(null);
  const ready = useRef(false);

  useEffect(() => {
    camera.position.set(spawn[0], spawn[1], spawn[2]);
    camera.rotation.set(0, 0, 0);
    ready.current = true;
  }, [camera, spawn]);

  useEffect(() => {
    function down(event: KeyboardEvent) {
      keys.current[event.code] = true;
    }
    function up(event: KeyboardEvent) {
      keys.current[event.code] = false;
    }
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_, delta) => {
    if (!enabled || !ready.current || blocked) return;
    const lock = controls.current;
    if (!lock?.isLocked) return;

    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    let moveX = 0;
    let moveZ = 0;
    if (keys.current.KeyW || keys.current.ArrowUp) {
      moveX += forward.x;
      moveZ += forward.z;
    }
    if (keys.current.KeyS || keys.current.ArrowDown) {
      moveX -= forward.x;
      moveZ -= forward.z;
    }
    if (keys.current.KeyD || keys.current.ArrowRight) {
      moveX += right.x;
      moveZ += right.z;
    }
    if (keys.current.KeyA || keys.current.ArrowLeft) {
      moveX -= right.x;
      moveZ -= right.z;
    }

    const length = Math.hypot(moveX, moveZ);
    if (length > 0) {
      const step = (SPEED * delta) / length;
      const nextX = camera.position.x + moveX * step;
      const nextZ = camera.position.z + moveZ * step;
      if (!blockedAt(nextX, camera.position.z, colliders)) {
        camera.position.x = nextX;
      }
      if (!blockedAt(camera.position.x, nextZ, colliders)) {
        camera.position.z = nextZ;
      }
    }

    camera.position.y = EYE;
    onPosition?.(camera.position.x, camera.position.z);
  });

  if (!enabled) return null;
  return <PointerLockControls ref={controls} />;
}
