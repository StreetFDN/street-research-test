// FILE: components/city/assets/EcosystemConnections.tsx
'use client';

import { useMemo, useState } from 'react';
import { Line, Html } from '@react-three/drei'; 
import * as THREE from 'three';
import { startups } from '../startupsconfig';
import { connections, ConnectionData } from '../connectionsconfig';
import { CELL_SIZE } from './roads';
import { ConnectionPopup } from '../ui/connectionpopup';

const getPos = (gridPos: [number, number], heightOffset: number): THREE.Vector3 => {
  const x = (gridPos[0] - 6) * CELL_SIZE;
  const z = (gridPos[1] - 6) * CELL_SIZE;
  return new THREE.Vector3(x, heightOffset, z);
};

// Added visible and isNight props
export const EcosystemConnections = ({ visible = true, isNight = false }: { visible?: boolean; isNight?: boolean }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ data: ConnectionData, position: THREE.Vector3 } | null>(null);

  const lines = useMemo(() => {
    return connections.map(conn => {
      const startupA = startups.find(s => s.id === conn.startupAId);
      const startupB = startups.find(s => s.id === conn.startupBId);

      if (!startupA || !startupB) return null;

      const start = getPos(startupA.gridPosition, 3);
      const end = getPos(startupB.gridPosition, 3);
      const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
      mid.y += 2; 

      const path = new THREE.CatmullRomCurve3([start, mid, end]);
      const points = path.getPoints(20);

      return {
        connectionData: conn,
        points: points,
        midpoint: mid 
      };
    }).filter(Boolean);
  }, []);

  // HIDE EVERYTHING IF NOT VISIBLE
  if (!visible) return null;

  return (
    <group>
      {lines.map((lineData) => {
        if(!lineData) return null;
        const isHovered = hoveredId === lineData.connectionData.id;
        const isSelected = selected?.data.id === lineData.connectionData.id;

        // Brighter, more glowing colors for night scene (slightly below window glow intensity)
        const baseColor = isHovered || isSelected ? "#00b3ff" : "#fbbf24";
        const nightColor = isHovered || isSelected ? "#4dd0ff" : "#ffd54f"; // Brighter yellow/cyan for night
        const lineColor = isNight ? nightColor : baseColor;
        const baseWidth = isHovered || isSelected ? 5 : 3;
        const nightWidth = isHovered || isSelected ? 6 : 4; // Slightly thicker at night
        const lineWidth = isNight ? nightWidth : baseWidth;

        return (
          <group key={lineData.connectionData.id}>
            <Line
                points={lineData.points}
                color={lineColor} 
                lineWidth={lineWidth}
                dashed={false}
                toneMapped={false} 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected({ data: lineData.connectionData, position: lineData.midpoint });
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = 'pointer';
                  setHoveredId(lineData.connectionData.id);
                }}
                onPointerOut={(e) => {
                  document.body.style.cursor = 'auto';
                  setHoveredId(null);
                }}
            />
          </group>
        );
      })}

      {selected && (
          <Html 
              position={selected.position} 
              center={false}
              distanceFactor={12} 
              zIndexRange={[1000, 0]}
          >
              <div style={{ transform: 'translate(-50%, calc(-100% - 6px))' }}>
                <ConnectionPopup 
                    data={selected.data} 
                    onClose={() => setSelected(null)} 
                />
              </div>
          </Html>
      )}
    </group>
  );
};
