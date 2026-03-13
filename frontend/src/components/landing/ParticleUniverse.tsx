"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────
// MATH UTILITIES
// ─────────────────────────────────────────────────────────────
function easeInOut(t: number) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
function easeOut(t: number) { return 1 - Math.pow(1-t, 3); }
function mix(a: number, b: number, t: number) { return a + (b-a)*t; }

function randomInSphere(cx: number, cy: number, cz: number, r: number): [number,number,number] {
  const u = Math.random(), v = Math.random();
  const theta = 2*Math.PI*u, phi = Math.acos(2*v-1);
  const rad = Math.cbrt(Math.random()) * r;
  return [cx + rad*Math.sin(phi)*Math.cos(theta), cy + rad*Math.sin(phi)*Math.sin(theta), cz + rad*Math.cos(phi)];
}

function randomInEllipsoid(cx: number, cy: number, cz: number, a: number, b: number, c: number): [number,number,number] {
  const [x,y,z] = randomInSphere(0,0,0,1);
  return [cx+x*a, cy+y*b, cz+z*c];
}

function randomOnCapsule(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, r: number): [number,number,number] {
  const t = Math.random();
  const px = x1+t*(x2-x1), py = y1+t*(y2-y1), pz = z1+t*(z2-z1);
  const theta = Math.random()*Math.PI*2;
  const dr = Math.sqrt(Math.random())*r;
  const dx = [y2-y1, z2-z1, x2-x1];
  const len = Math.hypot(dx[0],dx[1],dx[2]) || 1;
  const n = [dx[0]/len, dx[1]/len, dx[2]/len];
  let up: [number,number,number] = [0,0,1];
  if (Math.abs(n[2]) > 0.9) up = [1,0,0];
  const bx = n[1]*up[2]-n[2]*up[1], by = n[2]*up[0]-n[0]*up[2], bz = n[0]*up[1]-n[1]*up[0];
  const bl = Math.hypot(bx,by,bz) || 1;
  const b1 = [bx/bl, by/bl, bz/bl];
  const b2 = [n[1]*b1[2]-n[2]*b1[1], n[2]*b1[0]-n[0]*b1[2], n[0]*b1[1]-n[1]*b1[0]];
  return [
    px + dr*(Math.cos(theta)*b1[0]+Math.sin(theta)*b2[0]),
    py + dr*(Math.cos(theta)*b1[1]+Math.sin(theta)*b2[1]),
    pz + dr*(Math.cos(theta)*b1[2]+Math.sin(theta)*b2[2])
  ];
}

// ─────────────────────────────────────────────────────────────
// ANATOMICALLY ACCURATE HUMAN BODY DEFINITION
// Each region has a weight (particle density) and a generator
// Proportions based on real human anatomy (8-head canon)
// Total height: ~3.6 units (head center at 1.8y)
// ─────────────────────────────────────────────────────────────
function buildHumanRegions() {
  const S = 0.85; // global scale
  return [
    // ── HEAD ──
    // Cranium (main skull)
    { w: 10, gen: () => randomInEllipsoid(0, 1.72*S, 0, 0.18*S, 0.22*S, 0.19*S) },
    // Face (slightly forward, narrower)
    { w: 6, gen: () => randomInEllipsoid(0, 1.58*S, 0.06*S, 0.14*S, 0.12*S, 0.10*S) },
    // Jaw/chin
    { w: 3, gen: () => randomInEllipsoid(0, 1.48*S, 0.04*S, 0.10*S, 0.06*S, 0.08*S) },

    // ── NECK ──
    { w: 4, gen: () => randomOnCapsule(0, 1.42*S, 0, 0, 1.30*S, 0, 0.06*S) },

    // ── SHOULDERS (clavicle line) ──
    { w: 5, gen: () => randomOnCapsule(-0.38*S, 1.28*S, 0, 0.38*S, 1.28*S, 0, 0.05*S) },

    // ── DELTOIDS (shoulder caps) ──
    { w: 5, gen: () => randomInEllipsoid(-0.42*S, 1.22*S, 0, 0.10*S, 0.08*S, 0.08*S) },
    { w: 5, gen: () => randomInEllipsoid(0.42*S, 1.22*S, 0, 0.10*S, 0.08*S, 0.08*S) },

    // ── UPPER TORSO (chest / pectorals) ──
    { w: 14, gen: () => randomInEllipsoid(0, 1.10*S, 0.02*S, 0.32*S, 0.20*S, 0.14*S) },
    // Rib cage sides
    { w: 6, gen: () => randomInEllipsoid(-0.26*S, 0.98*S, 0, 0.10*S, 0.14*S, 0.10*S) },
    { w: 6, gen: () => randomInEllipsoid(0.26*S, 0.98*S, 0, 0.10*S, 0.14*S, 0.10*S) },

    // ── MID TORSO (abdomen / waist) ──
    { w: 10, gen: () => randomInEllipsoid(0, 0.80*S, 0.01*S, 0.28*S, 0.15*S, 0.12*S) },

    // ── LOWER TORSO (pelvis / hips) ──
    { w: 10, gen: () => randomInEllipsoid(0, 0.62*S, 0, 0.30*S, 0.12*S, 0.13*S) },
    // Hip joints (wider)
    { w: 4, gen: () => randomInSphere(-0.22*S, 0.55*S, 0, 0.08*S) },
    { w: 4, gen: () => randomInSphere(0.22*S, 0.55*S, 0, 0.08*S) },

    // ── UPPER ARMS (biceps/triceps) ──
    { w: 7, gen: () => randomOnCapsule(-0.44*S, 1.18*S, 0, -0.48*S, 0.85*S, 0, 0.065*S) },
    { w: 7, gen: () => randomOnCapsule(0.44*S, 1.18*S, 0, 0.48*S, 0.85*S, 0, 0.065*S) },

    // ── ELBOWS ──
    { w: 2, gen: () => randomInSphere(-0.49*S, 0.82*S, 0, 0.045*S) },
    { w: 2, gen: () => randomInSphere(0.49*S, 0.82*S, 0, 0.045*S) },

    // ── FOREARMS ──
    { w: 6, gen: () => randomOnCapsule(-0.50*S, 0.80*S, 0, -0.54*S, 0.52*S, 0.02*S, 0.050*S) },
    { w: 6, gen: () => randomOnCapsule(0.50*S, 0.80*S, 0, 0.54*S, 0.52*S, 0.02*S, 0.050*S) },

    // ── WRISTS ──
    { w: 1, gen: () => randomInSphere(-0.55*S, 0.48*S, 0.02*S, 0.030*S) },
    { w: 1, gen: () => randomInSphere(0.55*S, 0.48*S, 0.02*S, 0.030*S) },

    // ── HANDS (open, fingers spread slightly) ──
    { w: 4, gen: () => randomInEllipsoid(-0.56*S, 0.38*S, 0.02*S, 0.04*S, 0.08*S, 0.02*S) },
    { w: 4, gen: () => randomInEllipsoid(0.56*S, 0.38*S, 0.02*S, 0.04*S, 0.08*S, 0.02*S) },
    // Fingers (5 per hand, subtle)
    ...Array.from({length: 5}, (_, fi) => ({
      w: 1,
      gen: () => randomOnCapsule(-0.54*S + (fi-2)*0.015*S, 0.30*S, 0.02*S, -0.54*S + (fi-2)*0.018*S, 0.24*S, 0.02*S, 0.012*S)
    })),
    ...Array.from({length: 5}, (_, fi) => ({
      w: 1,
      gen: () => randomOnCapsule(0.54*S + (fi-2)*0.015*S, 0.30*S, 0.02*S, 0.54*S + (fi-2)*0.018*S, 0.24*S, 0.02*S, 0.012*S)
    })),

    // ── UPPER LEGS (THIGHS) ──
    { w: 10, gen: () => randomOnCapsule(-0.18*S, 0.50*S, 0, -0.20*S, 0.05*S, 0, 0.10*S) },
    { w: 10, gen: () => randomOnCapsule(0.18*S, 0.50*S, 0, 0.20*S, 0.05*S, 0, 0.10*S) },

    // ── KNEES ──
    { w: 3, gen: () => randomInSphere(-0.20*S, 0.02*S, 0.02*S, 0.06*S) },
    { w: 3, gen: () => randomInSphere(0.20*S, 0.02*S, 0.02*S, 0.06*S) },

    // ── LOWER LEGS (shins/calves, tapering) ──
    { w: 8, gen: () => randomOnCapsule(-0.20*S, -0.02*S, 0, -0.20*S, -0.52*S, 0, 0.065*S) },
    { w: 8, gen: () => randomOnCapsule(0.20*S, -0.02*S, 0, 0.20*S, -0.52*S, 0, 0.065*S) },

    // ── ANKLES ──
    { w: 2, gen: () => randomInSphere(-0.20*S, -0.55*S, 0, 0.04*S) },
    { w: 2, gen: () => randomInSphere(0.20*S, -0.55*S, 0, 0.04*S) },

    // ── FEET ──
    { w: 4, gen: () => randomInEllipsoid(-0.20*S, -0.62*S, 0.04*S, 0.05*S, 0.03*S, 0.10*S) },
    { w: 4, gen: () => randomInEllipsoid(0.20*S, -0.62*S, 0.04*S, 0.05*S, 0.03*S, 0.10*S) },

    // ── INTERNAL ORGANS (for scan/highlight phase) ──
    // Heart (left chest)
    { w: 6, gen: () => randomInSphere(-0.08*S, 1.04*S, 0.06*S, 0.06*S), organ: 'heart' as const },
    // Left Lung
    { w: 8, gen: () => randomInEllipsoid(-0.18*S, 1.06*S, 0.02*S, 0.10*S, 0.16*S, 0.08*S), organ: 'llung' as const },
    // Right Lung
    { w: 8, gen: () => randomInEllipsoid(0.18*S, 1.06*S, 0.02*S, 0.10*S, 0.16*S, 0.08*S), organ: 'rlung' as const },
    // Liver
    { w: 4, gen: () => randomInEllipsoid(0.12*S, 0.88*S, 0.04*S, 0.10*S, 0.08*S, 0.06*S), organ: 'liver' as const },
    // Stomach
    { w: 3, gen: () => randomInEllipsoid(-0.06*S, 0.82*S, 0.04*S, 0.08*S, 0.06*S, 0.05*S), organ: 'stomach' as const },
    // Intestines
    { w: 5, gen: () => randomInEllipsoid(0, 0.68*S, 0.03*S, 0.16*S, 0.10*S, 0.06*S), organ: 'intestine' as const },
    // Brain (inside skull)
    { w: 6, gen: () => randomInEllipsoid(0, 1.72*S, 0, 0.14*S, 0.16*S, 0.14*S), organ: 'brain' as const },
    // Spine (central column)
    { w: 5, gen: () => randomOnCapsule(0, 1.35*S, -0.04*S, 0, 0.58*S, -0.04*S, 0.025*S), organ: 'spine' as const },
  ];
}

// ─────────────────────────────────────────────────────────────
// INDIA MAP WITH STATE OUTLINES
// Detailed India boundary + major state borders for particle map
// Coordinates: [longitude, latitude] → mapped to scene XY
// ─────────────────────────────────────────────────────────────
const indiaOutline: [number,number][] = [
  // Northern border (J&K → Arunachal)
  [74.8,34.3],[75.5,33.0],[76.0,32.5],[77.0,31.0],[78.0,30.5],[79.0,30.5],
  [80.0,30.0],[81.0,30.0],[82.0,28.5],[83.0,28.0],[84.0,27.5],[85.0,27.8],
  [86.0,27.8],[87.0,27.5],[88.0,27.0],[89.0,27.0],[90.0,28.0],[91.0,27.5],
  [92.0,27.5],[93.0,27.0],[94.0,27.5],[95.0,28.0],[96.0,28.5],[97.0,28.0],
  // Eastern border (Arunachal → Myanmar border)
  [96.5,27.0],[95.5,26.0],[94.5,25.5],[93.5,24.5],[92.5,23.0],[92.0,22.0],
  [92.5,21.0],[91.5,22.5],[90.5,22.0],[89.0,22.0],[88.5,22.5],[88.0,22.0],
  // Bay of Bengal coast
  [87.5,21.5],[87.0,21.0],[86.5,20.5],[86.0,20.0],[85.5,19.5],[85.0,19.0],
  [84.5,18.5],[83.5,18.0],[82.5,17.0],[81.5,16.5],[80.5,15.5],[80.0,14.5],
  [79.8,13.5],[79.8,12.5],[80.0,11.5],[80.2,10.5],[79.8,9.5],[79.5,8.5],
  // Southern tip (Kanyakumari)
  [78.0,8.0],[77.5,8.2],
  // Western coast (Arabian Sea)
  [77.0,8.5],[76.5,9.5],[76.0,10.5],[75.5,11.5],[75.0,12.5],[74.5,13.5],
  [74.0,14.5],[73.5,15.5],[73.0,16.5],[72.8,17.5],[72.5,18.5],[72.8,19.5],
  [73.0,20.5],[72.5,21.5],[71.5,22.5],[70.5,22.5],[70.0,23.0],[69.0,23.5],
  [68.5,23.5],[68.0,24.0],[68.5,25.0],[70.0,25.5],[70.5,26.0],[70.0,26.5],
  [69.5,27.0],[70.0,27.5],[71.0,28.0],[71.5,29.0],[72.0,30.0],[73.0,31.0],
  [74.0,32.5],[74.8,34.3], // close loop
];

// Major state border segments (simplified)
const stateBorders: [number,number,number,number][] = [
  // Rajasthan-Gujarat
  [72.5,24.5, 69.5,22.0],
  // MP-Maharashtra
  [76.0,22.0, 80.5,22.0],
  // Maharashtra-Karnataka
  [74.0,16.5, 78.0,16.0],
  // UP-MP
  [78.0,26.5, 82.5,24.5],
  // Bihar-Jharkhand
  [84.0,24.5, 87.5,24.0],
  // WB-Odisha
  [86.5,22.5, 84.0,20.5],
  // AP-Telangana
  [78.0,18.5, 81.0,17.5],
  // Tamil Nadu - Kerala
  [77.0,11.0, 77.0,8.5],
  // Karnataka-TN
  [77.5,14.0, 79.5,12.5],
  // Gujarat-Rajasthan
  [72.0,24.5, 74.0,26.5],
  // Punjab-Haryana
  [75.5,30.5, 77.0,28.5],
  // UP-Bihar
  [84.0,26.0, 84.0,24.5],
];

const hotspots: [number,number][] = [
  [72.88, 19.08], // Mumbai
  [77.10, 28.70], // Delhi
  [88.36, 22.57], // Kolkata
  [80.27, 13.08], // Chennai
  [78.49, 17.39], // Hyderabad
  [75.86, 22.72], // Indore
  [76.27, 9.93],  // Kochi
  [73.86, 18.52], // Pune
];

function mapGeoToScene(lon: number, lat: number): [number, number] {
  // Map India's geo coords to scene coords (centered, scaled to fill ~4x4 units)
  const centerLon = 82.0, centerLat = 22.0;
  const scale = 0.22;
  return [(lon - centerLon) * scale, (lat - centerLat) * scale];
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function ParticleUniverse({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const pointsRef = useRef<THREE.Points>(null);
  const geomRef = useRef<THREE.BufferGeometry>(null);
  const scanlineRef = useRef<THREE.Mesh>(null);

  const count = useMemo(() => (typeof window !== 'undefined' && window.innerWidth < 768) ? 25000 : 60000, []);
  const hotspotCount = useMemo(() => Math.floor(count * 0.08), [count]);

  const [buffers, setBuffers] = React.useState<{
    chaosPos: Float32Array;
    humanPos: Float32Array;
    indiaPos: Float32Array;
    explosionDir: Float32Array;
    initColors: Float32Array;
    initSizes: Float32Array;
    organFlags: Int8Array; // organ type: 0=body, 1=heart, 2=lung, 3=other organ, 4=brain
  } | null>(null);

  useEffect(() => {
    const regions = buildHumanRegions();
    const totalW = regions.reduce((s, r) => s + r.w, 0);
    
    // Build weighted generator list
    const generators: { gen: () => [number,number,number]; organ?: string }[] = [];
    for (const r of regions) {
      const n = Math.round((r.w / totalW) * count);
      for (let i = 0; i < n; i++) generators.push({ gen: r.gen, organ: (r as any).organ });
    }
    while (generators.length < count) generators.push({ gen: regions[0].gen });
    if (generators.length > count) generators.length = count;

    const cPos = new Float32Array(count * 3);
    const hPos = new Float32Array(count * 3);
    const iPos = new Float32Array(count * 3);
    const eDir = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const organs = new Int8Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Chaos positions (initial scattered state)
      cPos[i3]   = (Math.random()-0.5) * 8;
      cPos[i3+1] = (Math.random()-0.5) * 8;
      cPos[i3+2] = (Math.random()-0.5) * 2;

      // Explosion direction
      const ed = randomInSphere(0,0,0,1);
      eDir[i3] = ed[0]; eDir[i3+1] = ed[1]; eDir[i3+2] = ed[2];

      // Colors (teal default)
      col[i3] = 0; col[i3+1] = 0.83; col[i3+2] = 0.66;
      sz[i] = 1.0;

      // Human body position
      const g = generators[i];
      const hp = g.gen();
      hPos[i3] = hp[0]; hPos[i3+1] = hp[1]; hPos[i3+2] = hp[2];

      // Organ flags
      const org = g.organ;
      if (org === 'heart') organs[i] = 1;
      else if (org === 'llung' || org === 'rlung') organs[i] = 2;
      else if (org === 'brain') organs[i] = 4;
      else if (org) organs[i] = 3;
      else organs[i] = 0;

      // India map position
      if (i >= count - hotspotCount) {
        // Hotspot cluster
        const hsIdx = (i - (count - hotspotCount)) % hotspots.length;
        const hs = hotspots[hsIdx];
        const [mx, my] = mapGeoToScene(hs[0], hs[1]);
        iPos[i3]   = mx + (Math.random()-0.5)*0.08;
        iPos[i3+1] = my + (Math.random()-0.5)*0.08;
        iPos[i3+2] = (Math.random()-0.5)*0.06;
      } else {
        // Mix of outline and state borders
        const useStateBorder = Math.random() < 0.25 && stateBorders.length > 0;
        if (useStateBorder) {
          const seg = stateBorders[Math.floor(Math.random() * stateBorders.length)];
          const t = Math.random();
          const lon = seg[0] + t*(seg[2]-seg[0]);
          const lat = seg[1] + t*(seg[3]-seg[1]);
          const [mx, my] = mapGeoToScene(lon, lat);
          iPos[i3]   = mx + (Math.random()-0.5)*0.04;
          iPos[i3+1] = my + (Math.random()-0.5)*0.04;
          iPos[i3+2] = (Math.random()-0.5)*0.04;
        } else {
          // Country outline
          const idx = Math.floor(Math.random() * (indiaOutline.length - 1));
          const p1 = indiaOutline[idx], p2 = indiaOutline[idx + 1];
          const t = Math.random();
          const lon = p1[0]+t*(p2[0]-p1[0]), lat = p1[1]+t*(p2[1]-p1[1]);
          const [mx, my] = mapGeoToScene(lon, lat);
          iPos[i3]   = mx + (Math.random()-0.5)*0.06;
          iPos[i3+1] = my + (Math.random()-0.5)*0.06;
          iPos[i3+2] = (Math.random()-0.5)*0.04;
        }
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBuffers({
      chaosPos: cPos, humanPos: hPos, indiaPos: iPos,
      explosionDir: eDir, initColors: col, initSizes: sz,
      organFlags: organs
    });
  }, [count, hotspotCount]);

  const vertexShader = `
    attribute vec3 color;
    attribute float aSize;
    varying vec3 vColor;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = aSize * (18.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      float alpha = (0.5 - dist) * 2.0;
      alpha = alpha * alpha; // sharper falloff for cleaner particles
      gl_FragColor = vec4(vColor, alpha * 0.75);
    }
  `;

  useFrame((state) => {
    if (!geomRef.current || !buffers) return;
    const time = state.clock.elapsedTime;
    const progress = scrollProgress.current;
    const { chaosPos, humanPos, indiaPos, explosionDir, organFlags } = buffers;
    const positions = geomRef.current.attributes.position.array as Float32Array;
    const colors = geomRef.current.attributes.color.array as Float32Array;
    const sizes = geomRef.current.attributes.aSize.array as Float32Array;

    // Scanline during organ reveal
    const scanY = 1.8*0.85 - ((progress - 0.35) / 0.20) * 3.2;
    if (scanlineRef.current) {
      scanlineRef.current.position.y = scanY;
      scanlineRef.current.visible = progress > 0.35 && progress <= 0.55;
    }

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const organ = organFlags[i];

      // Target position & color
      let tx = chaosPos[i3] + Math.sin(time*0.4 + i*0.001)*0.6;
      let ty = chaosPos[i3+1] + Math.cos(time*0.4 + i*0.001)*0.6;
      let tz = chaosPos[i3+2];
      let r = 0, g = 0.83, b = 0.66;
      let sz = 1.0;

      if (progress > 0.05 && progress <= 0.35) {
        // Morph: chaos → human body
        let t = Math.min(1, Math.max(0, (progress - 0.05) / 0.30));
        const e = easeInOut(t);
        tx = mix(tx, humanPos[i3], e);
        ty = mix(ty, humanPos[i3+1], e);
        tz = mix(tz, humanPos[i3+2], e);
      } else if (progress > 0.35 && progress <= 0.55) {
        // Hold human + organ scan reveal
        tx = humanPos[i3]; ty = humanPos[i3+1]; tz = humanPos[i3+2];
        if (ty < scanY) {
          if (organ === 1) { r=1; g=0.26; b=0.4; sz = 1.8 + Math.sin(time*6)*0.5; } // heart pulse
          else if (organ === 2) { r=0.26; g=0.53; b=1; sz = 1.3; } // lungs
          else if (organ === 4) { r=0.6; g=0.4; b=1; sz = 1.3; } // brain
          else if (organ === 3) { r=1; g=0.84; b=0; sz = 1.1; } // other organs
          else { r=0; g=1; b=0.8; } // body glow
        }
      } else if (progress > 0.55 && progress <= 0.70) {
        // Explosion phase
        let t = Math.min(1, Math.max(0, (progress - 0.55) / 0.15));
        tx = humanPos[i3] + explosionDir[i3]*t*3.5;
        ty = humanPos[i3+1] + explosionDir[i3+1]*t*3.5;
        tz = humanPos[i3+2] + explosionDir[i3+2]*t*3.5;
        const fade = Math.sin(t * Math.PI);
        r = mix(r, 1, fade); g = mix(g, 1, fade); b = mix(b, 1, fade);
      } else if (progress > 0.70) {
        // Morph: explosion → India map
        let t = Math.min(1, Math.max(0, (progress - 0.70) / 0.20));
        const e = easeOut(t);
        const expX = humanPos[i3] + explosionDir[i3]*3.5;
        const expY = humanPos[i3+1] + explosionDir[i3+1]*3.5;
        const expZ = humanPos[i3+2] + explosionDir[i3+2]*3.5;
        tx = mix(expX, indiaPos[i3], e);
        ty = mix(expY, indiaPos[i3+1], e);
        tz = mix(expZ, indiaPos[i3+2], e);
        if (i >= count - hotspotCount) {
          r=1; g=0.26; b=0.26;
          sz = mix(1.0, 2.5, e);
        }
      }

      // Smooth interpolation
      positions[i3]   += (tx - positions[i3]) * 0.08;
      positions[i3+1] += (ty - positions[i3+1]) * 0.08;
      positions[i3+2] += (tz - positions[i3+2]) * 0.08;
      colors[i3]   += (r - colors[i3]) * 0.1;
      colors[i3+1] += (g - colors[i3+1]) * 0.1;
      colors[i3+2] += (b - colors[i3+2]) * 0.1;
      sizes[i] += (sz - sizes[i]) * 0.1;
    }

    geomRef.current.attributes.position.needsUpdate = true;
    geomRef.current.attributes.color.needsUpdate = true;
    geomRef.current.attributes.aSize.needsUpdate = true;
  });

  if (!buffers) return null;

  return (
    <group>
      <mesh ref={scanlineRef} visible={false}>
        <planeGeometry args={[4, 0.015]} />
        <meshBasicMaterial color="#00d4aa" transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <points ref={pointsRef}>
        <bufferGeometry ref={geomRef}>
          <bufferAttribute attach="attributes-position" count={count} array={buffers.chaosPos.slice()} itemSize={3} args={[buffers.chaosPos.slice(), 3]} />
          <bufferAttribute attach="attributes-color" count={count} array={buffers.initColors} itemSize={3} args={[buffers.initColors, 3]} />
          <bufferAttribute attach="attributes-aSize" count={count} array={buffers.initSizes} itemSize={1} args={[buffers.initSizes, 1]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
