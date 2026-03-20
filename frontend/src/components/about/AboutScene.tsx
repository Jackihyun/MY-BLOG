"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, RoundedBox, Sphere, Cylinder, Box, Float, SoftShadows } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import { Group, Mesh, Vector3 } from "three";

export type ActiveZone = "all" | "laptop" | "reading" | "exercising";

interface AboutSceneProps {
  reducedMotion?: boolean;
  activeZone?: ActiveZone;
  onZoneClick?: (zone: ActiveZone) => void;
}

function CameraRig({ reducedMotion = false, activeZone = "all" }: { reducedMotion?: boolean; activeZone?: ActiveZone }) {
  const { camera, pointer } = useThree();
  const currentLookAt = useRef(new Vector3(0, 0.5, 0));
  const targetLookAt = new Vector3();
  const targetPos = new Vector3();

  useFrame(() => {
    if (activeZone === "laptop") {
      targetPos.set(-2.5, 2.2, 1.5);
      targetLookAt.set(-2.5, 0.8, -2.5);
    } else if (activeZone === "reading") {
      targetPos.set(2.5, 2.0, 1.0);
      targetLookAt.set(2.5, 0.6, -2.5);
    } else if (activeZone === "exercising") {
      targetPos.set(1.5, 1.5, 5.0);
      targetLookAt.set(1.5, 0.3, 1.5);
    } else {
      const pointerX = reducedMotion ? 0 : pointer.x * 1.5;
      const pointerY = reducedMotion ? 0 : pointer.y * 1.5;
      targetPos.set(7.5 + pointerX, 6 + pointerY, 9);
      targetLookAt.set(0, 0.5, 0);
    }

    camera.position.lerp(targetPos, 0.04);
    currentLookAt.current.lerp(targetLookAt, 0.04);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

// 정교해진 아바타 컴포넌트
function Avatar({ 
  position, 
  rotation = [0, 0, 0], 
  activity, 
  skinColor = "#ffdfc4",
  reducedMotion = false 
}: { 
  position: [number, number, number]; 
  rotation?: [number, number, number]; 
  activity: "reading" | "exercising" | "laptop";
  skinColor?: string;
  reducedMotion?: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);

  const hairColor = "#3e2723"; // 짙은 갈색 머리
  const shirtColor = activity === "exercising" ? "#e63946" : "#f1faee";
  const pantsColor = activity === "exercising" ? "#1d3557" : "#457b9d";

  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return;
    const t = state.clock.elapsedTime;

    if (activity === "laptop") {
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 15) * 0.1 - 0.5;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.cos(t * 15) * 0.1 - 0.5;
      if (headRef.current) headRef.current.rotation.y = Math.sin(t * 2) * 0.05;
    } else if (activity === "reading") {
      if (headRef.current) headRef.current.rotation.x = Math.sin(t * 1.5) * 0.05 + 0.15;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.8;
    } else if (activity === "exercising") {
      const squat = Math.abs(Math.sin(t * 2.5)) * 0.2;
      groupRef.current.position.y = position[1] - squat;
      if (leftArmRef.current) leftArmRef.current.rotation.z = Math.sin(t * 2.5) * 0.6 + 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.z = -Math.sin(t * 2.5) * 0.6 - 0.6;
      if (headRef.current) headRef.current.rotation.x = Math.sin(t * 2.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* 머리 그룹 */}
      <group ref={headRef} position={[0, 0.65, 0]}>
        {/* 목 */}
        <Cylinder args={[0.06, 0.08, 0.1]} position={[0, -0.2, 0]} castShadow>
          <meshStandardMaterial color={skinColor} />
        </Cylinder>
        
        {/* 머리카락 (뒷머리/윗머리) */}
        <Sphere args={[0.26, 32, 32]} position={[0, 0.02, -0.03]} castShadow>
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </Sphere>
        
        {/* 얼굴 */}
        <Sphere args={[0.24, 32, 32]} position={[0, -0.02, 0.04]} castShadow receiveShadow>
          <meshStandardMaterial color={skinColor} roughness={0.5} />
        </Sphere>

        {/* 눈 */}
        <Sphere args={[0.025, 16, 16]} position={[-0.09, 0.02, 0.26]}>
          <meshBasicMaterial color="#222" />
        </Sphere>
        <Sphere args={[0.025, 16, 16]} position={[0.09, 0.02, 0.26]}>
          <meshBasicMaterial color="#222" />
        </Sphere>
        
        {/* 볼터치 */}
        <Sphere args={[0.04, 16, 16]} position={[-0.13, -0.04, 0.24]}>
          <meshBasicMaterial color="#ff9999" transparent opacity={0.5} />
        </Sphere>
        <Sphere args={[0.04, 16, 16]} position={[0.13, -0.04, 0.24]}>
          <meshBasicMaterial color="#ff9999" transparent opacity={0.5} />
        </Sphere>

        {/* 안경 (독서할 때만) */}
        {activity === "reading" && (
          <group position={[0, 0.02, 0.27]}>
            <Cylinder args={[0.06, 0.06, 0.01, 32]} position={[-0.09, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
              <meshStandardMaterial color="#111" />
            </Cylinder>
            <Cylinder args={[0.06, 0.06, 0.01, 32]} position={[0.09, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
              <meshStandardMaterial color="#111" />
            </Cylinder>
            <Box args={[0.06, 0.01, 0.01]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#111" />
            </Box>
          </group>
        )}
        
        {/* 헤드폰 (노트북할 때만) */}
        {activity === "laptop" && (
          <group position={[0, 0.02, 0]}>
            <Cylinder args={[0.27, 0.27, 0.06, 32]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#111" />
            </Cylinder>
            <Cylinder args={[0.1, 0.1, 0.08, 32]} position={[-0.27, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#e0e0e0" />
            </Cylinder>
            <Cylinder args={[0.1, 0.1, 0.08, 32]} position={[0.27, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#e0e0e0" />
            </Cylinder>
          </group>
        )}

        {/* 헤어밴드 (운동할 때만) */}
        {activity === "exercising" && (
          <Cylinder args={[0.265, 0.265, 0.08, 32]} position={[0, 0.12, -0.02]} castShadow>
            <meshStandardMaterial color="#1d3557" />
          </Cylinder>
        )}
      </group>

      {/* 몸통 */}
      <group position={[0, 0.25, 0]}>
        <RoundedBox args={[0.3, 0.35, 0.2]} radius={0.08} castShadow receiveShadow>
          <meshStandardMaterial color={shirtColor} roughness={0.9} />
        </RoundedBox>
        {/* 옷 디테일 (주머니나 로고) */}
        <Box args={[0.08, 0.08, 0.02]} position={[-0.08, 0.05, 0.1]}>
           <meshStandardMaterial color={activity === "exercising" ? "#fff" : "#a8dadc"} />
        </Box>
      </group>

      {/* 팔 & 손 */}
      <group ref={leftArmRef} position={[-0.2, 0.38, 0]}>
        <Cylinder args={[0.045, 0.04, 0.25, 16]} position={[0, -0.12, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </Cylinder>
        {/* 소매 */}
        <Cylinder args={[0.055, 0.05, 0.12, 16]} position={[0, -0.04, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={shirtColor} />
        </Cylinder>
        {/* 손 */}
        <Sphere args={[0.05, 16, 16]} position={[0, -0.26, 0]} castShadow>
          <meshStandardMaterial color={skinColor} />
        </Sphere>
      </group>
      
      <group ref={rightArmRef} position={[0.2, 0.38, 0]}>
        <Cylinder args={[0.045, 0.04, 0.25, 16]} position={[0, -0.12, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </Cylinder>
        <Cylinder args={[0.055, 0.05, 0.12, 16]} position={[0, -0.04, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={shirtColor} />
        </Cylinder>
        <Sphere args={[0.05, 16, 16]} position={[0, -0.26, 0]} castShadow>
          <meshStandardMaterial color={skinColor} />
        </Sphere>
      </group>

      {/* 다리 & 발 */}
      {activity === "exercising" ? (
        <>
          <group position={[-0.1, 0.05, 0]}>
            <Cylinder args={[0.06, 0.05, 0.25, 16]} position={[0, -0.12, 0]} castShadow receiveShadow>
              <meshStandardMaterial color={pantsColor} roughness={0.9} />
            </Cylinder>
            <RoundedBox args={[0.07, 0.05, 0.12]} position={[0, -0.26, 0.02]} radius={0.02} castShadow>
              <meshStandardMaterial color="#fff" />
            </RoundedBox>
          </group>
          <group position={[0.1, 0.05, 0]}>
            <Cylinder args={[0.06, 0.05, 0.25, 16]} position={[0, -0.12, 0]} castShadow receiveShadow>
              <meshStandardMaterial color={pantsColor} roughness={0.9} />
            </Cylinder>
            <RoundedBox args={[0.07, 0.05, 0.12]} position={[0, -0.26, 0.02]} radius={0.02} castShadow>
              <meshStandardMaterial color="#fff" />
            </RoundedBox>
          </group>
        </>
      ) : (
        <>
          {/* 앉아있는 다리 */}
          <group position={[-0.1, 0.1, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <Cylinder args={[0.06, 0.05, 0.25, 16]} position={[0, -0.12, 0]} castShadow receiveShadow>
              <meshStandardMaterial color={pantsColor} roughness={0.9} />
            </Cylinder>
            {/* 무릎 아래로 꺾인 부분 */}
            <group position={[0, -0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <Cylinder args={[0.05, 0.04, 0.25, 16]} position={[0, -0.12, 0]} castShadow receiveShadow>
                <meshStandardMaterial color={skinColor} />
              </Cylinder>
              <RoundedBox args={[0.07, 0.05, 0.12]} position={[0, -0.26, 0.02]} radius={0.02} castShadow>
                <meshStandardMaterial color="#fff" />
              </RoundedBox>
            </group>
          </group>
          <group position={[0.1, 0.1, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <Cylinder args={[0.06, 0.05, 0.25, 16]} position={[0, -0.12, 0]} castShadow receiveShadow>
              <meshStandardMaterial color={pantsColor} roughness={0.9} />
            </Cylinder>
            <group position={[0, -0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <Cylinder args={[0.05, 0.04, 0.25, 16]} position={[0, -0.12, 0]} castShadow receiveShadow>
                <meshStandardMaterial color={skinColor} />
              </Cylinder>
              <RoundedBox args={[0.07, 0.05, 0.12]} position={[0, -0.26, 0.02]} radius={0.02} castShadow>
                <meshStandardMaterial color="#fff" />
              </RoundedBox>
            </group>
          </group>
        </>
      )}
    </group>
  );
}

// 인터랙티브 존 래퍼
function InteractiveZone({ 
  position, 
  children, 
  zone, 
  activeZone, 
  onClick 
}: { 
  position: [number, number, number]; 
  children: React.ReactNode; 
  zone: ActiveZone;
  activeZone: ActiveZone;
  onClick: (zone: ActiveZone) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isActive = activeZone === zone;

  return (
    <group 
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); onClick(zone); }}
    >
      {/* 호버 시 바닥에 하이라이트 링 */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI/2, 0, 0]} visible={hovered || isActive}>
        <ringGeometry args={[1.6, 1.7, 64]} />
        <meshBasicMaterial color={isActive ? "#ffb703" : "#fff"} transparent opacity={0.8} />
      </mesh>
      {children}
    </group>
  );
}

function DioramaRoom({ reducedMotion = false, activeZone = "all", onZoneClick }: AboutSceneProps) {
  const handleZoneClick = (zone: ActiveZone) => {
    if (onZoneClick) onZoneClick(zone);
  };

  return (
    <group position={[0, -1, 0]}>
      {/* 감성적인 우드 바닥 (Floor) */}
      <Box args={[8, 0.4, 8]} position={[0, -0.2, 0]} receiveShadow>
        <meshStandardMaterial color="#c29d77" roughness={0.7} />
      </Box>
      
      {/* 따뜻한 크림색 벽 (Walls) */}
      <Box args={[0.4, 5, 8]} position={[-4.2, 2.5, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#fdfbf7" roughness={0.9} />
      </Box>
      <Box args={[8, 5, 0.4]} position={[0, 2.5, -4.2]} receiveShadow castShadow>
        <meshStandardMaterial color="#fdfbf7" roughness={0.9} />
      </Box>

      {/* 나무 몰딩 */}
      <Box args={[0.1, 0.4, 8]} position={[-3.95, 0.2, 0]} receiveShadow>
        <meshStandardMaterial color="#8b5e3c" roughness={0.8} />
      </Box>
      <Box args={[8, 0.4, 0.1]} position={[0, 0.2, -3.95]} receiveShadow>
        <meshStandardMaterial color="#8b5e3c" roughness={0.8} />
      </Box>

      {/* 큰 창문 (빛이 들어오는 느낌) */}
      <group position={[0, 2.5, -4]}>
        <Box args={[3.6, 2.6, 0.2]} position={[0, 0, 0]} castShadow>
          <meshStandardMaterial color="#fff" />
        </Box>
        {/* 창밖 풍경 (노을빛) */}
        <Box args={[3.4, 2.4, 0.05]} position={[0, 0, 0.05]}>
          <meshBasicMaterial color="#ffb703" />
        </Box>
        <Box args={[0.1, 2.4, 0.25]} position={[0, 0, 0.05]} castShadow>
          <meshStandardMaterial color="#fff" />
        </Box>
        <Box args={[3.4, 0.1, 0.25]} position={[0, 0, 0.05]} castShadow>
          <meshStandardMaterial color="#fff" />
        </Box>
      </group>

      {/* 포근한 러그 */}
      <Cylinder args={[3, 3, 0.04, 64]} position={[0, 0.02, 0]} receiveShadow>
        <meshStandardMaterial color="#e2e8f0" roughness={1} />
      </Cylinder>

      {/* 1. 노트북 존 (왼쪽 구석) - 방향 수정 및 디테일업 */}
      <InteractiveZone position={[-2.5, 0, -2.5]} zone="laptop" activeZone={activeZone} onClick={handleZoneClick}>
        {/* 책상 */}
        <RoundedBox args={[2.2, 0.1, 1.2]} position={[0, 1, 0]} radius={0.05} castShadow receiveShadow>
          <meshStandardMaterial color="#8b5e3c" roughness={0.7} />
        </RoundedBox>
        <Cylinder args={[0.06, 0.06, 1, 16]} position={[-0.9, 0.5, -0.4]} castShadow receiveShadow>
          <meshStandardMaterial color="#222" />
        </Cylinder>
        <Cylinder args={[0.06, 0.06, 1, 16]} position={[0.9, 0.5, -0.4]} castShadow receiveShadow>
          <meshStandardMaterial color="#222" />
        </Cylinder>
        <Cylinder args={[0.06, 0.06, 1, 16]} position={[-0.9, 0.5, 0.4]} castShadow receiveShadow>
          <meshStandardMaterial color="#222" />
        </Cylinder>
        <Cylinder args={[0.06, 0.06, 1, 16]} position={[0.9, 0.5, 0.4]} castShadow receiveShadow>
          <meshStandardMaterial color="#222" />
        </Cylinder>
        
        {/* 노트북 (화면이 +Z를 향함) */}
        <group position={[0, 1.05, 0]}>
          <RoundedBox args={[0.7, 0.03, 0.5]} position={[0, 0, 0]} radius={0.01} castShadow>
            <meshStandardMaterial color="#d1d5db" metalness={0.6} roughness={0.3} />
          </RoundedBox>
          <Box args={[0.6, 0.031, 0.25]} position={[0, 0, 0.05]}>
            <meshStandardMaterial color="#333" />
          </Box>
          {/* 상판(화면)이 뒤(-Z)에 달려있고 앞으로 열림 */}
          <group position={[0, 0.015, -0.25]} rotation={[-0.2, 0, 0]}>
            <RoundedBox args={[0.7, 0.5, 0.03]} position={[0, 0.25, 0]} radius={0.01} castShadow>
              <meshStandardMaterial color="#d1d5db" metalness={0.6} roughness={0.3} />
            </RoundedBox>
            <Box args={[0.66, 0.46, 0.031]} position={[0, 0.25, 0.001]}>
              <meshStandardMaterial color="#111" />
            </Box>
            <mesh position={[0, 0.25, 0.017]}>
              <planeGeometry args={[0.62, 0.42]} />
              <meshBasicMaterial color="#93c5fd" transparent opacity={0.8} />
            </mesh>
          </group>
        </group>

        {/* 감성 스탠드 조명 */}
        <group position={[-0.8, 1.05, -0.3]}>
          <Cylinder args={[0.12, 0.15, 0.05, 32]} castShadow>
            <meshStandardMaterial color="#eab308" />
          </Cylinder>
          <Cylinder args={[0.02, 0.02, 0.5, 16]} position={[0, 0.25, 0]} castShadow>
            <meshStandardMaterial color="#eab308" />
          </Cylinder>
          <Sphere args={[0.15, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} position={[0, 0.5, 0]} rotation={[0.5, 0, 0]} castShadow>
            <meshStandardMaterial color="#fff" side={2} />
          </Sphere>
          <pointLight position={[0, 0.4, 0.1]} intensity={0.8} color="#fef08a" distance={3} />
        </group>

        {/* 의자 */}
        <group position={[0, 0.5, 0.8]}>
          <Cylinder args={[0.05, 0.05, 0.5, 16]} position={[0, 0, 0]} castShadow>
             <meshStandardMaterial color="#333" />
          </Cylinder>
          <Cylinder args={[0.3, 0.3, 0.05, 32]} position={[0, -0.25, 0]} castShadow>
             <meshStandardMaterial color="#111" />
          </Cylinder>
          <RoundedBox args={[0.6, 0.1, 0.6]} position={[0, 0.25, 0]} radius={0.05} castShadow receiveShadow>
            <meshStandardMaterial color="#f4f4f5" />
          </RoundedBox>
          <RoundedBox args={[0.6, 0.6, 0.1]} position={[0, 0.55, 0.25]} radius={0.05} castShadow receiveShadow>
            <meshStandardMaterial color="#f4f4f5" />
          </RoundedBox>
        </group>
        
        {/* 노트북 아바타 (노트북을 바라보도록 180도 회전) */}
        <Avatar position={[0, 0.85, 0.7]} rotation={[0, Math.PI, 0]} activity="laptop" reducedMotion={reducedMotion} />
      </InteractiveZone>

      {/* 2. 독서 존 (오른쪽 벽면) */}
      <InteractiveZone position={[2.5, 0, -2.5]} zone="reading" activeZone={activeZone} onClick={handleZoneClick}>
        {/* 포근한 1인용 소파 */}
        <group position={[0, 0.3, 0]} rotation={[0, -Math.PI / 6, 0]}>
          <RoundedBox args={[1.4, 0.6, 1.4]} position={[0, 0, 0]} radius={0.2} castShadow receiveShadow>
            <meshStandardMaterial color="#e07a5f" roughness={0.9} />
          </RoundedBox>
          <RoundedBox args={[1.4, 1.2, 0.4]} position={[0, 0.4, -0.5]} radius={0.2} castShadow receiveShadow>
            <meshStandardMaterial color="#e07a5f" roughness={0.9} />
          </RoundedBox>
          <RoundedBox args={[0.3, 0.8, 1.2]} position={[-0.65, 0.2, 0.1]} radius={0.15} castShadow receiveShadow>
            <meshStandardMaterial color="#e07a5f" roughness={0.9} />
          </RoundedBox>
          <RoundedBox args={[0.3, 0.8, 1.2]} position={[0.65, 0.2, 0.1]} radius={0.15} castShadow receiveShadow>
            <meshStandardMaterial color="#e07a5f" roughness={0.9} />
          </RoundedBox>
          
          {/* 쿠션 */}
          <RoundedBox args={[0.6, 0.4, 0.2]} position={[0, 0.4, -0.2]} rotation={[0.2, 0, 0]} radius={0.1} castShadow>
            <meshStandardMaterial color="#f4a261" />
          </RoundedBox>

          {/* 독서 아바타 */}
          <Avatar position={[0, 0.35, 0.1]} activity="reading" reducedMotion={reducedMotion} />
          
          {/* 책 */}
          <group position={[0, 0.6, 0.4]} rotation={[0.2, 0, 0]}>
            <Box args={[0.5, 0.05, 0.35]} castShadow>
              <meshStandardMaterial color="#2a9d8f" />
            </Box>
            <Box args={[0.45, 0.06, 0.3]} position={[0, 0.01, 0]}>
              <meshStandardMaterial color="#fff" />
            </Box>
          </group>
        </group>

        {/* 장스탠드 (플로어 램프) */}
        <group position={[1.2, 0, -0.5]}>
          <Cylinder args={[0.2, 0.2, 0.05, 32]} position={[0, 0.025, 0]} castShadow>
            <meshStandardMaterial color="#333" />
          </Cylinder>
          <Cylinder args={[0.03, 0.03, 2.5, 16]} position={[0, 1.25, 0]} castShadow>
            <meshStandardMaterial color="#333" />
          </Cylinder>
          <Cylinder args={[0.3, 0.4, 0.5, 32]} position={[0, 2.5, 0]} castShadow>
            <meshStandardMaterial color="#fefae0" side={2} transparent opacity={0.9} />
          </Cylinder>
          <pointLight position={[0, 2.5, 0]} intensity={1.2} color="#ffedd5" distance={5} />
        </group>
      </InteractiveZone>

      {/* 3. 운동 존 (앞쪽) */}
      <InteractiveZone position={[1.5, 0, 2]} zone="exercising" activeZone={activeZone} onClick={handleZoneClick}>
        {/* 요가 매트 */}
        <RoundedBox args={[1.6, 0.04, 2.8]} position={[0, 0.02, 0]} radius={0.01} receiveShadow>
          <meshStandardMaterial color="#84a59d" roughness={0.9} />
        </RoundedBox>

        {/* 덤벨 세트 */}
        <group position={[-1.2, 0.1, 0.5]}>
          <group position={[0, 0, 0]}>
            <Cylinder args={[0.03, 0.03, 0.4]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#ccc" metalness={0.8} />
            </Cylinder>
            <Cylinder args={[0.15, 0.15, 0.1]} position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#111" />
            </Cylinder>
            <Cylinder args={[0.15, 0.15, 0.1]} position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#111" />
            </Cylinder>
          </group>
        </group>

        {/* 운동 아바타 */}
        <Avatar position={[0, 0.4, 0]} rotation={[0, -Math.PI / 4, 0]} activity="exercising" reducedMotion={reducedMotion} />
      </InteractiveZone>
      
      {/* 식물 (몬스테라 느낌) */}
      <group position={[-3.2, 0, 2.5]}>
        <Cylinder args={[0.4, 0.3, 0.8]} position={[0, 0.4, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#d4a373" roughness={0.8} />
        </Cylinder>
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.1}>
          <group position={[0, 1.2, 0]}>
            <Sphere args={[0.8, 16, 16]} position={[0, 0, 0]} castShadow receiveShadow>
              <meshStandardMaterial color="#52796f" roughness={0.8} />
            </Sphere>
            <Sphere args={[0.6, 16, 16]} position={[0.5, -0.2, 0.3]} castShadow receiveShadow>
              <meshStandardMaterial color="#52796f" roughness={0.8} />
            </Sphere>
            <Sphere args={[0.5, 16, 16]} position={[-0.4, -0.1, -0.4]} castShadow receiveShadow>
              <meshStandardMaterial color="#52796f" roughness={0.8} />
            </Sphere>
          </group>
        </Float>
      </group>

      {/* 디테일한 책장 */}
      <group position={[-3.8, 0, 0]}>
        <Box args={[0.6, 3.5, 2.5]} position={[0, 1.75, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#8b5e3c" />
        </Box>
        <Box args={[0.65, 0.05, 2.4]} position={[0, 1, 0]} castShadow><meshStandardMaterial color="#553d30" /></Box>
        <Box args={[0.65, 0.05, 2.4]} position={[0, 2, 0]} castShadow><meshStandardMaterial color="#553d30" /></Box>
        <Box args={[0.65, 0.05, 2.4]} position={[0, 3, 0]} castShadow><meshStandardMaterial color="#553d30" /></Box>

        {/* 책들 */}
        <group position={[0, 1.05, -0.8]}>
          <Box args={[0.4, 0.5, 0.1]} position={[0, 0.25, 0]} castShadow><meshStandardMaterial color="#e63946" /></Box>
          <Box args={[0.4, 0.6, 0.1]} position={[0, 0.3, 0.12]} castShadow><meshStandardMaterial color="#457b9d" /></Box>
          <Box args={[0.4, 0.55, 0.1]} position={[0, 0.275, 0.24]} castShadow><meshStandardMaterial color="#f4a261" /></Box>
        </group>
        <group position={[0, 2.05, 0.2]}>
          <Box args={[0.4, 0.4, 0.1]} position={[0, 0.2, 0]} castShadow><meshStandardMaterial color="#2a9d8f" /></Box>
          <Box args={[0.4, 0.4, 0.1]} position={[0, 0.2, 0.12]} castShadow><meshStandardMaterial color="#e9c46a" /></Box>
        </group>
        
        {/* 책장 위 작은 화분 */}
        <group position={[0, 3.05, -0.6]}>
          <Cylinder args={[0.15, 0.1, 0.2]} position={[0, 0.1, 0]} castShadow><meshStandardMaterial color="#fff" /></Cylinder>
          <Sphere args={[0.2]} position={[0, 0.3, 0]} castShadow><meshStandardMaterial color="#84a59d" /></Sphere>
        </group>
      </group>
    </group>
  );
}

function SceneContents({ reducedMotion = false, activeZone = "all", onZoneClick }: AboutSceneProps) {
  return (
    <>
      {/* 부드러운 그림자 효과 */}
      <SoftShadows size={15} samples={10} focus={0.5} />
      
      {/* 감성적인 조명 세팅 (Sunset Vibe) */}
      <ambientLight intensity={0.4} color="#fbbf24" />
      
      {/* 주 광원 (창문에서 들어오는 노을빛) */}
      <directionalLight
        castShadow
        position={[10, 8, -10]}
        intensity={2.5}
        color="#ffb703"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />
      
      {/* 보조 광원 (방 안을 부드럽게 채워주는 푸른/보라빛) */}
      <directionalLight position={[-5, 5, 5]} intensity={0.8} color="#a78bfa" />

      <DioramaRoom reducedMotion={reducedMotion} activeZone={activeZone} onZoneClick={onZoneClick} />
      
      <ContactShadows
        position={[0, -1.05, 0]}
        opacity={0.6}
        scale={25}
        blur={2.5}
        far={4}
        resolution={1024}
        color="#432818"
      />
      <CameraRig reducedMotion={reducedMotion} activeZone={activeZone} />
      <Environment preset="sunset" />
    </>
  );
}

export default function AboutScene({ reducedMotion = false, activeZone = "all", onZoneClick }: AboutSceneProps) {
  return (
    <div className="absolute inset-0 cursor-pointer" onClick={() => onZoneClick?.("all")}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [8, 7, 10], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <SceneContents reducedMotion={reducedMotion} activeZone={activeZone} onZoneClick={onZoneClick} />
        </Suspense>
      </Canvas>
    </div>
  );
}
