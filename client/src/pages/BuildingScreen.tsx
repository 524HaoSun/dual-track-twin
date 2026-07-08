/*
 * BuildingScreen — Interactive 3D Building
 * Exterior view (default) + Interior cutaway view
 * Built with react-three-fiber + @react-three/drei
 * All geometry procedural — no external 3D assets
 *
 * v2: Vivid lighting, warm concrete palette, interior 3D mini-window
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useNav } from '@/contexts/NavContext';

// Expose reset function so AppShell R-key can call it
let _buildingResetFn: (() => void) | null = null;
export function resetBuildingScreen() { _buildingResetFn?.(); }

// ── Types ─────────────────────────────────────────────────────────────────────
interface SensorNode {
  id: string;
  position: [number, number, number];
  type: string;
  infers: string;
  floor: number;
}

// ── Sensor data (conceptual placement only) ───────────────────────────────────
const SENSORS: SensorNode[] = [
  // Floor 1 — wall-mounted (back wall Z=-3.9, left wall X=-6.9, right wall X=6.9)
  { id: 's1', position: [-3.5, 2.2, -3.9], type: 'CO₂ sensor',              infers: 'infers occupancy',      floor: 1 },
  { id: 's2', position: [-6.9, 1.8,  0.0], type: 'Temperature + humidity',  infers: 'thermal comfort',       floor: 1 },
  { id: 's3', position: [ 6.9, 1.5, -2.0], type: 'Sub-meter / current clamp', infers: 'disaggregated loads', floor: 1 },
  { id: 's6', position: [ 5.0, 2.2, -3.9], type: 'Temperature + humidity',  infers: 'thermal comfort',       floor: 1 },
  // Floor 2 — ceiling-mounted (Y=7.85) and back wall (Z=-3.9)
  { id: 's4', position: [-3.5, 7.85, -2.0], type: 'PIR / presence',         infers: 'schedule validation',   floor: 2 },
  { id: 's5', position: [ 1.0, 5.8,  -3.9], type: 'CO₂ sensor',             infers: 'infers occupancy',      floor: 2 },
  { id: 's7', position: [ 6.9, 5.5,   0.0], type: 'Sub-meter / current clamp', infers: 'disaggregated loads', floor: 2 },
];

// ── Colour palette — warm concrete + cyan accent ──────────────────────────────
const C = {
  // Exterior
  wall:       '#4A5568',   // medium slate — clearly visible
  wallLight:  '#5A6880',   // lighter band
  wallDark:   '#374151',   // shadow side
  roof:       '#2D3748',   // dark slate roof
  concrete:   '#6B7280',   // light concrete trim
  // Windows — warm amber glow (school lights on)
  window:     '#FCD34D',
  windowGlow: '#F59E0B',
  // Ground
  ground:     '#1F2937',
  groundLine: '#374151',
  // Interior
  floor1:     '#374151',
  floor2:     '#2D3748',
  classroom:  '#4B5563',
  // Sensor
  sensor:     '#0EA5E9',
  // Accent
  amber:      '#F59E0B',
  cyan:       '#0EA5E9',
};

// ── Window helper — warm amber glow ──────────────────────────────────────────
function WindowPane({ position, width = 0.28, height = 0.22, rotation }: {
  position: [number, number, number];
  width?: number;
  height?: number;
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation ?? [0, 0, 0]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        color={C.window}
        emissive={C.windowGlow}
        emissiveIntensity={1.2}
        transparent
        opacity={0.9}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ── Revit-style school building — detailed exterior ──────────────────────────
function ExteriorBuilding({ autoRotate }: { autoRotate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) groupRef.current.rotation.y += delta * 0.08;
  });

  // Shared materials
  const wallMat = <meshPhysicalMaterial color="#4E5E6E" roughness={0.45} metalness={0.12} envMapIntensity={0.8} />;
  const concreteMat = <meshStandardMaterial color="#6E7E8E" roughness={0.55} metalness={0.05} />;
  const roofMat = <meshStandardMaterial color="#2E3A4A" roughness={0.55} metalness={0.12} />;
  const glassMat = (
    <meshPhysicalMaterial
      color="#B8DCF8" transparent opacity={0.45}
      roughness={0.02} metalness={0.0}
      envMapIntensity={4.0} transmission={0.55} ior={1.52} reflectivity={0.98}
      thickness={0.5}
    />
  );
  const frameColor = "#8A9AB0";
  const accentColor = "#2D4A6A";

  // Helper: curtain wall bay (vertical mullions + horizontal transoms + glass)
  const curtainWallBay = (x: number, y: number, z: number, w: number, h: number, rot: number, key: string) => (
    <group key={key} position={[x, y, z]} rotation={[0, rot, 0]}>
      {/* Glass fill */}
      <mesh>
        <boxGeometry args={[w - 0.08, h - 0.08, 0.04]} />
        {glassMat}
      </mesh>
      {/* Vertical mullions */}
      {[-w/2, 0, w/2].map((mx, i) => (
        <mesh key={i} position={[mx, 0, 0.025]}>
          <boxGeometry args={[0.06, h, 0.06]} />
          <meshStandardMaterial color={frameColor} roughness={0.25} metalness={0.75} />
        </mesh>
      ))}
      {/* Horizontal transoms */}
      {[-h/3, 0, h/3].map((my, i) => (
        <mesh key={i} position={[0, my, 0.025]}>
          <boxGeometry args={[w, 0.05, 0.05]} />
          <meshStandardMaterial color={frameColor} roughness={0.25} metalness={0.75} />
        </mesh>
      ))}
      {/* Interior warm glow */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[w - 0.15, h - 0.15, 0.02]} />
        <meshStandardMaterial color="#FFF3C4" emissive="#F59E0B" emissiveIntensity={0.6} roughness={1.0} />
      </mesh>
    </group>
  );

  // Helper: horizontal sunshade blade
  const sunshade = (x: number, y: number, z: number, w: number, depth: number, rot: number, key: string) => (
    <group key={key} position={[x, y, z]} rotation={[0, rot, 0]}>
      <mesh>
        <boxGeometry args={[w, 0.06, depth]} />
        <meshStandardMaterial color="#6A7A8A" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Support brackets */}
      {[-w/2 + 0.3, w/2 - 0.3].map((bx, i) => (
        <mesh key={i} position={[bx, -0.15, -depth/2 + 0.05]}>
          <boxGeometry args={[0.05, 0.3, 0.05]} />
          <meshStandardMaterial color="#5A6A7A" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
    </group>
  );

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* ── GROUND PLANE — dark polished stone ──────────────────────────── */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[60, 0.1, 50]} />
        <meshPhysicalMaterial
          color="#141C28" roughness={0.18} metalness={0.08}
          envMapIntensity={2.5} reflectivity={0.85}
        />
      </mesh>
      {/* Subtle paving joints — thin dark lines */}
      {Array.from({ length: 14 }, (_, i) => i - 7).map(xi => (
        <mesh key={`px${xi}`} position={[xi * 3.0, 0.02, 0]}>
          <boxGeometry args={[0.025, 0.01, 50]} />
          <meshStandardMaterial color="#0A1018" roughness={0.95} />
        </mesh>
      ))}
      {Array.from({ length: 10 }, (_, i) => i - 5).map(zi => (
        <mesh key={`pz${zi}`} position={[0, 0.02, zi * 3.0]}>
          <boxGeometry args={[60, 0.01, 0.025]} />
          <meshStandardMaterial color="#0A1018" roughness={0.95} />
        </mesh>
      ))}

      {/* ── MAIN BUILDING BLOCK ──────────────────────────────────────────── */}
      {/* Core concrete structure */}
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 5.0, 6]} />
        {wallMat}
      </mesh>
      {/* Floor 2 band */}
      <mesh position={[0, 4.5, 0]} castShadow>
        <boxGeometry args={[10.2, 0.25, 6.2]} />
        {concreteMat}
      </mesh>
      {/* Roof parapet */}
      <mesh position={[0, 5.15, 0]}>
        <boxGeometry args={[10.2, 0.3, 6.2]} />
        {roofMat}
      </mesh>
      {/* Roof slab */}
      <mesh position={[0, 5.28, 0]}>
        <boxGeometry args={[10.0, 0.08, 6.0]} />
        {roofMat}
      </mesh>
      {/* Ground floor plinth */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[10.4, 0.2, 6.4]} />
        {concreteMat}
      </mesh>

      {/* ── WING B (rear right) ───────────────────────────────────────────── */}
      <mesh position={[5.5, 1.8, -4.0]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 3.6, 2.5]} />
        {wallMat}
      </mesh>
      <mesh position={[5.5, 3.7, -4.0]}>
        <boxGeometry args={[4.6, 0.2, 2.6]} />
        {roofMat}
      </mesh>
      {/* Wing B windows */}
      {[-0.8, 0.8].map((z, i) => curtainWallBay(3.3, 1.8, z - 4.0, 0.9, 1.6, Math.PI / 2, `wb${i}`))}

      {/* ── FRONT FACADE — CURTAIN WALL ──────────────────────────────────── */}
      {/* Floor 1 bays */}
      {[-3.5, -1.5, 0.5, 2.5].map((x, i) => curtainWallBay(x, 1.5, 3.01, 1.6, 2.4, 0, `f1cw${i}`))}
      {/* Floor 2 bays */}
      {[-3.5, -1.5, 0.5, 2.5].map((x, i) => curtainWallBay(x, 4.0, 3.01, 1.6, 2.0, 0, `f2cw${i}`))}
      {/* Sunshades above floor 2 windows */}
      {[-3.5, -1.5, 0.5, 2.5].map((x, i) => sunshade(x, 5.1, 3.3, 1.7, 0.5, 0, `ss${i}`))}

      {/* ── SIDE FACADE (right) — punched windows ────────────────────────── */}
      {[1.2, 3.6].map((y, row) =>
        [-1.5, 0.5].map((z, col) => (
          <group key={`sw${row}${col}`} position={[5.01, y, z]}>
            <mesh>
              <boxGeometry args={[0.04, 1.2, 1.0]} />
              {glassMat}
            </mesh>
            {/* Window frame */}
            <mesh>
              <boxGeometry args={[0.06, 1.3, 1.1]} />
              <meshStandardMaterial color={frameColor} roughness={0.3} metalness={0.6} />
            </mesh>
            {/* Sunshade above */}
            <mesh position={[0.2, 0.72, 0]}>
              <boxGeometry args={[0.4, 0.05, 1.1]} />
              <meshStandardMaterial color="#6A7A8A" roughness={0.4} metalness={0.5} />
            </mesh>
          </group>
        ))
      )}

      {/* ── ENTRANCE CANOPY ──────────────────────────────────────────────── */}
      {/* Canopy slab */}
      <mesh position={[0, 3.2, 4.8]} castShadow>
        <boxGeometry args={[5.0, 0.12, 1.8]} />
        <meshStandardMaterial color="#4A5568" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Canopy soffit (lighter underside) */}
      <mesh position={[0, 3.14, 4.8]}>
        <boxGeometry args={[4.9, 0.02, 1.75]} />
        <meshStandardMaterial color="#FFFDE7" emissive="#FFF8E1" emissiveIntensity={0.4} roughness={0.1} />
      </mesh>
      {/* Canopy steel columns */}
      {[-1.8, 1.8].map((x, i) => (
        <mesh key={i} position={[x, 1.6, 5.5]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 3.2, 12]} />
          <meshStandardMaterial color="#8A9AB0" roughness={0.2} metalness={0.85} />
        </mesh>
      ))}
      {/* Entrance glass doors */}
      {[-0.55, 0.55].map((x, i) => (
        <group key={i} position={[x, 1.3, 3.02]}>
          <mesh>
            <boxGeometry args={[0.9, 2.4, 0.04]} />
            {glassMat}
          </mesh>
          {/* Door handle */}
          <mesh position={[x > 0 ? -0.38 : 0.38, 0, 0.04]}>
            <cylinderGeometry args={[0.025, 0.025, 0.4, 8]} />
            <meshStandardMaterial color="#C0C8D8" roughness={0.1} metalness={0.95} />
          </mesh>
        </group>
      ))}
      {/* Entrance steps */}
      {[0, 1, 2].map(i => (
        <mesh key={i} position={[0, i * 0.18 + 0.09, 4.2 - i * 0.3]} receiveShadow>
          <boxGeometry args={[4.0, 0.18, 0.3]} />
          {concreteMat}
        </mesh>
      ))}

      {/* ── STRUCTURAL COLUMNS (facade) ──────────────────────────────────── */}
      {[-4.5, -1.5, 1.5, 4.5].map((x, i) => (
        <mesh key={i} position={[x, 2.65, 3.05]} castShadow>
          <boxGeometry args={[0.22, 5.2, 0.22]} />
          <meshStandardMaterial color={accentColor} roughness={0.4} metalness={0.15} />
        </mesh>
      ))}

      {/* ── ROOF EQUIPMENT ───────────────────────────────────────────────── */}
      {/* HVAC unit */}
      <mesh position={[-2.5, 5.65, -0.5]} castShadow>
        <boxGeometry args={[2.0, 0.7, 1.5]} />
        <meshStandardMaterial color="#4A5568" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[-2.5, 5.65, -0.5]}>
        <boxGeometry args={[1.9, 0.6, 1.4]} />
        <meshStandardMaterial color="#3A4455" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* HVAC fan grille */}
      <mesh position={[-2.5, 6.02, -0.5]}>
        <cylinderGeometry args={[0.55, 0.55, 0.05, 16]} />
        <meshStandardMaterial color="#5A6A7A" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Solar panels - set back from the parapet and tilted toward the entrance / south-facing facade */}
      {[
        [0.65, 0.15],
        [1.95, 0.15],
        [3.25, 0.15],
        [0.65, 1.05],
        [1.95, 1.05],
        [3.25, 1.05],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* Vertical ballast legs: taller on the north edge, shorter on the front/south edge */}
          {[-0.42, 0.42].map(px => (
            <React.Fragment key={px}>
              <mesh position={[px, 5.46, -0.28]} castShadow>
                <boxGeometry args={[0.05, 0.28, 0.05]} />
                <meshStandardMaterial color="#7A8798" roughness={0.35} metalness={0.65} />
              </mesh>
              <mesh position={[px, 5.39, 0.28]} castShadow>
                <boxGeometry args={[0.05, 0.14, 0.05]} />
                <meshStandardMaterial color="#7A8798" roughness={0.35} metalness={0.65} />
              </mesh>
            </React.Fragment>
          ))}
          <group position={[0, 5.52, 0]} rotation={[0.23, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[1.12, 0.04, 0.64]} />
              <meshStandardMaterial color="#10213F" roughness={0.18} metalness={0.45} />
            </mesh>
            {/* Aluminium frame */}
            {[-0.58, 0.58].map(fx => (
              <mesh key={`fx${fx}`} position={[fx, 0.035, 0]}>
                <boxGeometry args={[0.035, 0.018, 0.70]} />
                <meshStandardMaterial color="#8A9AB0" roughness={0.25} metalness={0.8} />
              </mesh>
            ))}
            {[-0.34, 0, 0.34].map(fz => (
              <mesh key={`fz${fz}`} position={[0, 0.038, fz]}>
                <boxGeometry args={[1.16, 0.018, 0.025]} />
                <meshStandardMaterial color="#8A9AB0" roughness={0.25} metalness={0.8} />
              </mesh>
            ))}
            {/* Panel cells */}
            {[-0.16, 0.16].map(rowZ => [-0.36, 0, 0.36].map(colX => (
              <mesh key={`${rowZ}${colX}`} position={[colX, 0.05, rowZ]}>
                <boxGeometry args={[0.32, 0.012, 0.26]} />
                <meshStandardMaterial color="#1E3A6A" roughness={0.1} metalness={0.5} emissive="#0A1A3A" emissiveIntensity={0.3} />
              </mesh>
            )))}
          </group>
        </group>
      ))}
      {/* Roof drainage pipes — run from roof parapet down to plinth */}
      {[-4.5, 4.5].map((x, i) => (
        <mesh key={i} position={[x, 2.75, 3.08]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 5.5, 8]} />
          <meshStandardMaterial color="#5A6A7A" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}

      {/* ── BUILDING SIGNAGE ─────────────────────────────────────────────── */}
      {/* Sign panel */}
      <mesh position={[0, 4.2, 3.06]}>
        <boxGeometry args={[3.5, 0.45, 0.06]} />
        <meshStandardMaterial color="#1A2A3A" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Sign text bars (simulated) */}
      {[-0.8, 0.0, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 4.2, 3.1]}>
          <boxGeometry args={[0.6, 0.06, 0.01]} />
          <meshStandardMaterial color="#22D3EE" emissive="#22D3EE" emissiveIntensity={1.5} roughness={0.1} />
        </mesh>
      ))}

      {/* ── LANDSCAPE ────────────────────────────────────────────────────── */}


      {/* ── LIGHTING ─────────────────────────────────────────────────────── */}
      {/* Facade uplights */}
      {[-4, -1.5, 1.5, 4].map((x, i) => (
        <pointLight key={i} position={[x, 0.5, 3.5]} intensity={0.8} color="#FFF8E1" distance={4} />
      ))}
      {/* Entrance canopy light */}
      <pointLight position={[0, 3.0, 4.8]} intensity={1.2} color="#FFF3C4" distance={5} />
    </group>
  );
}

// ── Interior cutaway model — large-scale school ─────────────────────────────
// Scale: 1 unit ≈ 1m. Building footprint ~14m × 8m, 2 floors at 4m each.
function InteriorBuilding({ autoRotate, onSensorHover, onSensorClick, activeFloor, onFurnitureHover }: {
  autoRotate: boolean;
  onSensorHover: (id: string | null, screenPos?: { x: number; y: number }) => void;
  onSensorClick: (id: string | null, screenPos?: { x: number; y: number }) => void;
  activeFloor: 1 | 2;
  onFurnitureHover?: (label: string | null, screenPos?: { x: number; y: number }) => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const { gl } = useThree();

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06;
    }
  });

  // Hover handler factory for furniture
  const makeHover = (label: string) => ({
    onPointerEnter: (e: any) => {
      e.stopPropagation();
      const rect = gl.domElement.getBoundingClientRect();
      onFurnitureHover?.(label, { x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    onPointerMove: (e: any) => {
      const rect = gl.domElement.getBoundingClientRect();
      onFurnitureHover?.(label, { x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    onPointerLeave: () => onFurnitureHover?.(null),
  });

  // 3×3 desk grid helper — floorY is the absolute Y of the floor slab top surface
  const deskGrid = (ox: number, floorY: number, oz: number, color: string) => {
    const desks: React.ReactElement[] = [];
    // Absolute heights from floor surface
    const legH = 0.72;          // desk leg height
    const deskThick = 0.06;     // desk surface thickness
    const deskTopY = floorY + legH + deskThick / 2;  // desk surface center
    const legCenterY = floorY + legH / 2;             // leg cylinder center
    const chairSeatH = 0.44;    // chair seat height from floor
    const chairSeatCY = floorY + chairSeatH + 0.03;  // chair seat center
    const chairLegCY = floorY + chairSeatH / 2;      // chair leg center
    const chairBackCY = floorY + chairSeatH + 0.22;  // chair back center

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = ox + col * 1.4;
        const z = oz + row * 1.6;
        desks.push(
          <group key={`${ox}${floorY}${row}${col}`} position={[x, 0, z]}>
            {/* Desk surface */}
            <mesh castShadow receiveShadow position={[0, deskTopY, 0]} {...makeHover(`Desk · ~12 W standby`)}>
              <boxGeometry args={[1.0, deskThick, 0.65]} />
              <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
            </mesh>
            {/* Desk legs — 4 corners */}
            {([-0.42, -0.42, 0.42, 0.42] as number[]).map((lx, li) => {
              const lz = [-0.28, 0.28, -0.28, 0.28][li];
              return (
                <mesh key={li} position={[lx, legCenterY, lz]} castShadow>
                  <cylinderGeometry args={[0.03, 0.03, legH, 8]} />
                  <meshStandardMaterial color="#8A9AB0" roughness={0.2} metalness={0.8} />
                </mesh>
              );
            })}
            {/* Chair seat */}
            <mesh position={[0, chairSeatCY, 0.72]} castShadow {...makeHover(`Chair · ergonomic`)}>
              <boxGeometry args={[0.62, 0.06, 0.55]} />
              <meshStandardMaterial color="#2A4A5A" roughness={0.55} />
            </mesh>
            {/* Chair back */}
            <mesh position={[0, chairBackCY, 1.0]} castShadow>
              <boxGeometry args={[0.62, 0.40, 0.06]} />
              <meshStandardMaterial color="#2A4A5A" roughness={0.55} />
            </mesh>
            {/* Chair legs — 4 corners */}
            {([-0.26, -0.26, 0.26, 0.26] as number[]).map((lx, li) => {
              const lz = [0.5, 0.95, 0.5, 0.95][li];
              return (
                <mesh key={li} position={[lx, chairLegCY, lz]}>
                  <cylinderGeometry args={[0.025, 0.025, chairSeatH, 8]} />
                  <meshStandardMaterial color="#6A7A8A" roughness={0.2} metalness={0.8} />
                </mesh>
              );
            })}
          </group>
        );
      }
    }
    return desks;
  };

  return (
    <group ref={groupRef} position={[0, 0, 0]}>

      {/* ── GROUND — same dark polished stone as exterior ─────────────────── */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[60, 0.1, 50]} />
        <meshPhysicalMaterial
          color="#141C28" roughness={0.18} metalness={0.08}
          envMapIntensity={2.5} reflectivity={0.85}
        />
      </mesh>
      {/* Subtle paving joints matching exterior */}
      {Array.from({ length: 14 }, (_, i) => i - 7).map(xi => (
        <mesh key={`igx${xi}`} position={[xi * 3.0, 0.02, 0]}>
          <boxGeometry args={[0.025, 0.01, 50]} />
          <meshStandardMaterial color="#0A1018" roughness={0.95} />
        </mesh>
      ))}
      {Array.from({ length: 10 }, (_, i) => i - 5).map(zi => (
        <mesh key={`igz${zi}`} position={[0, 0.02, zi * 3.0]}>
          <boxGeometry args={[60, 0.01, 0.025]} />
          <meshStandardMaterial color="#0A1018" roughness={0.95} />
        </mesh>
      ))}

      {/* ── FLOOR 1 SLAB ─────────────────────────────────────────────────── */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[14, 0.15, 8]} />
        <meshPhysicalMaterial
          color="#C8B898" roughness={0.08} metalness={0.02}
          envMapIntensity={1.2} reflectivity={0.55}
        />
      </mesh>
      {/* Floor tile grid lines */}
      {Array.from({ length: 8 }, (_, i) => i - 3.5).map(x => (
        <mesh key={`fgx${x}`} position={[x * 1.6, 0.08, 0]}>
          <boxGeometry args={[0.02, 0.01, 8]} />
          <meshStandardMaterial color="#B8A88A" roughness={0.9} />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => i - 2.5).map(z => (
        <mesh key={`fgz${z}`} position={[0, 0.08, z * 1.4]}>
          <boxGeometry args={[14, 0.01, 0.02]} />
          <meshStandardMaterial color="#B8A88A" roughness={0.9} />
        </mesh>
      ))}

      {/* ── BIM FLOOR PLAN PROJECTION ───────────────────────────────────── */}
      {/* Outer building footprint outline */}
      {[
        { pos: [0, 0.09, -4.0] as [number,number,number], args: [14.0, 0.01, 0.025] as [number,number,number] },
        { pos: [0, 0.09,  4.0] as [number,number,number], args: [14.0, 0.01, 0.025] as [number,number,number] },
        { pos: [-7.0, 0.09, 0] as [number,number,number], args: [0.025, 0.01, 8.0] as [number,number,number] },
        { pos: [ 7.0, 0.09, 0] as [number,number,number], args: [0.025, 0.01, 8.0] as [number,number,number] },
      ].map(({ pos, args }, i) => (
        <mesh key={`bim_outer${i}`} position={pos}>
          <boxGeometry args={args} />
          <meshStandardMaterial color="#FFFFFF" transparent opacity={0.18} roughness={1} />
        </mesh>
      ))}
      {/* Corridor divider line */}
      <mesh position={[1.5, 0.09, 0]}>
        <boxGeometry args={[0.025, 0.01, 8.0]} />
        <meshStandardMaterial color="#22D3EE" transparent opacity={0.12} roughness={1} />
      </mesh>
      {/* Room labels — thin cross-hatch markers at classroom centres */}
      {[
        { pos: [-3.5, 0.09, -1.0] as [number,number,number] },
        { pos: [ 5.2, 0.09, -1.0] as [number,number,number] },
      ].map(({ pos }, i) => (
        <group key={`bim_mark${i}`} position={pos}>
          <mesh>
            <boxGeometry args={[1.2, 0.01, 0.02]} />
            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.08} roughness={1} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.02, 0.01, 1.2]} />
            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.08} roughness={1} />
          </mesh>
        </group>
      ))}

      {/* ── FLOOR 2 SLAB ─────────────────────────────────────────────────── */}
      <mesh position={[0, 4.0, 0]}>
        <boxGeometry args={[14, 0.15, 8]} />
        <meshPhysicalMaterial
          color="#BEB098" roughness={0.08} metalness={0.02}
          envMapIntensity={1.2} reflectivity={0.55}
        />
      </mesh>

      {/* ── CEILING ──────────────────────────────────────────────────────── */}
      <mesh position={[0, 8.0, 0]}>
        <boxGeometry args={[14, 0.2, 8]} />
        <meshStandardMaterial color="#F0EAE0" roughness={0.75} />
      </mesh>

      {/* ── WALLS ────────────────────────────────────────────────────────── */}
      {/* Back wall */}
      <mesh position={[0, 4.0, -4.0]} receiveShadow castShadow>
        <boxGeometry args={[14, 8.2, 0.2]} />
        <meshStandardMaterial color="#D4C8B8" roughness={0.55} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-7.0, 4.0, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 8.2, 8]} />
        <meshStandardMaterial color="#C8BDB0" roughness={0.55} />
      </mesh>
      {/* Right wall */}
      <mesh position={[7.0, 4.0, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 8.2, 8]} />
        <meshStandardMaterial color="#C8BDB0" roughness={0.55} />
      </mesh>
      {/* Front wall — semi-transparent glass so interior is visible without rotating */}
      <mesh position={[0, 4.0, 4.0]} renderOrder={1}>
        <boxGeometry args={[14, 8.2, 0.12]} />
        <meshStandardMaterial
          color="#A8C8E8" transparent opacity={0.08}
          roughness={0.0} metalness={0.05}
          depthWrite={false} side={THREE.FrontSide}
        />
      </mesh>
      {/* Front top beam */}
      <mesh position={[0, 8.1, 4.0]}>
        <boxGeometry args={[14, 0.2, 0.2]} />
        <meshStandardMaterial color="#A8A098" roughness={0.7} />
      </mesh>

      {/* ── CORRIDOR DIVIDER (floor 1) ────────────────────────────────────── */}
      {/* Corridor wall with glass panels */}
      <mesh position={[1.5, 2.0, 0]}>
        <boxGeometry args={[0.15, 4.0, 8]} />
        <meshStandardMaterial color="#8A9AB0" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Glass panels in corridor wall */}
      {[-2.5, -0.8, 0.8, 2.5].map((z, i) => (
        <mesh key={`cgp${i}`} position={[1.52, 2.2, z]}>
          <boxGeometry args={[0.08, 2.4, 1.0]} />
          <meshPhysicalMaterial
            color="#90C8F0" transparent opacity={0.28}
            roughness={0.0} metalness={0.02}
            envMapIntensity={2.5} transmission={0.65} ior={1.5}
          />
        </mesh>
      ))}

      {/* ── CLASSROOM A (floor 1, left) ───────────────────────────────────── */}
      {/* Blackboard */}
      <mesh position={[-3.5, 2.2, -3.85]} castShadow {...makeHover(`Blackboard · display ~45 W`)}>
        <boxGeometry args={[5.0, 1.8, 0.08]} />
        <meshStandardMaterial color="#1B3A2A" roughness={0.75} />
      </mesh>
      <mesh position={[-3.5, 2.2, -3.82]}>
        <boxGeometry args={[5.1, 1.9, 0.04]} />
        <meshStandardMaterial color="#4A5568" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Chalk writing glow */}
      <mesh position={[-3.5, 2.3, -3.80]}>
        <boxGeometry args={[3.2, 0.18, 0.02]} />
        <meshStandardMaterial color="#E0F0FF" emissive="#B0D8FF" emissiveIntensity={2.0} roughness={0.1} />
      </mesh>
      <mesh position={[-3.5, 1.9, -3.80]}>
        <boxGeometry args={[1.8, 0.12, 0.02]} />
        <meshStandardMaterial color="#E0F0FF" emissive="#B0D8FF" emissiveIntensity={1.5} roughness={0.1} />
      </mesh>
      {/* Chalk tray */}
      <mesh position={[-3.5, 1.2, -3.82]}>
        <boxGeometry args={[5.0, 0.1, 0.12]} />
        <meshStandardMaterial color="#3A4A58" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Teacher desk */}
      <mesh position={[-3.5, 0.87, -2.8]} castShadow {...makeHover(`Teacher station · ~120 W (PC + display)`)}>
        <boxGeometry args={[2.0, 0.1, 0.9]} />
        <meshStandardMaterial color="#8B6914" roughness={0.35} metalness={0.05} />
      </mesh>
      {[[-0.85, -0.38], [-0.85, 0.38], [0.85, -0.38], [0.85, 0.38]].map(([lx, lz], li) => (
        <mesh key={`tdl${li}`} position={[-3.5 + lx, 0.42, -2.8 + lz]}>
          <cylinderGeometry args={[0.04, 0.04, 0.74, 8]} />
          <meshStandardMaterial color="#6A7A8A" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}
      {/* Laptop on teacher desk */}
      <mesh position={[-3.5, 0.88, -2.82]}>
        <boxGeometry args={[0.55, 0.04, 0.38]} />
        <meshStandardMaterial color="#1A1A2E" roughness={0.25} metalness={0.6} />
      </mesh>
      <mesh position={[-3.5, 1.08, -3.0]}>
        <boxGeometry args={[0.55, 0.38, 0.04]} />
        <meshStandardMaterial color="#1A1A2E" roughness={0.25} metalness={0.6} />
      </mesh>
      <mesh position={[-3.5, 1.08, -2.98]}>
        <boxGeometry args={[0.48, 0.32, 0.02]} />
        <meshStandardMaterial color="#0EA5E9" emissive="#0EA5E9" emissiveIntensity={1.5} roughness={0.1} />
      </mesh>
      {/* Classroom A desks */}
      {deskGrid(-5.5, 0.075, -2.8, "#A0845C")}

      {/* ── CLASSROOM B (floor 1, right of corridor) ──────────────────────── */}
      {/* Whiteboard — centered at X=4.2, width=4.8, right edge 6.6 inside wall */}
      <mesh position={[4.2, 2.2, -3.85]} castShadow {...makeHover(`Interactive whiteboard · ~80 W`)}>
        <boxGeometry args={[4.8, 1.6, 0.08]} />
        <meshStandardMaterial color="#F0F4F8" roughness={0.25} metalness={0.05} />
      </mesh>
      <mesh position={[4.2, 2.2, -3.82]}>
        <boxGeometry args={[4.9, 1.7, 0.04]} />
        <meshStandardMaterial color="#8A9AB0" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Projector screen lines */}
      <mesh position={[4.2, 2.3, -3.80]}>
        <boxGeometry args={[3.0, 0.06, 0.02]} />
        <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={1.2} roughness={0.1} />
      </mesh>
      {/* Classroom B desks — ox=2.1 (3 cols, rightmost edge X=5.4, clearance 1.5m from right wall) */}
      {deskGrid(2.1, 0.075, -2.8, "#9A7A50")}

      {/* ── CORRIDOR (floor 1, right side) ───────────────────────────────── */}
      {/* Corridor floor — polished */}
      <mesh position={[4.2, 0.08, 0]}>
        <boxGeometry args={[5.4, 0.02, 8]} />
        <meshPhysicalMaterial color="#1A2A38" roughness={0.04} metalness={0.12} envMapIntensity={2.5} reflectivity={0.88} />
      </mesh>
      {/* Lockers — moved to X=6.4 so they sit against right wall inside */}
      {[-3.0, -1.5, 0.0, 1.5, 3.0].map((z, i) => (
        <group key={`loc${i}`} position={[6.4, 1.0, z]}>
          <mesh castShadow {...makeHover(`Locker bank · passive`)}>
            <boxGeometry args={[0.5, 2.0, 0.55]} />
            <meshStandardMaterial color="#4A5568" roughness={0.45} metalness={0.25} />
          </mesh>
          {/* Locker dividers */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.52, 0.02, 0.55]} />
            <meshStandardMaterial color="#3A4A58" roughness={0.6} />
          </mesh>
          {/* Handles */}
          {[-0.5, 0.5].map((dy, hi) => (
            <mesh key={hi} position={[0.26, dy * 0.5, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.12, 8]} />
              <meshStandardMaterial color="#A0AEC0" roughness={0.15} metalness={0.85} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ── RADIATORS (back wall, floor 1) ───────────────────────────────── */}
      {[-5.0, -2.5, 2.5, 4.5].map((x, i) => (
        <group key={`rad${i}`} position={[x, 0.55, -3.85]} {...makeHover(`Radiator · ~1.2 kW peak`)}>
          <mesh castShadow>
            <boxGeometry args={[1.4, 0.9, 0.12]} />
            <meshStandardMaterial color="#5A6880" roughness={0.35} metalness={0.35} />
          </mesh>
          {[-0.5, -0.25, 0.0, 0.25, 0.5].map((fx, fi) => (
            <mesh key={fi} position={[fx, 0, 0.08]}>
              <boxGeometry args={[0.1, 0.82, 0.04]} />
              <meshStandardMaterial color="#6A7A8A" roughness={0.3} metalness={0.45} />
            </mesh>
          ))}
          <pointLight position={[0, 0.6, 0.3]} intensity={0.2} color="#FF8C42" distance={2.0} />
        </group>
      ))}

      {/* ── CEILING LIGHT STRIPS (floor 1) ───────────────────────────────── */}
      {[[-4.5, 3.85, -1.5], [-4.5, 3.85, 1.5],
        [-1.5, 3.85, -1.5], [-1.5, 3.85, 1.5],
        [ 5.5, 3.85, -1.5], [ 5.5, 3.85, 1.5]].map(([x, y, z], i) => (
        <group key={`cl1${i}`} position={[x, y, z] as [number, number, number]}>
          <mesh>
            <boxGeometry args={[2.0, 0.06, 0.22]} />
            <meshStandardMaterial color="#FFFDE7" emissive="#FFF9C4" emissiveIntensity={5.0} roughness={0.02} />
          </mesh>
          <rectAreaLight width={2.0} height={0.22} intensity={14} color="#FFF8E1" position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]} />
        </group>
      ))}
      {/* Corridor strip lights */}
      {[-2.5, 0.0, 2.5].map((z, i) => (
        <group key={`ccl${i}`} position={[4.2, 3.85, z]}>
          <mesh>
            <boxGeometry args={[0.18, 0.06, 1.2]} />
            <meshStandardMaterial color="#E0F0FF" emissive="#B0D8FF" emissiveIntensity={3.5} roughness={0.05} />
          </mesh>
          <pointLight intensity={1.2} color="#C8E8FF" distance={4.0} />
        </group>
      ))}

      {/* Staircase removed — position was incorrect */}



      {/* ── FLOOR 2 CORRIDOR DIVIDER ───────────────────────────────────── */}
      <mesh position={[1.5, 6.0, 0]}>
        <boxGeometry args={[0.15, 4.0, 8]} />
        <meshStandardMaterial color="#8A9AB0" roughness={0.5} metalness={0.3} />
      </mesh>
      {[-2.5, -0.8, 0.8, 2.5].map((z, i) => (
        <mesh key={`cgp2${i}`} position={[1.52, 6.2, z]}>
          <boxGeometry args={[0.08, 2.4, 1.0]} />
          <meshPhysicalMaterial
            color="#90C8F0" transparent opacity={0.28}
            roughness={0.0} metalness={0.02}
            envMapIntensity={2.5} transmission={0.65} ior={1.5}
          />
        </mesh>
      ))}

      {/* ── BIM PROJECTION — FLOOR 2 SLAB ─────────────────────────────────── */}
      {[
        { pos: [0, 4.10, -4.0] as [number,number,number], args: [14.0, 0.01, 0.025] as [number,number,number] },
        { pos: [0, 4.10,  4.0] as [number,number,number], args: [14.0, 0.01, 0.025] as [number,number,number] },
        { pos: [-7.0, 4.10, 0] as [number,number,number], args: [0.025, 0.01, 8.0] as [number,number,number] },
        { pos: [ 7.0, 4.10, 0] as [number,number,number], args: [0.025, 0.01, 8.0] as [number,number,number] },
      ].map(({ pos, args }, i) => (
        <mesh key={`bim2_outer${i}`} position={pos}>
          <boxGeometry args={args} />
          <meshStandardMaterial color="#FFFFFF" transparent opacity={0.14} roughness={1} />
        </mesh>
      ))}
      <mesh position={[1.5, 4.10, 0]}>
        <boxGeometry args={[0.025, 0.01, 8.0]} />
        <meshStandardMaterial color="#22D3EE" transparent opacity={0.10} roughness={1} />
      </mesh>

      {/* ── FLOOR 2 — CLASSROOM C ─────────────────────────────────────────── */}
      {/* Blackboard floor 2 */}
      <mesh position={[-3.5, 6.2, -3.85]} castShadow {...makeHover(`Blackboard · display ~45 W`)}>
        <boxGeometry args={[5.0, 1.6, 0.08]} />
        <meshStandardMaterial color="#1B3A2A" roughness={0.75} />
      </mesh>
      <mesh position={[-3.5, 6.2, -3.82]}>
        <boxGeometry args={[5.1, 1.7, 0.04]} />
        <meshStandardMaterial color="#4A5568" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[-3.5, 6.3, -3.80]}>
        <boxGeometry args={[2.8, 0.15, 0.02]} />
        <meshStandardMaterial color="#E0F0FF" emissive="#B0D8FF" emissiveIntensity={2.0} roughness={0.1} />
      </mesh>
      {/* Floor 2 desks */}
      {deskGrid(-5.5, 4.075, -2.8, "#9A7A50")}
      {deskGrid(2.1, 4.075, -2.8, "#A0845C")}
      {/* Floor 2 ceiling lights */}
      {[[-4.5, 7.85, -1.5], [-4.5, 7.85, 1.5],
        [-1.5, 7.85, -1.5], [-1.5, 7.85, 1.5],
        [ 5.5, 7.85, -1.5], [ 5.5, 7.85, 1.5]].map(([x, y, z], i) => (
        <group key={`cl2${i}`} position={[x, y, z] as [number, number, number]}>
          <mesh>
            <boxGeometry args={[2.0, 0.06, 0.22]} />
            <meshStandardMaterial color="#FFFDE7" emissive="#FFF9C4" emissiveIntensity={5.0} roughness={0.02} />
          </mesh>
          <pointLight intensity={1.5} color="#FFF8E1" distance={5.0} />
        </group>
      ))}
      {/* Floor 2 radiators */}
      {[-5.0, 2.5].map((x, i) => (
        <group key={`rad2${i}`} position={[x, 4.55, -3.85]} {...makeHover(`Radiator · ~1.2 kW peak`)}>
          <mesh castShadow>
            <boxGeometry args={[1.4, 0.9, 0.12]} />
            <meshStandardMaterial color="#5A6880" roughness={0.35} metalness={0.35} />
          </mesh>
          {[-0.5, -0.25, 0.0, 0.25, 0.5].map((fx, fi) => (
            <mesh key={fi} position={[fx, 0, 0.08]}>
              <boxGeometry args={[0.1, 0.82, 0.04]} />
              <meshStandardMaterial color="#6A7A8A" roughness={0.3} metalness={0.45} />
            </mesh>
          ))}
          <pointLight position={[0, 0.6, 0.3]} intensity={0.2} color="#FF8C42" distance={2.0} />
        </group>
      ))}

      {/* ── AMBIENT FILL LIGHTS ──────────────────────────────────────────── */}
      {/* Reduced ambient so ceiling lights create real contrast */}
      <ambientLight intensity={0.6} color="#FFF0E8" />
      {/* Top-down key light — simulates skylights */}
      <directionalLight position={[0, 14, 4]} intensity={2.5} color="#FFF8F0" castShadow shadow-mapSize={[2048, 2048]} />
      {/* Cool fill from outside windows */}
      <directionalLight position={[-10, 6, 4]} intensity={1.2} color="#C0D8F0" />
      <directionalLight position={[10, 6, 4]} intensity={1.2} color="#D8E8F8" />
      {/* Warm fill from inside — classroom zones */}
      <pointLight position={[-4.5, 3.2, -1.5]} intensity={3.5} color="#FFE8C0" distance={7} />
      <pointLight position={[5.0, 3.2, -1.5]} intensity={3.5} color="#FFE8C0" distance={7} />
      <pointLight position={[-4.5, 7.2, -1.5]} intensity={3.0} color="#FFE8C0" distance={7} />
      <pointLight position={[5.0, 7.2, -1.5]} intensity={3.0} color="#FFE8C0" distance={7} />

      {/* ── SENSOR NODES — only show active floor, others dimmed ─────────── */}
      {SENSORS.map(sensor => (
        <SensorNodeMesh
          key={sensor.id}
          sensor={sensor}
          onHover={onSensorHover}
          onClick={onSensorClick}
          gl={gl}
          dimmed={sensor.floor !== activeFloor}
        />
      ))}
    </group>
  );
}

// ── Pulsing sensor node mesh ──────────────────────────────────────────────────
function SensorNodeMesh({ sensor, onHover, onClick, gl, dimmed = false }: {
  sensor: SensorNode;
  onHover: (id: string | null, screenPos?: { x: number; y: number }) => void;
  onClick: (id: string | null, screenPos?: { x: number; y: number }) => void;
  gl: THREE.WebGLRenderer;
  dimmed?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 0.85 + 0.15 * Math.sin(t * 2.5 + sensor.position[0]);
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = dimmed ? 0.15 : pulse * (hovered ? 2.2 : 1.2);
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity = dimmed ? 0.25 : 1.0;
    }
    if (ringRef.current) {
      const ringScale = 1 + 0.4 * Math.sin(t * 2.5 + sensor.position[0]);
      ringRef.current.scale.setScalar(ringScale);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - (ringScale - 1) / 0.4);
    }
  });

  const getScreenPos = useCallback((e: any) => {
    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, [gl]);

  return (
    <group position={sensor.position}>
      <mesh
        ref={meshRef}
        onPointerOver={e => {
          e.stopPropagation();
          setHovered(true);
          onHover(sensor.id, getScreenPos(e.nativeEvent));
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={e => {
          e.stopPropagation();
          setHovered(false);
          onHover(null);
          document.body.style.cursor = 'auto';
        }}
        onPointerMove={e => {
          if (hovered) onHover(sensor.id, getScreenPos(e.nativeEvent));
        }}
        onClick={e => {
          e.stopPropagation();
          onClick(sensor.id, getScreenPos(e.nativeEvent));
        }}
      >
        <sphereGeometry args={[0.07, 14, 14]} />
        <meshStandardMaterial
          color={dimmed ? '#2A3A4A' : C.sensor}
          emissive={dimmed ? '#1A2A3A' : C.sensor}
          emissiveIntensity={1.2}
          roughness={0.15}
          metalness={0.4}
          transparent
          opacity={dimmed ? 0.3 : 1.0}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.09, 0.13, 18]} />
        <meshBasicMaterial color={C.sensor} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── Camera dolly animation ────────────────────────────────────────────────────
// CameraController removed — it was overriding camera position every frame,
// preventing OrbitControls zoom from working. OrbitControls handles camera now.

// ── Interior 3D mini-window (right panel) ────────────────────────────────────
function InteriorMiniCanvas({ activeSensorId, activeFloor }: { activeSensorId: string | null; activeFloor: 1 | 2 }) {
  return (
    <div style={{
      width: '100%',
      height: '200px',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid rgba(14,165,233,0.25)',
      boxShadow: '0 0 24px rgba(14,165,233,0.12), inset 0 0 12px rgba(0,0,0,0.4)',
      position: 'relative',
      background: '#0D1520',
    }}>
      {/* Label */}
      <div style={{
        position: 'absolute', top: '8px', left: '10px', zIndex: 2,
        fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#0EA5E9',
        background: 'rgba(10,14,20,0.75)', padding: '2px 7px', borderRadius: '4px',
      }}>
        Floor {activeFloor} · top-down
      </div>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 6, 0.1], fov: 55 }}
        style={{ background: '#111e2e' }}
      >
        <ambientLight intensity={3.0} color="#c0d8f0" />
        <directionalLight position={[3, 8, 3]} intensity={4.0} color="#e8f4ff" />
        <directionalLight position={[-3, 8, -3]} intensity={2.0} color="#d0e8ff" />
        <pointLight position={[-2, 3, -1]} intensity={1.5} color="#FCD34D" />
        <pointLight position={[2, 3, 1]} intensity={1.2} color="#FCD34D" />
        <MiniFloorPlan activeSensorId={activeSensorId} activeFloor={activeFloor} />
      </Canvas>
    </div>
  );
}

function MiniFloorPlan({ activeSensorId, activeFloor }: { activeSensorId: string | null; activeFloor: 1 | 2 }) {
  // Floor
  return (
    <group>
      {/* Floor slab */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.08, 3.4]} />
        <meshStandardMaterial color="#374151" roughness={0.8} />
      </mesh>

      {/* Outer walls — thin boxes */}
      {/* Front wall (open — cutaway) */}
      {/* Back wall */}
      <mesh position={[0, 0.25, -1.65]}>
        <boxGeometry args={[4.4, 0.5, 0.1]} />
        <meshStandardMaterial color="#4A5568" roughness={0.65} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-2.2, 0.25, 0]}>
        <boxGeometry args={[0.1, 0.5, 3.4]} />
        <meshStandardMaterial color="#4A5568" roughness={0.65} />
      </mesh>
      {/* Right wall */}
      <mesh position={[2.2, 0.25, 0]}>
        <boxGeometry args={[0.1, 0.5, 3.4]} />
        <meshStandardMaterial color="#4A5568" roughness={0.65} />
      </mesh>

      {/* Interior partition walls */}
      <mesh position={[-0.7, 0.2, -0.5]}>
        <boxGeometry args={[0.07, 0.4, 1.8]} />
        <meshStandardMaterial color="#5A6880" roughness={0.7} />
      </mesh>
      <mesh position={[0.9, 0.2, 0.3]}>
        <boxGeometry args={[0.07, 0.4, 1.6]} />
        <meshStandardMaterial color="#5A6880" roughness={0.7} />
      </mesh>
      <mesh position={[0.1, 0.2, -0.2]}>
        <boxGeometry args={[1.6, 0.4, 0.07]} />
        <meshStandardMaterial color="#5A6880" roughness={0.7} />
      </mesh>

      {/* Room fills */}
      {[
        { pos: [-1.5, 0.01, -0.9] as [number,number,number], size: [1.4, 0.02, 1.4] as [number,number,number], color: '#1E3A4A' },
        { pos: [0.0, 0.01, -0.9] as [number,number,number], size: [1.6, 0.02, 1.4] as [number,number,number], color: '#1E3A4A' },
        { pos: [1.6, 0.01, -0.9] as [number,number,number], size: [1.2, 0.02, 1.4] as [number,number,number], color: '#1E2A3A' },
        { pos: [-1.5, 0.01, 0.7] as [number,number,number], size: [1.4, 0.02, 1.8] as [number,number,number], color: '#1A2E3E' },
        { pos: [1.5, 0.01, 0.7] as [number,number,number], size: [1.2, 0.02, 1.8] as [number,number,number], color: '#1E2A3A' },
      ].map(({ pos, size, color }, i) => (
        <mesh key={`room${i}`} position={pos}>
          <boxGeometry args={size} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}

      {/* Sensor dots on floor plan — filtered by active floor */}
      {SENSORS.filter(s => s.floor === activeFloor).map(s => {
        const isActive = s.id === activeSensorId;
        return (
          <group key={s.id} position={[s.position[0], 0.06, s.position[2]]}>
            <mesh>
              <cylinderGeometry args={[isActive ? 0.1 : 0.07, isActive ? 0.1 : 0.07, 0.04, 12]} />
              <meshStandardMaterial
                color={C.sensor}
                emissive={C.sensor}
                emissiveIntensity={isActive ? 3.0 : 1.5}
              />
            </mesh>
            {isActive && (
              <pointLight position={[0, 0.3, 0]} intensity={1.2} color={C.sensor} distance={1.2} />
            )}
          </group>
        );
      })}

      {/* Desk/furniture hints — floor-specific */}
      {activeFloor === 1 && [
        [-1.5, 0.08, -1.0], [-1.5, 0.08, -0.6], [-1.2, 0.08, -1.0],
        [0.1, 0.08, -1.0], [0.1, 0.08, -0.6], [0.4, 0.08, -1.0],
      ].map(([x, y, z], i) => (
        <mesh key={`desk${i}`} position={[x, y, z] as [number, number, number]}>
          <boxGeometry args={[0.22, 0.04, 0.14]} />
          <meshStandardMaterial color="#2D3748" roughness={0.8} />
        </mesh>
      ))}
      {activeFloor === 2 && [
        [-1.4, 0.08, -0.8], [-1.0, 0.08, -0.8], [-1.4, 0.08, -0.4],
        [0.3, 0.08, -0.8], [0.6, 0.08, -0.8], [1.2, 0.08, 0.5],
        [1.5, 0.08, 0.5], [1.2, 0.08, 0.8],
      ].map(([x, y, z], i) => (
        <mesh key={`desk2${i}`} position={[x, y, z] as [number, number, number]}>
          <boxGeometry args={[0.22, 0.04, 0.14]} />
          <meshStandardMaterial color="#2D3748" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// ── Main BuildingScreen ───────────────────────────────────────────────────────
export function BuildingScreen() {
  const { setScreen } = useNav();
  const [interior, setInterior] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredSensor, setHoveredSensor] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [pinnedTooltipPos, setPinnedTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [activeFloor, setActiveFloor] = useState<1 | 2>(1);
  const [furnitureTip, setFurnitureTip] = useState<{ label: string; pos: { x: number; y: number } } | null>(null);
  const orbitRef = useRef<any>(null);

  // Register reset function for global R-key
  useEffect(() => {
    _buildingResetFn = () => {
      setInterior(false);
      setAutoRotate(true);
      setSelectedSensor(null);
      setHoveredSensor(null);
      setPinnedTooltipPos(null);
      setActiveFloor(1);
    };
    return () => { _buildingResetFn = null; };
  }, []);

  const handleSensorHover = useCallback((id: string | null, screenPos?: { x: number; y: number }) => {
    setHoveredSensor(id);
    if (id && screenPos) setTooltipPos(screenPos);
    else setTooltipPos(null);
  }, []);

  const handleFurnitureHover = useCallback((label: string | null, screenPos?: { x: number; y: number }) => {
    if (label && screenPos) setFurnitureTip({ label, pos: screenPos });
    else setFurnitureTip(null);
  }, []);
  const handleSensorClick = useCallback((id: string | null, screenPos?: { x: number; y: number }) => {
    setSelectedSensor(prev => {
      if (prev === id) { setPinnedTooltipPos(null); return null; }
      if (id && screenPos) setPinnedTooltipPos(screenPos);
      return id;
    });
  }, []);

  const activeSensor = selectedSensor
    ? SENSORS.find(s => s.id === selectedSensor)
    : hoveredSensor
    ? SENSORS.find(s => s.id === hoveredSensor)
    : null;

  const displayTooltipPos = selectedSensor ? pinnedTooltipPos : tooltipPos;
  const showTooltip = (selectedSensor || hoveredSensor) && activeSensor && displayTooltipPos;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg, #0A0E14 0%, #0F1825 60%, #111827 100%)',
      position: 'relative', overflow: 'hidden',
      display: 'flex',
    }}>
      {/* Dot grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(14,165,233,0.07) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        opacity: 0.6,
      }} />

      {/* ── 3D Canvas ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [5.5, 3.5, 6.5], fov: 42 }}
          shadows
          style={{ background: 'linear-gradient(180deg, #0A0F1A 0%, #0D1628 60%, #101E35 100%)' }}
          onPointerDown={() => setAutoRotate(false)}
        >
          {/* Atmospheric fog for depth */}
          <fog attach="fog" args={['#0A0F1A', 30, 80]} />

          {/* Ambient — reduced in interior mode to let ceiling lights create contrast */}
          <ambientLight intensity={interior ? 0.35 : 1.8} color="#d0e8ff" />

          {/* Key light — warm from upper-right */}
          <directionalLight
            position={[8, 12, 8]}
            intensity={interior ? 1.5 : 4.0}
            color="#fff8f0"
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={30}
            shadow-camera-left={-8}
            shadow-camera-right={8}
            shadow-camera-top={8}
            shadow-camera-bottom={-8}
          />

          {/* Fill light — cool from left */}
          <directionalLight position={[-6, 6, -4]} intensity={2.5} color="#c8e8ff" />

          {/* Front fill — ensures front face is lit */}
          <directionalLight position={[0, 4, 10]} intensity={1.4} color="#e8f4ff" />

          {/* Rim light — back */}
          <directionalLight position={[0, 4, -8]} intensity={1.5} color="#a0c8e8" />

          {/* Cyan accent point light */}
          <pointLight position={[-4, 4, -4]} intensity={1.5} color="#0EA5E9" />

          <OrbitControls
            ref={orbitRef}
            makeDefault
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            enableDamping={true}
            dampingFactor={0.08}
            rotateSpeed={0.7}
            zoomSpeed={1.0}
            minDistance={interior ? 3 : 4}
            maxDistance={interior ? 40 : 55}
            target={interior ? [0, 4, 0] : [0, 2.5, 0]}
            maxPolarAngle={Math.PI / 1.6}
            onStart={() => setAutoRotate(false)}
          />

          <>
            {/* City environment map — provides realistic reflections on glass */}
            {!interior ? (
              <ExteriorBuilding autoRotate={autoRotate} />
            ) : (
              <InteriorBuilding
                autoRotate={autoRotate}
                onSensorHover={handleSensorHover}
                onSensorClick={handleSensorClick}
                activeFloor={activeFloor}
                onFurnitureHover={handleFurnitureHover}
              />
            )}
            <ContactShadows
              position={[0, 0, 0]}
              opacity={0.4}
              scale={12}
              blur={2.5}
              far={4}
            />
          </>
        </Canvas>

        {/* Auto-rotate hint */}
        {autoRotate && (
          <div style={{
            position: 'absolute', top: '14px', left: '50%', transform: 'translateX(-50%)',
            fontSize: '9px', color: '#3D4F6A',
            background: 'rgba(10,14,20,0.7)', padding: '3px 10px', borderRadius: '4px',
          }}>
            Click or drag to explore · scroll to zoom
          </div>
        )}

        {/* Sensor tooltip */}
        {interior && showTooltip && displayTooltipPos && (
          <div style={{
            position: 'absolute',
            left: displayTooltipPos.x + 14,
            top: displayTooltipPos.y - 10,
            background: 'rgba(14,20,32,0.96)',
            border: '1px solid rgba(14,165,233,0.4)',
            borderRadius: '8px',
            padding: '9px 13px',
            pointerEvents: 'none',
            zIndex: 10,
            minWidth: '190px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.6), 0 0 12px rgba(14,165,233,0.1)',
            backdropFilter: 'blur(8px)',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0EA5E9', marginBottom: '3px' }}>
              {activeSensor!.type}
            </div>
            <div style={{ fontSize: '10px', color: '#94A3B8' }}>
              → {activeSensor!.infers}
            </div>
            <div style={{ fontSize: '9px', color: '#4A5568', marginTop: '4px', fontStyle: 'italic' }}>
              Conceptual · Floor {activeSensor!.floor}
            </div>
            {selectedSensor === activeSensor!.id && (
              <div style={{ fontSize: '9px', color: '#0EA5E9', marginTop: '3px' }}>
                📌 pinned · click to dismiss
              </div>
            )}
          </div>
        )}

        {/* Furniture energy tooltip */}
        {interior && furnitureTip && (
          <div style={{
            position: 'absolute',
            left: furnitureTip.pos.x + 14,
            top: furnitureTip.pos.y - 10,
            background: 'rgba(14,20,32,0.96)',
            border: '1px solid rgba(245,158,11,0.45)',
            borderRadius: '8px',
            padding: '9px 13px',
            pointerEvents: 'none',
            zIndex: 11,
            minWidth: '200px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.6), 0 0 12px rgba(245,158,11,0.12)',
            backdropFilter: 'blur(8px)',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#F59E0B', marginBottom: '4px' }}>
              ⚡ Energy estimate
            </div>
            <div style={{ fontSize: '11px', color: '#E2E8F0', fontWeight: 600 }}>
              {furnitureTip.label}
            </div>
            <div style={{ fontSize: '9px', color: '#64748B', marginTop: '4px', fontStyle: 'italic' }}>
              Simulated · not metered
            </div>
          </div>
        )}
        {/* Interior sensor legend */}
        {interior && (
          <div style={{
            position: 'absolute', top: '14px', left: '14px',
            background: 'rgba(10,14,20,0.88)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '10px',
            backdropFilter: 'blur(6px)',
          }}>
            <div style={{ color: '#64748B', fontWeight: 700, marginBottom: '7px', fontSize: '9px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Sensor types
            </div>
            {[
              { label: 'CO₂ → occupancy' },
              { label: 'Temp + humidity → comfort' },
              { label: 'Sub-meter → loads' },
              { label: 'PIR → schedule' },
            ].map(({ label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0EA5E9', boxShadow: '0 0 5px #0EA5E9', flexShrink: 0 }} />
                <span style={{ color: '#94A3B8' }}>{label}</span>
              </div>
            ))}
            <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '9px', color: '#4A5568', fontStyle: 'italic' }}>
              Hover / click nodes for details
            </div>
          </div>
        )}
      </div>

      {/* ── Right panel ───────────────────────────────────────────────────── */}
      <div style={{
        width: '300px', flexShrink: 0,
        padding: '20px 18px',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', gap: '14px',
        overflowY: 'auto',
        background: 'rgba(10,14,20,0.5)',
        backdropFilter: 'blur(4px)',
      }}>
        {/* Header */}
        <div>
          <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0EA5E9', marginBottom: '4px' }}>
            {interior ? 'Interior · Sensor vision' : 'Exterior · Building overview'}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#E8EDF5', lineHeight: 1.2, marginBottom: '6px' }}>
            {interior ? 'Deployment concept' : 'Luz · UK school building'}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.6 }}>
            {interior
              ? 'Sensor nodes show where IoT instrumentation would be placed in the next phase. No live indoor data is collected in this demo.'
              : 'The physical asset behind the digital twin. All data in this demo comes from the Building Data Genome Project 2 (open, peer-reviewed).'}
          </div>
        </div>

        {/* ── Interior 3D mini-window ─────────────────────────────────────── */}
        {interior && (
          <div>
            {/* Floor switcher tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              {([1, 2] as const).map(fl => (
                <button
                  key={fl}
                  onClick={() => { setActiveFloor(fl); setSelectedSensor(null); setPinnedTooltipPos(null); }}
                  style={{
                    flex: 1,
                    padding: '7px 0',
                    borderRadius: '7px',
                    border: activeFloor === fl
                      ? '1px solid rgba(14,165,233,0.6)'
                      : '1px solid rgba(255,255,255,0.08)',
                    background: activeFloor === fl
                      ? 'rgba(14,165,233,0.12)'
                      : 'rgba(255,255,255,0.03)',
                    color: activeFloor === fl ? '#0EA5E9' : '#64748B',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    letterSpacing: '0.03em',
                  }}
                  onMouseEnter={e => {
                    if (activeFloor !== fl) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(14,165,233,0.3)';
                      (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8';
                    }
                  }}
                  onMouseLeave={e => {
                    if (activeFloor !== fl) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
                      (e.currentTarget as HTMLButtonElement).style.color = '#64748B';
                    }
                  }}
                >
                  Floor {fl}
                  <span style={{ fontSize: '9px', marginLeft: '4px', opacity: 0.7 }}>
                    ({SENSORS.filter(s => s.floor === fl).length} sensors)
                  </span>
                </button>
              ))}
            </div>
            <InteriorMiniCanvas activeSensorId={activeSensor?.id ?? null} activeFloor={activeFloor} />
            <div style={{ fontSize: '9px', color: '#4A5568', marginTop: '6px', textAlign: 'center', fontStyle: 'italic' }}>
              Highlighted node = selected sensor
            </div>
          </div>
        )}

        {/* Building info card (exterior only) */}
        {!interior && (
          <div style={{
            background: 'rgba(20,27,38,0.9)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px',
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64748B', marginBottom: '10px' }}>
              Building information
            </div>
            {[
              { label: 'Site ID', value: 'BDG2 "Lamb"' },
              { label: 'Use', value: 'Education / Classroom' },
              { label: 'Floor area', value: '14,475 m²' },
              { label: 'Floors', value: '2' },
              { label: 'Year built', value: '2013' },
              { label: 'Occupants', value: '~1,400' },
              { label: 'Heating', value: 'Biomass (renewable)' },
              { label: 'Metered', value: 'Electricity + Gas' },
              { label: 'Location', value: 'Cardiff area, Wales, UK' },
              { label: 'Data source', value: 'BDG2 (open, peer-reviewed)' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: '#64748B', flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: '10px', color: '#CBD5E1', textAlign: 'right', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Interior concept card */}
        {interior && (
          <div style={{
            background: 'rgba(14,165,233,0.04)',
            border: '1px solid rgba(14,165,233,0.15)',
            borderRadius: '12px',
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#0EA5E9', marginBottom: '8px' }}>
              Deployment vision
            </div>
            <div style={{ fontSize: '10px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '10px' }}>
              Phase 2 would instrument the building with low-cost IoT sensors to enrich the digital twin with real-time occupancy, comfort, and load data.
            </div>
            {[
              { count: '7', label: 'Sensor nodes shown' },
              { count: '4', label: 'Sensor types' },
              { count: '2', label: 'Floors covered' },
            ].map(({ count, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#0EA5E9', minWidth: '28px' }}>{count}</span>
                <span style={{ fontSize: '10px', color: '#94A3B8' }}>{label}</span>
              </div>
            ))}
            <div style={{
              marginTop: '10px', padding: '8px 10px', borderRadius: '6px',
              background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
              fontSize: '9px', color: '#F59E0B', lineHeight: 1.5,
            }}>
              ⚠ Conceptual placement only — no live indoor data in this demo
            </div>
          </div>
        )}

        {/* CTA buttons */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* View energy twin button (exterior only) */}
          {!interior && (
            <button
              onClick={() => setScreen('dashboard')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '11px 18px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', transition: 'transform 160ms ease, box-shadow 160ms ease',
                boxShadow: '0 4px 16px rgba(14,165,233,0.3)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(14,165,233,0.45)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(14,165,233,0.3)'; }}
              onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
              onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'; }}
            >
              View energy twin →
            </button>
          )}

          {!interior ? (
            <button
              onClick={() => { setInterior(true); setAutoRotate(true); setSelectedSensor(null); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '11px 18px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                border: 'none', color: '#0A0E14', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', transition: 'transform 160ms ease, box-shadow 160ms ease',
                boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
              onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
              onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'; }}
            >
              Enter building →
            </button>
          ) : (
            <button
              onClick={() => { setInterior(false); setAutoRotate(true); setSelectedSensor(null); setHoveredSensor(null); setPinnedTooltipPos(null); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#94A3B8', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 160ms ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.22)'; (e.currentTarget as HTMLButtonElement).style.color = '#E8EDF5'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'; }}
            >
              ← Back to exterior
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
