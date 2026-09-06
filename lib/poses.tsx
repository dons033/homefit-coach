"use client";

/* Pose data for the cartoon rig (see components/RigFigure.tsx).
 * ART (body/limbs below) is separate from POSE (pivots + angles) and
 * MOTION (shared tempo windows). Regular vs hammer curl differs ONLY
 * in the numbers: grip projection, path width, top angle. That is the
 * whole point — new variations are data, not drawings.
 */

import type { ReactNode } from "react";
import {
  INK,
  ACTIVE,
  Limb,
  Dot,
  Mitt,
  HeadProfile,
  Shoe,
  Traj,
  type RigJoint,
} from "@/components/RigFigure";
import { Plate } from "@/components/bells";

export type RigDef = {
  id: string;
  label: string;
  view: "front" | "side";
  body: ReactNode;
  joints: RigJoint[];
  /** Critique checklist for /lab and future reviewers. */
  notes: string[];
};

function profileLegs(hipX = 72, hipY = 106, footY = 150) {
  return (
    <>
      <Limb x1={hipX} y1={hipY} x2={hipX - 12} y2={footY} />
      <Limb x1={hipX} y1={hipY} x2={hipX + 12} y2={footY} />
      <Shoe x={hipX - 12} y={footY} dir={-1} />
      <Shoe x={hipX + 12} y={footY} dir={1} />
    </>
  );
}

const curlSideBody = (
  <>
    {/* Head continues the spine line — level nose, no droop. */}
    <HeadProfile x={58} y={26} />
    <rect x={66} y={40} width={17} height={56} rx={8.5} fill={INK} />
    <Dot x={74} y={52} />
    <Limb x1={74} y1={52} x2={74} y2={84} w={7} />
    {profileLegs(74, 94, 150)}
  </>
);

export const RIG_DEFS: Record<string, RigDef> = {
  "curl-side": {
    id: "curl-side",
    label: "Curl — side",
    view: "side",
    body: (
      <>
        {curlSideBody}
        <Traj d="M74 119 A35 35 0 0 1 49 59" />
      </>
    ),
    joints: [
      {
        id: "elbow",
        pivot: [74, 84],
        from: 0,
        to: 135,
        draw: (
          <>
            <Limb x1={74} y1={84} x2={74} y2={112} c={ACTIVE} w={7} />
            <Mitt x={74} y={113} c={ACTIVE} />
            <Plate x={74} y={119} s={0.85} />
          </>
        ),
      },
    ],
    notes: [
      "Blue forearm is the ONLY mover — upper arm stays vertical, pinned at the side.",
      "Forearm sweeps forward-up about 135°; plate finishes below head height, clear of the face.",
      "No torso swing; hips stay over the feet; head level with the spine.",
    ],
  },
};

export const RIG_DEF_LIST = Object.values(RIG_DEFS);
