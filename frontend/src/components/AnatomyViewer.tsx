"use client";

import { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */
export interface DiagnosisEntry {
  diagnosis: string;
  date: string;
  doctor: string | null;
  color: number;
}

interface AnatomyViewerProps {
  diagnosisMap: DiagnosisEntry[];
  autoHighlight?: boolean;
  onRegionClick?: (regionName: string) => void;
  hoveredRegion?: string | null;
}

/* ──────────────────────────────────────────────
   Diagnosis → Body Region Mapping
   ────────────────────────────────────────────── */
const DIAGNOSIS_TO_REGION: Record<string, string[]> = {
  dengue: ["head", "torso", "left_leg", "right_leg"],
  malaria: ["liver_spleen", "abdomen"],
  typhoid: ["abdomen", "liver_spleen"],
  hypertension: ["heart"],
  diabetes: ["pancreas", "abdomen"],
  pneumonia: ["left_lung", "right_lung"],
  tuberculosis: ["left_lung", "right_lung"],
  migraine: ["head"],
  "knee fracture": ["left_knee", "right_knee"],
  arthritis: ["left_knee", "right_knee", "left_arm", "right_arm"],
  anemia: ["heart", "torso"],
};

/* ──────────────────────────────────────────────
   Camera presets per region
   ────────────────────────────────────────────── */
const REGION_CAMERA: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
  head: { position: [0, 2.8, 3], target: [0, 2.2, 0] },
  heart: { position: [0.3, 1.2, 3], target: [0, 0.8, 0] },
  left_lung: { position: [-0.5, 1, 3], target: [-0.3, 0.7, 0] },
  right_lung: { position: [0.5, 1, 3], target: [0.3, 0.7, 0] },
  abdomen: { position: [0, 0.3, 3.5], target: [0, 0, 0] },
  liver_spleen: { position: [-0.3, 0.3, 3.5], target: [0, 0.1, 0] },
  pancreas: { position: [0.2, 0.2, 3.5], target: [0, 0, 0] },
  left_knee: { position: [-0.4, -1, 3], target: [-0.2, -1.2, 0] },
  right_knee: { position: [0.4, -1, 3], target: [0.2, -1.2, 0] },
  left_arm: { position: [-1.5, 0.8, 3], target: [-0.6, 0.5, 0] },
  right_arm: { position: [1.5, 0.8, 3], target: [0.6, 0.5, 0] },
  torso: { position: [0, 0.9, 4], target: [0, 0.6, 0] },
  left_leg: { position: [-0.4, -1.5, 3], target: [-0.2, -1.5, 0] },
  right_leg: { position: [0.4, -1.5, 3], target: [0.2, -1.5, 0] },
};

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */
export default function AnatomyViewer({
  diagnosisMap,
  autoHighlight = true,
  onRegionClick,
  hoveredRegion,
}: AnatomyViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    bodyParts: Record<string, THREE.Mesh>;
    animationIds: number[];
    rafId: number;
  } | null>(null);

  /* Build a body-material */
  const makeMat = useCallback(
    () =>
      new THREE.MeshPhongMaterial({
        color: 0xe8c4a0,
        emissive: 0x000000,
        emissiveIntensity: 0,
        transparent: true,
        opacity: 0.92,
        shininess: 30,
      }),
    []
  );

  /* ── Init Three.js scene once ── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    /* Renderer */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x03050f);
    container.appendChild(renderer.domElement);

    /* Scene */
    const scene = new THREE.Scene();

    /* Camera */
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 1, 5);

    /* Lighting — 3‑point medical rig */
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(2, 3, 2);
    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.4);
    fillLight.position.set(-2, 0, 2);
    const rimLight = new THREE.DirectionalLight(0x00ffcc, 0.3);
    rimLight.position.set(0, -1, -3);
    const ambient = new THREE.AmbientLight(0x222244, 0.4);
    scene.add(keyLight, fillLight, rimLight, ambient);

    /* Controls */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2;
    controls.maxDistance = 12;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.addEventListener("start", () => {
      controls.autoRotate = false;
    });

    /* ── Build body from primitives ── */
    const bodyParts: Record<string, THREE.Mesh> = {};

    const parts: { name: string; geo: THREE.BufferGeometry; pos: [number, number, number]; rot?: [number, number, number] }[] = [
      { name: "head", geo: new THREE.SphereGeometry(0.35, 16, 16), pos: [0, 2.3, 0] },
      { name: "neck", geo: new THREE.CylinderGeometry(0.1, 0.12, 0.3, 12), pos: [0, 1.9, 0] },
      { name: "torso", geo: new THREE.BoxGeometry(0.9, 1.2, 0.45), pos: [0, 1.05, 0] },
      { name: "left_lung", geo: new THREE.SphereGeometry(0.22, 12, 12), pos: [-0.22, 1.2, 0.05] },
      { name: "right_lung", geo: new THREE.SphereGeometry(0.22, 12, 12), pos: [0.22, 1.2, 0.05] },
      { name: "heart", geo: new THREE.SphereGeometry(0.14, 12, 12), pos: [0.05, 1.0, 0.12] },
      { name: "abdomen", geo: new THREE.CylinderGeometry(0.38, 0.35, 0.5, 12), pos: [0, 0.2, 0] },
      { name: "liver_spleen", geo: new THREE.SphereGeometry(0.18, 12, 12), pos: [-0.2, 0.35, 0.08] },
      { name: "pancreas", geo: new THREE.CapsuleGeometry(0.06, 0.2, 8, 8), pos: [0.12, 0.25, 0.08], rot: [0, 0, Math.PI / 6] },
      { name: "left_arm", geo: new THREE.CylinderGeometry(0.09, 0.09, 0.8, 8), pos: [-0.62, 1.1, 0], rot: [0, 0, 0.25] },
      { name: "right_arm", geo: new THREE.CylinderGeometry(0.09, 0.09, 0.8, 8), pos: [0.62, 1.1, 0], rot: [0, 0, -0.25] },
      { name: "left_leg", geo: new THREE.CylinderGeometry(0.12, 0.1, 1.0, 8), pos: [-0.22, -0.75, 0] },
      { name: "right_leg", geo: new THREE.CylinderGeometry(0.12, 0.1, 1.0, 8), pos: [0.22, -0.75, 0] },
      { name: "left_knee", geo: new THREE.SphereGeometry(0.12, 12, 12), pos: [-0.22, -1.3, 0] },
      { name: "right_knee", geo: new THREE.SphereGeometry(0.12, 12, 12), pos: [0.22, -1.3, 0] },
    ];

    parts.forEach(({ name, geo, pos, rot }) => {
      const mesh = new THREE.Mesh(geo, makeMat());
      mesh.position.set(...pos);
      if (rot) mesh.rotation.set(...rot);
      mesh.userData.regionName = name;
      bodyParts[name] = mesh;
      scene.add(mesh);
    });

    /* Click raycaster */
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(Object.values(bodyParts));
      if (hits.length > 0) {
        const name = hits[0].object.userData.regionName as string;
        onRegionClick?.(name);
      }
    };
    renderer.domElement.addEventListener("click", onClick);

    /* Render loop */
    const animationIds: number[] = [];
    const animate = () => {
      const id = requestAnimationFrame(animate);
      animationIds.push(id);
      controls.update();
      renderer.render(scene, camera);
    };
    const rafId = requestAnimationFrame(animate);

    /* Resize */
    const onResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    sceneRef.current = { renderer, scene, camera, controls, bodyParts, animationIds, rafId };

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("click", onClick);
      cancelAnimationFrame(rafId);
      animationIds.forEach(cancelAnimationFrame);
      controls.dispose();
      renderer.dispose();
      Object.values(bodyParts).forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Apply diagnosis highlights ── */
  useEffect(() => {
    const s = sceneRef.current;
    if (!s || !autoHighlight) return;

    const { bodyParts } = s;

    // Reset all
    Object.values(bodyParts).forEach((mesh) => {
      const mat = mesh.material as THREE.MeshPhongMaterial;
      mat.emissive.setHex(0x000000);
      mat.emissiveIntensity = 0;
    });

    if (!diagnosisMap || diagnosisMap.length === 0) return;

    // Apply each diagnosis with staggered delay
    const timers: ReturnType<typeof setTimeout>[] = [];
    diagnosisMap.forEach((entry, i) => {
      const tid = setTimeout(() => {
        const regions = DIAGNOSIS_TO_REGION[entry.diagnosis.toLowerCase()] || [];
        regions.forEach((region) => {
          const mesh = bodyParts[region];
          if (!mesh) return;
          const mat = mesh.material as THREE.MeshPhongMaterial;
          mat.emissive.setHex(entry.color);

          // Pulsing animation
          let t = 0;
          const pulse = () => {
            t += 0.03;
            mat.emissiveIntensity = 0.3 + Math.sin(t) * 0.3;
            requestAnimationFrame(pulse);
          };
          pulse();
        });
      }, i * 400);
      timers.push(tid);
    });

    // Auto-focus on first diagnosis
    const firstTimeout = setTimeout(() => {
      if (diagnosisMap.length > 0) {
        const firstRegions = DIAGNOSIS_TO_REGION[diagnosisMap[0].diagnosis.toLowerCase()];
        if (firstRegions && firstRegions.length > 0) {
          smoothCameraFocusOn(firstRegions[0]);
        }
      }
    }, diagnosisMap.length * 400 + 200);
    timers.push(firstTimeout);

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagnosisMap, autoHighlight]);

  /* ── Hovered region flash ── */
  useEffect(() => {
    const s = sceneRef.current;
    if (!s || !hoveredRegion) return;

    const mesh = s.bodyParts[hoveredRegion];
    if (!mesh) return;

    const mat = mesh.material as THREE.MeshPhongMaterial;
    const origIntensity = mat.emissiveIntensity;
    mat.emissiveIntensity = 1;
    smoothCameraFocusOn(hoveredRegion);

    const timer = setTimeout(() => {
      mat.emissiveIntensity = origIntensity;
    }, 1500);

    return () => clearTimeout(timer);
  }, [hoveredRegion]);

  /* Camera focus helper */
  const smoothCameraFocusOn = (regionName: string) => {
    const s = sceneRef.current;
    if (!s) return;
    const cam = REGION_CAMERA[regionName];
    if (!cam) return;

    const { camera, controls } = s;
    const startPos = camera.position.clone();
    const endPos = new THREE.Vector3(...cam.position);
    const startTarget = controls.target.clone();
    const endTarget = new THREE.Vector3(...cam.target);

    let elapsed = 0;
    const duration = 1400;

    const tween = () => {
      elapsed += 16;
      const t = Math.min(elapsed / duration, 1);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      camera.position.lerpVectors(startPos, endPos, ease);
      controls.target.lerpVectors(startTarget, endTarget, ease);
      controls.update();

      if (t < 1) requestAnimationFrame(tween);
    };
    tween();
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px]"
      style={{ cursor: "crosshair" }}
    />
  );
}
