"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, RoundedBox, Sphere, Cylinder, Box, Float } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import { Group, Mesh, Vector3, MathUtils } from "three";

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
    // 목표 위치와 바라보는 곳 설정
    if (activeZone === "laptop") {
      targetPos.set(-1.5, 2.5, 0.5);
      targetLookAt.set(-2.5, 0.8, -2.5);
    } else if (activeZone === "reading") {
      targetPos.set(1.5, 2.5, 0.5);
      targetLookAt.set(2.5, 0.5, -2.5);
    } else if (activeZone === "exercising") {
      targetPos.set(1.5, 2.0, 4.5);
      targetLookAt.set(1.5, 0.3, 2);
    } else {
      // 'all' 상태일 때 마우스 포인터에 따라 약간 움직임
      const pointerX = reducedMotion ? 0 : pointer.x * 1.5;
      const pointerY = reducedMotion ? 0 : pointer.y * 1.5;
      targetPos.set(8 + pointerX, 7 + pointerY, 10);
      targetLookAt.set(0, 0.5, 0);
    }

    // 부드러운 이동 (Lerp)
    camera.position.lerp(targetPos, 0.04);
    currentLookAt.current.lerp(targetLookAt, 0.04);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

// 아바타 컴포넌트 (디테일 업그레이드)
function Avatar({ 
  position, 
  rotation = [0, 0, 0], 
  activity, 
  color = "#ffb347",
  reducedMotion = false 
}: { 
  position: [number, number, number]; 
  rotation?: [number, number, number]; 
  activity: "reading" | "exercising" | "laptop";
  color?: string;
  reducedMotion?: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return;
    const t = state.clock.elapsedTime;

    if (activity === "laptop") {
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 15) * 0.1 - 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.cos(t * 15) * 0.1 - 0.6;
      if (headRef.current) headRef.current.rotation.y = Math.sin(t * 2) * 0.05;
    } else if (activity === "reading") {
      if (headRef.current) headRef.current.rotation.x = Math.sin(t * 1.5) * 0.05 + 0.15;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.9;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.9;
    } else if (activity === "exercising") {
      const squat = Math.abs(Math.sin(t * 2.5)) * 0.25;
      groupRef.current.position.y = position[1] - squat;
      if (leftArmRef.current) leftArmRef.current.rotation.z = Math.sin(t * 2.5) * 0.6 + 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.z = -Math.sin(t * 2.5) * 0.6 - 0.6;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* 머리 그룹 */}
      <group ref={headRef} position={[0, 0.6, 0]}>
        <Sphere args={[0.25, 32, 32]} castShadow receiveShadow>
          <meshStandardMaterial color={color} roughness={0.5} />
        </Sphere>
        {/* 눈 */}
        <Sphere args={[0.03, 16, 16]} position={[-0.08, 0.05, 0.22]}>
          <meshBasicMaterial color="#222" />
        </Sphere>
        <Sphere args={[0.03, 16, 16]} position={[0.08, 0.05, 0.22]}>
          <meshBasicMaterial color="#222" />
        </Sphere>
        {/* 볼터치 */}
        <Sphere args={[0.04, 16, 16]} position={[-0.12, -0.02, 0.2]}>
          <meshBasicMaterial color="#ff8888" transparent opacity={0.6} />
        </Sphere>
        <Sphere args={[0.04, 16, 16]} position={[0.12, -0.02, 0.2]}>
          <meshBasicMaterial color="#ff8888" transparent opacity={0.6} />
        </Sphere>
        
        {/* 악세사리 */}
        {activity === "laptop" && (
          <group position={[0, 0, 0]}>
            {/* 헤드폰 */}
            <Cylinder args={[0.26, 0.26, 0.08, 32]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#333" />
            </Cylinder>
            <Cylinder args={[0.08, 0.08, 0.05, 16]} position={[-0.26, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#f4a261" />
            </Cylinder>
            <Cylinder args={[0.08, 0.08, 0.05, 16]} position={[0.26, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#f4a261" />
            </Cylinder>
          </group>
        )}
        {activity === "exercising" && (
          <group>
            {/* 헤어밴드 */}
            <Cylinder args={[0.255, 0.255, 0.06, 32]} position={[0, 0.1, 0]} castShadow>
              <meshStandardMaterial color="#e63946" />
            </Cylinder>
          </group>
        )}
      </group>

      {/* 몸통 */}
      <group position={[0, 0.2, 0]}>
        <Cylinder args={[0.16, 0.2, 0.4, 32]} castShadow receiveShadow>
          <meshStandardMaterial color={activity === "exercising" ? "#e63946" : "#457b9d"} roughness={0.8} />
        </Cylinder>
        {/* 옷 디테일 (카라/로고 등) */}
        <Box args={[0.1, 0.1, 0.1]} position={[0, 0.1, 0.16]} rotation={[0, 0, Math.PI/4]}>
           <meshStandardMaterial color="#fff" />
        </Box>
      </group>

      {/* 팔 */}
      <group ref={leftArmRef} position={[-0.22, 0.35, 0]}>
        <Cylinder args={[0.05, 0.04, 0.3, 16]} position={[0, -0.15, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={color} roughness={0.6} />
        </Cylinder>
      </group>
      <group ref={rightArmRef} position={[0.22, 0.35, 0]}>
        <Cylinder args={[0.05, 0.04, 0.3, 16]} position={[0, -0.15, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={color} roughness={0.6} />
        </Cylinder>
      </group>

      {/* 다리 */}
      {activity === "exercising" ? (
        <>
          <Cylinder args={[0.06, 0.05, 0.3, 16]} position={[-0.1, -0.15, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#1d3557" roughness={0.8} />
          </Cylinder>
          <Cylinder args={[0.06, 0.05, 0.3, 16]} position={[0.1, -0.15, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#1d3557" roughness={0.8} />
          </Cylinder>
        </>
      ) : (
        <>
          <Cylinder args={[0.06, 0.05, 0.3, 16]} position={[-0.1, -0.05, 0.15]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#1d3557" roughness={0.8} />
          </Cylinder>
          <Cylinder args={[0.06, 0.05, 0.3, 16]} position={[0.1, -0.05, 0.15]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#1d3557" roughness={0.8} />
          </Cylinder>
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
        <ringGeometry args={[1.5, 1.6, 32]} />
        <meshBasicMaterial color={isActive ? "#f4a261" : "#a8dadc"} transparent opacity={0.6} />
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
      {/* 바닥 (Floor) */}
      <Box args={[8, 0.4, 8]} position={[0, -0.2, 0]} receiveShadow>
        <meshStandardMaterial color="#e8d5c4" roughness={0.8} />
      </Box>
      
      {/* 왼쪽 벽 (Left Wall) */}
      <Box args={[0.4, 5, 8]} position={[-4.2, 2.5, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#f4efe6" roughness={0.9} />
      </Box>
      
      {/* 뒤쪽 벽 (Back Wall) */}
      <Box args={[8, 5, 0.4]} position={[0, 2.5, -4.2]} receiveShadow castShadow>
        <meshStandardMaterial color="#eaddce" roughness={0.9} />
      </Box>

      {/* 몰딩 (Skirting boards) */}
      <Box args={[0.1, 0.3, 8]} position={[-3.95, 0.15, 0]} receiveShadow>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      <Box args={[8, 0.3, 0.1]} position={[0, 0.15, -3.95]} receiveShadow>
        <meshStandardMaterial color="#ffffff" />
      </Box>

      {/* 중앙 러그 (Rug) - 패턴 추가 */}
      <Cylinder args={[2.8, 2.8, 0.04, 64]} position={[0, 0.02, 0]} receiveShadow>
        <meshStandardMaterial color="#f1faee" roughness={1} />
      </Cylinder>
      <Cylinder args={[2.5, 2.5, 0.05, 64]} position={[0, 0.025, 0]} receiveShadow>
        <meshStandardMaterial color="#a8dadc" roughness={1} />
      </Cylinder>

      {/* 포스터 (벽 장식) */}
      <group position={[-3.9, 3, 1]}>
        <Box args={[0.05, 1.2, 0.8]} castShadow>
          <meshStandardMaterial color="#111" />
        </Box>
        <Box args={[0.06, 1.1, 0.7]} position={[0.01, 0, 0]}>
          <meshBasicMaterial color="#e63946" />
        </Box>
      </group>
      <group position={[2, 3, -3.9]}>
        <Box args={[1.5, 1, 0.05]} castShadow>
          <meshStandardMaterial color="#ddd" />
        </Box>
        <Box args={[1.4, 0.9, 0.06]} position={[0, 0, 0.01]}>
          <meshBasicMaterial color="#457b9d" />
        </Box>
      </group>

      {/* 1. 노트북 존 (왼쪽 구석) */}
      <InteractiveZone position={[-2.5, 0, -2.5]} zone="laptop" activeZone={activeZone} onClick={handleZoneClick}>
        {/* 책상 (디테일 업그레이드) */}
        <RoundedBox args={[2, 0.1, 1.2]} position={[0, 1, 0]} radius={0.05} castShadow receiveShadow>
          <meshStandardMaterial color="#d4a373" roughness={0.7} />
        </RoundedBox>
        {/* 책상 다리 */}
        <Cylinder args={[0.05, 0.05, 1, 16]} position={[-0.9, 0.5, -0.5]} castShadow receiveShadow>
          <meshStandardMaterial color="#333" />
        </Cylinder>
        <Cylinder args={[0.05, 0.05, 1, 16]} position={[0.9, 0.5, -0.5]} castShadow receiveShadow>
          <meshStandardMaterial color="#333" />
        </Cylinder>
        <Cylinder args={[0.05, 0.05, 1, 16]} position={[-0.9, 0.5, 0.5]} castShadow receiveShadow>
          <meshStandardMaterial color="#333" />
        </Cylinder>
        <Cylinder args={[0.05, 0.05, 1, 16]} position={[0.9, 0.5, 0.5]} castShadow receiveShadow>
          <meshStandardMaterial color="#333" />
        </Cylinder>
        
        {/* 노트북 (모던한 디자인) */}
        <group position={[0, 1.05, 0]} rotation={[0, 0.2, 0]}>
          {/* 하판 */}
          <RoundedBox args={[0.7, 0.03, 0.5]} position={[0, 0, 0]} radius={0.01} castShadow>
            <meshStandardMaterial color="#e0e0e0" metalness={0.8} roughness={0.2} />
          </RoundedBox>
          {/* 키보드 부분 */}
          <Box args={[0.6, 0.031, 0.25]} position={[0, 0, -0.05]}>
            <meshStandardMaterial color="#333" />
          </Box>
          {/* 상판(화면) */}
          <group position={[0, 0.015, -0.25]} rotation={[-0.2, 0, 0]}>
            <RoundedBox args={[0.7, 0.5, 0.03]} position={[0, 0.25, 0]} radius={0.01} castShadow>
              <meshStandardMaterial color="#e0e0e0" metalness={0.8} roughness={0.2} />
            </RoundedBox>
            {/* 베젤 & 화면 */}
            <Box args={[0.66, 0.46, 0.031]} position={[0, 0.25, 0.001]}>
              <meshStandardMaterial color="#111" />
            </Box>
            {/* 화면 빛 */}
            <mesh position={[0, 0.25, 0.017]}>
              <planeGeometry args={[0.62, 0.42]} />
              <meshBasicMaterial color="#60a5fa" transparent opacity={0.9} />
            </mesh>
          </group>
        </group>

        {/* 커피잔 */}
        <group position={[0.7, 1.1, -0.2]}>
          <Cylinder args={[0.06, 0.05, 0.12, 32]} castShadow>
            <meshStandardMaterial color="#fff" />
          </Cylinder>
          <Cylinder args={[0.05, 0.05, 0.121, 32]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#3e2723" />
          </Cylinder>
        </group>

        {/* 스탠드 조명 */}
        <group position={[-0.8, 1.05, -0.3]}>
          <Cylinder args={[0.1, 0.1, 0.05, 32]} castShadow>
            <meshStandardMaterial color="#333" />
          </Cylinder>
          <Cylinder args={[0.02, 0.02, 0.4, 16]} position={[0, 0.2, 0]} castShadow>
            <meshStandardMaterial color="#333" />
          </Cylinder>
          <Sphere args={[0.1, 16, 16]} position={[0.1, 0.4, 0]} castShadow>
            <meshStandardMaterial color="#333" />
          </Sphere>
          <spotLight position={[0.1, 0.4, 0]} target-position={[0, 0, 0]} angle={0.5} penumbra={0.5} intensity={2} color="#fef08a" castShadow />
        </group>

        {/* 의자 (게이밍 체어 느낌) */}
        <group position={[0, 0.5, 0.8]}>
          <Cylinder args={[0.05, 0.05, 0.5, 16]} position={[0, 0, 0]} castShadow>
             <meshStandardMaterial color="#333" />
          </Cylinder>
          <Cylinder args={[0.3, 0.3, 0.05, 32]} position={[0, -0.25, 0]} castShadow>
             <meshStandardMaterial color="#111" />
          </Cylinder>
          <RoundedBox args={[0.6, 0.1, 0.6]} position={[0, 0.25, 0]} radius={0.05} castShadow receiveShadow>
            <meshStandardMaterial color="#1f2937" />
          </RoundedBox>
          <RoundedBox args={[0.6, 0.8, 0.1]} position={[0, 0.65, 0.25]} radius={0.05} castShadow receiveShadow>
            <meshStandardMaterial color="#1f2937" />
          </RoundedBox>
        </group>
        
        {/* 노트북 아바타 */}
        <Avatar position={[0, 0.8, 0.8]} activity="laptop" color="#ffb347" reducedMotion={reducedMotion} />
      </InteractiveZone>

      {/* 2. 독서 존 (오른쪽 벽면) */}
      <InteractiveZone position={[2.5, 0, -2.5]} zone="reading" activeZone={activeZone} onClick={handleZoneClick}>
        {/* 소파 (더 푹신하게) */}
        <group position={[0, 0.3, 0]}>
          <RoundedBox args={[2.6, 0.6, 1.4]} position={[0, 0, 0]} radius={0.15} castShadow receiveShadow>
            <meshStandardMaterial color="#e07a5f" roughness={0.9} />
          </RoundedBox>
          <RoundedBox args={[2.6, 1.2, 0.4]} position={[0, 0.3, -0.5]} radius={0.15} castShadow receiveShadow>
            <meshStandardMaterial color="#e07a5f" roughness={0.9} />
          </RoundedBox>
          <RoundedBox args={[0.4, 0.8, 1.4]} position={[-1.1, 0.1, 0]} radius={0.15} castShadow receiveShadow>
            <meshStandardMaterial color="#e07a5f" roughness={0.9} />
          </RoundedBox>
          <RoundedBox args={[0.4, 0.8, 1.4]} position={[1.1, 0.1, 0]} radius={0.15} castShadow receiveShadow>
            <meshStandardMaterial color="#e07a5f" roughness={0.9} />
          </RoundedBox>
          
          {/* 쿠션 */}
          <RoundedBox args={[0.6, 0.4, 0.2]} position={[-0.6, 0.4, -0.2]} rotation={[0.2, 0.2, 0]} radius={0.1} castShadow>
            <meshStandardMaterial color="#f4a261" />
          </RoundedBox>
        </group>

        {/* 책 (펼쳐진 책 디테일) */}
        <group position={[0.5, 0.65, 0]} rotation={[0, -0.2, 0]}>
          <Box args={[0.5, 0.05, 0.35]} castShadow>
            <meshStandardMaterial color="#2a9d8f" />
          </Box>
          <Box args={[0.45, 0.06, 0.3]} position={[0, 0.01, 0]}>
            <meshStandardMaterial color="#fff" />
          </Box>
        </group>

        {/* 독서 아바타 */}
        <Avatar position={[-0.3, 0.65, 0.1]} rotation={[0, 0.3, 0]} activity="reading" color="#f4a261" reducedMotion={reducedMotion} />
      </InteractiveZone>

      {/* 3. 운동 존 (앞쪽) */}
      <InteractiveZone position={[1.5, 0, 2]} zone="exercising" activeZone={activeZone} onClick={handleZoneClick}>
        {/* 요가 매트 (두께감) */}
        <RoundedBox args={[1.6, 0.04, 2.8]} position={[0, 0.02, 0]} radius={0.01} receiveShadow>
          <meshStandardMaterial color="#2a9d8f" roughness={0.9} />
        </RoundedBox>

        {/* 덤벨 세트 */}
        <group position={[-1.2, 0.1, 0.5]}>
          {/* 덤벨 1 */}
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
          {/* 덤벨 2 */}
          <group position={[0, 0, 0.5]}>
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

        {/* 폼롤러 */}
        <Cylinder args={[0.15, 0.15, 0.8, 32]} position={[1.2, 0.15, -0.5]} rotation={[Math.PI/2, 0, 0]} castShadow>
          <meshStandardMaterial color="#e07a5f" />
        </Cylinder>

        {/* 운동 아바타 */}
        <Avatar position={[0, 0.3, 0]} rotation={[0, -Math.PI / 4, 0]} activity="exercising" color="#e9c46a" reducedMotion={reducedMotion} />
      </InteractiveZone>
      
      {/* 화분 장식 (왼쪽 앞 - 퀄리티 업) */}
      <group position={[-3, 0, 2.5]}>
        <Cylinder args={[0.4, 0.3, 0.8]} position={[0, 0.4, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#e76f51" roughness={0.8} />
        </Cylinder>
        {/* 잎사귀들 */}
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.1}>
          <group position={[0, 1, 0]}>
            <Sphere args={[0.7, 16, 16]} position={[0, 0, 0]} castShadow receiveShadow>
              <meshStandardMaterial color="#2a9d8f" roughness={0.8} />
            </Sphere>
            <Sphere args={[0.5, 16, 16]} position={[0.4, -0.2, 0.2]} castShadow receiveShadow>
              <meshStandardMaterial color="#2a9d8f" roughness={0.8} />
            </Sphere>
            <Sphere args={[0.4, 16, 16]} position={[-0.3, -0.1, -0.3]} castShadow receiveShadow>
              <meshStandardMaterial color="#2a9d8f" roughness={0.8} />
            </Sphere>
            <Sphere args={[0.45, 16, 16]} position={[0.1, 0.4, -0.2]} castShadow receiveShadow>
              <meshStandardMaterial color="#2a9d8f" roughness={0.8} />
            </Sphere>
          </group>
        </Float>
      </group>

      {/* 책장 (왼쪽 벽) */}
      <group position={[-3.8, 0, 0]}>
        <Box args={[0.6, 3.5, 2.5]} position={[0, 1.75, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#8c6b5d" />
        </Box>
        {/* 선반 칸막이 */}
        <Box args={[0.65, 0.05, 2.4]} position={[0, 1, 0]} castShadow>
          <meshStandardMaterial color="#553d30" />
        </Box>
        <Box args={[0.65, 0.05, 2.4]} position={[0, 2, 0]} castShadow>
          <meshStandardMaterial color="#553d30" />
        </Box>
        <Box args={[0.65, 0.05, 2.4]} position={[0, 3, 0]} castShadow>
          <meshStandardMaterial color="#553d30" />
        </Box>

        {/* 책들 (그룹화) */}
        <group position={[0, 1.05, -0.8]}>
          <Box args={[0.4, 0.5, 0.1]} position={[0, 0.25, 0]} castShadow><meshStandardMaterial color="#e63946" /></Box>
          <Box args={[0.4, 0.6, 0.1]} position={[0, 0.3, 0.12]} castShadow><meshStandardMaterial color="#457b9d" /></Box>
          <Box args={[0.4, 0.55, 0.1]} position={[0, 0.275, 0.24]} castShadow><meshStandardMaterial color="#f4a261" /></Box>
          <Box args={[0.4, 0.5, 0.1]} position={[0, 0.25, 0.36]} rotation={[0.1, 0, 0]} castShadow><meshStandardMaterial color="#2a9d8f" /></Box>
        </group>
        <group position={[0, 2.05, 0.2]}>
          <Box args={[0.4, 0.4, 0.1]} position={[0, 0.2, 0]} castShadow><meshStandardMaterial color="#2a9d8f" /></Box>
          <Box args={[0.4, 0.4, 0.1]} position={[0, 0.2, 0.12]} castShadow><meshStandardMaterial color="#e9c46a" /></Box>
          <Box args={[0.4, 0.45, 0.1]} position={[0, 0.225, 0.24]} castShadow><meshStandardMaterial color="#e63946" /></Box>
        </group>
        {/* 소품 */}
        <Sphere args={[0.2, 16, 16]} position={[0, 2.25, -0.6]} castShadow>
          <meshStandardMaterial color="#fff" metalness={0.5} />
        </Sphere>
      </group>
    </group>
  );
}

function SceneContents({ reducedMotion = false, activeZone = "all", onZoneClick }: AboutSceneProps) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight
        castShadow
        position={[8, 12, 8]}
        intensity={1.5}
        color="#fff7ee"
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
      <pointLight position={[-2, 4, -2]} intensity={0.6} color="#ffd9a8" />
      <pointLight position={[2, 4, 2]} intensity={0.4} color="#dbeafe" />

      <DioramaRoom reducedMotion={reducedMotion} activeZone={activeZone} onZoneClick={onZoneClick} />
      
      <ContactShadows
        position={[0, -1.05, 0]}
        opacity={0.5}
        scale={25}
        blur={2.5}
        far={4}
        resolution={1024}
        color="#8f6f57"
      />
      <CameraRig reducedMotion={reducedMotion} activeZone={activeZone} />
      <Environment preset="city" />
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
