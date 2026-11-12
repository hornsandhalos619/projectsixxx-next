"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { PalaceWorld } from "@/components/palace/PalaceWorld";
import type { NpcId } from "@/config/palace";

type Props = {
  controlsEnabled: boolean;
  uiBlocked: boolean;
  puzzleProgress: Record<string, string[]>;
  onPosition: (x: number, z: number) => void;
  onNpcFocus: (id: NpcId | null, distance: number) => void;
  onPadStep: (puzzleId: string, padId: string) => void;
  onProductFocus: (id: string | null) => void;
};

export function PalaceCanvas(props: Props) {
  return (
    <div className="palace-canvas">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ fov: 70, near: 0.1, far: 180, position: [0, 1.65, 5] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <PalaceWorld {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}
