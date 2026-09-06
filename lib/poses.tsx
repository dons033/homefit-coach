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
  Limb,
  Dot,
  Mitt,
  HeadFront,
  HeadProfile,
  TorsoFront,
  Shorts,
  Shoe,
  Traj,
  type RigJoint,
} from "@/components/RigFigure";
import { Dumbbell, Plate } from "@/components/bells";

export type RigDef = {
  id: string;
  label: string;
  view: "front" | "side";
  body: ReactNode;
  joints: RigJoint[];
  /** Critique checklist for /lab and future reviewers. */
  notes: string[];
};

function standingLegs(spread = 10, hipY = 102, footY = 148) {
  return (
    <>
      <Limb x1={100} y1={hipY} x2={100 - spread} y2={footY} />
      <Limb x1={100} y1={hipY} x2={100 + spread} y2={footY} />
      <Shoe x={100 - spread} y={footY} dir={-1} />
      <Shoe x={100 + spread} y={footY} dir={1} />
    </>
  );
}

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

const curlFrontBody = (
  <>
    <HeadFront x={100} y={28} />
    <TorsoFront x={100} top={40} bottom={102} />
    <Dot x={82} y={62} />
    <Dot x={118} y={62} />
    <Limb x1={100} y1={62} x2={82} y2={86} />
    <Limb x1={100} y1={62} x2={118} y2={86} />
    <Dot x={82} y={86} />
    <Dot x={118} y={86} />
    {standingLegs(10)}
    <Shorts x={100} y={94} />
  </>
);

const hammerFrontBody = (
  <>
    <HeadFront x={100} y={28} />
    <TorsoFront x={100} top={40} bottom={102} />
    <Dot x={84} y={62} />
    <Dot x={116} y={62} />
    <Limb x1={100} y1={62} x2={84} y2={86} />
    <Limb x1={100} y1={62} x2={116} y2={86} />
    <Dot x={84} y={86} />
    <Dot x={116} y={86} />
    {standingLegs(10)}
    <Shorts x={100} y={94} />
  </>
);

const curlSideBody = (
  <>
    <HeadProfile x={62} y={32} />
    <Limb x1={72} y1={44} x2={72} y2={106} w={10} />
    <Dot x={72} y={58} />
    <Limb x1={72} y1={58} x2={72} y2={84} />
    <Dot x={72} y={84} />
    {profileLegs()}
    <rect x={61} y={96} width={22} height={14} rx={6} fill={INK} opacity={0.9} />
  </>
);

export const RIG_DEFS: Record<string, RigDef> = {
  "curl-front-regular": {
    id: "curl-front-regular",
    label: "Curl — front",
    view: "front",
    body: (
      <>
        {curlFrontBody}
        <Traj d="M82 120 A38 38 0 0 1 66 62" />
        <Traj d="M118 120 A38 38 0 0 0 134 62" />
      </>
    ),
    joints: [
      {
        id: "elbowL",
        pivot: [82, 86],
        from: 0,
        to: -135,
        draw: (
          <>
            <Limb x1={82} y1={86} x2={82} y2={114} />
            <Mitt x={82} y={115} />
            <Dumbbell x={82} y={122} />
          </>
        ),
      },
      {
        id: "elbowR",
        pivot: [118, 86],
        from: 0,
        to: -135,
        draw: (
          <>
            <Limb x1={118} y1={86} x2={118} y2={114} />
            <Mitt x={118} y={115} />
            <Dumbbell x={118} y={122} />
          </>
        ),
      },
    ],
    notes: [
      "Elbows pinned at sides — no forward drift through the rep.",
      "Bells finish at shoulder height, slightly outside the shoulders.",
      "Palms face forward the whole way; wrists straight.",
      "Full extension at the bottom — no half-reps.",
    ],
  },
  "curl-front-hammer": {
    id: "curl-front-hammer",
    label: "Hammer curl — front",
    view: "front",
    body: (
      <>
        {hammerFrontBody}
        <Traj d="M84 122 A34 34 0 0 1 74 66" />
        <Traj d="M116 122 A34 34 0 0 0 126 66" />
      </>
    ),
    joints: [
      {
        id: "elbowL",
        pivot: [84, 86],
        from: 0,
        to: -120,
        draw: (
          <>
            <Limb x1={84} y1={86} x2={84} y2={114} />
            <Mitt x={84} y={115} />
            <Plate x={84} y={122} />
          </>
        ),
      },
      {
        id: "elbowR",
        pivot: [116, 86],
        from: 0,
        to: -120,
        draw: (
          <>
            <Limb x1={116} y1={86} x2={116} y2={114} />
            <Mitt x={116} y={115} />
            <Plate x={116} y={122} />
          </>
        ),
      },
    ],
    notes: [
      "Neutral grip — palms face the thighs, plates face the camera.",
      "Path stays tight to the body; finish at chest height, not shoulders.",
      "Elbows stay back — no shoulder involvement.",
      "Same hinge as regular curl; only the handle turned.",
    ],
  },
  "curl-side": {
    id: "curl-side",
    label: "Curl — side",
    view: "side",
    body: (
      <>
        {curlSideBody}
        <Traj d="M72 118 A36 36 0 0 1 40 82" />
      </>
    ),
    joints: [
      {
        id: "elbow",
        pivot: [72, 84],
        from: 0,
        to: 135,
        draw: (
          <>
            <Limb x1={72} y1={84} x2={72} y2={112} />
            <Mitt x={72} y={113} />
            <Plate x={72} y={120} />
          </>
        ),
      },
    ],
    notes: [
      "Upper arm vertical the whole rep — the only mover is the elbow.",
      "Forearm sweeps forward-up about 135°.",
      "No torso swing; hips stay over the feet.",
    ],
  },
};

export const RIG_DEF_LIST = Object.values(RIG_DEFS);
