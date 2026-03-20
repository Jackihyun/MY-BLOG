"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, RoundedBox, Sphere, Cylinder, Box, Float, SoftShadows } from "@react-three/drei";
import { Suspense, useRef, useState, useMemo } from "react";
import { Group, Mesh, Vector3, MathUtils } from "three";

export type ActiveZone = "all" | "laptop" | "reading" | "exercising";

interface AboutSceneProps {
  reducedMotion?: boolean;
  activeZone?: ActiveZone;
  onZoneClick?: (zone: ActiveZone) => void;
}

// 카메라를 고정(전체 화면)으로 유지
function CameraRig({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const { camera, pointer } = useThree();
  const currentLookAt = useRef(new Vector3(0, 0.5, 0));
  const targetLookAt = new Vector3(0, 0.5, 0);
  const targetPos = new Vector3();

  useFrame(() => {
    // 마우스에 따라 살짝만 움직이도록 (전체 방 뷰 고정)
    const pointerX = reducedMotion ? 0 : pointer.x * 1.5;
    const pointerY = reducedMotion ? 0 : pointer.y * 1.5;
    targetPos.set(7.5 + pointerX, 6 + pointerY, 9);

    camera.position.lerp(targetPos, 0.04);
    currentLookAt.current.lerp(targetLookAt, 0.04);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

function MainAvatar({ 
  activeZone,
  reducedMotion = false 
}: { 
  activeZone: ActiveZone;
  reducedMotion?: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const leftKneeRef = useRef<Group>(null);
  const rightKneeRef = useRef<Group>(null);

  const skinColor = "#ffdfc4";
  const hairColor = "#3e2723";
  const shirtColor = "#f1faee"; // 옷 색상 고정
  const pantsColor = "#457b9d"; // 바지 색상 고정

  const targetPos = useMemo(() => new Vector3(), []);
  const targetRot = useRef(0);

  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return;
    const t = state.clock.elapsedTime;

    // 1. 상태에 따른 목표 위치 및 회전 설정
    if (activeZone === "all") {
      targetPos.set(0, 0, 0);
      targetRot.current = Math.PI / 4;
    } else if (activeZone === "laptop") {
      targetPos.set(-2.5, 0.45, -1.8); // 의자 높이에 맞게 Y축 조정
      targetRot.current = Math.PI;
    } else if (activeZone === "reading") {
      targetPos.set(2.5, 0.35, -2.4); // 소파 높이에 맞게 Y축 조정
      targetRot.current = -Math.PI / 6;
    } else if (activeZone === "exercising") {
      targetPos.set(1.5, 0, 2);
      targetRot.current = -Math.PI / 4;
    }

    // 2. 이동 및 회전 처리
    const isMoving = groupRef.current.position.distanceTo(targetPos) > 0.1;
    
    if (isMoving) {
      // 이동 중일 때는 목표 지점을 바라보도록 회전
      const dx = targetPos.x - groupRef.current.position.x;
      const dz = targetPos.z - groupRef.current.position.z;
      const moveRot = Math.atan2(dx, dz);
      
      let diff = moveRot - groupRef.current.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      groupRef.current.rotation.y += diff * 0.1;
      
      groupRef.current.position.lerp(targetPos, 0.05);
    } else {
      // 도착하면 최종 방향으로 회전
      let diff = targetRot.current - groupRef.current.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      groupRef.current.rotation.y += diff * 0.1;
    }

    // 3. 애니메이션 초기화
    if (headRef.current) headRef.current.rotation.set(0, 0, 0);
    if (leftArmRef.current) leftArmRef.current.rotation.set(0, 0, 0);
    if (rightArmRef.current) rightArmRef.current.rotation.set(0, 0, 0);
    if (leftLegRef.current) leftLegRef.current.rotation.set(0, 0, 0);
    if (rightLegRef.current) rightLegRef.current.rotation.set(0, 0, 0);
    if (leftKneeRef.current) leftKneeRef.current.rotation.set(0, 0, 0);
    if (rightKneeRef.current) rightKneeRef.current.rotation.set(0, 0, 0);
    if (bodyRef.current) bodyRef.current.position.y = 0.25;

    // 4. 상태별 애니메이션 적용
    if (isMoving) {
      // 걷는 애니메이션
      if (bodyRef.current) bodyRef.current.position.y = 0.25 + Math.abs(Math.sin(t * 15)) * 0.05;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 15) * 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.sin(t * 15) * 0.6;
      if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.sin(t * 15) * 0.6;
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * 15) * 0.6;
    } else {
      // 도착 후 활동 애니메이션
      if (activeZone === "all") {
        // 손 흔들기
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = Math.sin(t * 5) * 0.3 + 2.5;
          rightArmRef.current.rotation.x = 0;
        }
        if (leftArmRef.current) leftArmRef.current.rotation.z = 0.2;
        if (headRef.current) headRef.current.rotation.y = Math.sin(t * 2) * 0.1;
      } else if (activeZone === "laptop") {
        // 의자에 앉는 자세 (허벅지는 앞으로, 종아리는 아래로)
        if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI / 2;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI / 2;
        if (leftKneeRef.current) leftKneeRef.current.rotation.x = Math.PI / 2;
        if (rightKneeRef.current) rightKneeRef.current.rotation.x = Math.PI / 2;
        
        // 타이핑
        if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 15) * 0.1 - 0.5;
        if (rightArmRef.current) rightArmRef.current.rotation.x = Math.cos(t * 15) * 0.1 - 0.5;
        if (headRef.current) headRef.current.rotation.y = Math.sin(t * 2) * 0.05;
      } else if (activeZone === "reading") {
        // 소파에 앉는 자세 (휴식)
        if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI / 2.2;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI / 2.2;
        if (leftKneeRef.current) leftKneeRef.current.rotation.x = Math.PI / 2.2;
        if (rightKneeRef.current) rightKneeRef.current.rotation.x = Math.PI / 2.2;
        
        // 팔은 편안하게 내리고 고개만 살짝 까딱
        if (leftArmRef.current) leftArmRef.current.rotation.z = 0.2;
        if (rightArmRef.current) rightArmRef.current.rotation.z = -0.2;
        if (headRef.current) headRef.current.rotation.x = Math.sin(t * 1) * 0.05 + 0.1;
      } else if (activeZone === "exercising") {
        // 스쿼트
        const squat = Math.abs(Math.sin(t * 2.5)) * 0.2;
        if (bodyRef.current) bodyRef.current.position.y = 0.25 - squat;
        if (leftArmRef.current) leftArmRef.current.rotation.z = Math.sin(t * 2.5) * 0.6 + 0.6;
        if (rightArmRef.current) rightArmRef.current.rotation.z = -Math.sin(t * 2.5) * 0.6 - 0.6;
        if (headRef.current) headRef.current.rotation.x = Math.sin(t * 2.5) * 0.1;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        {/* 머리 */}
        <group ref={headRef} position={[0, 0.65, 0]}>
          {/* 목 (분리되지 않도록 몸통과 연결) */}
          <Cylinder args={[0.06, 0.08, 0.1]} position={[0, -0.15, 0]} castShadow>
            <meshStandardMaterial color={skinColor} />
          </Cylinder>
          <Sphere args={[0.26, 32, 32]} position={[0, 0.02, -0.03]} castShadow>
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </Sphere>
          <Sphere args={[0.24, 32, 32]} position={[0, -0.02, 0.04]} castShadow receiveShadow>
            <meshStandardMaterial color={skinColor} roughness={0.5} />
          </Sphere>
          <Sphere args={[0.025, 16, 16]} position={[-0.09, 0.02, 0.26]}>
            <meshBasicMaterial color="#222" />
          </Sphere>
          <Sphere args={[0.025, 16, 16]} position={[0.09, 0.02, 0.26]}>
            <meshBasicMaterial color="#222" />
          </Sphere>
          <Sphere args={[0.04, 16, 16]} position={[-0.13, -0.04, 0.24]}>
            <meshBasicMaterial color="#ff9999" transparent opacity={0.5} />
          </Sphere>
          <Sphere args={[0.04, 16, 16]} position={[0.13, -0.04, 0.24]}>
            <meshBasicMaterial color="#ff9999" transparent opacity={0.5} />
          </Sphere>
        </group>

        {/* 몸통 */}
        <group position={[0, 0.2, 0]}>
          <RoundedBox args={[0.3, 0.4, 0.2]} radius={0.08} castShadow receiveShadow>
            <meshStandardMaterial color={shirtColor} roughness={0.9} />
          </RoundedBox>
        </group>

        {/* 팔 */}
        <group ref={leftArmRef} position={[-0.2, 0.35, 0]}>
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
        
        <group ref={rightArmRef} position={[0.2, 0.35, 0]}>
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

        {/* 다리 (허벅지와 종아리 분리하여 자연스럽게 앉도록) */}
        <group ref={leftLegRef} position={[-0.1, 0, 0]}>
          {/* 허벅지 */}
          <Cylinder args={[0.06, 0.05, 0.2, 16]} position={[0, -0.1, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={pantsColor} roughness={0.9} />
          </Cylinder>
          {/* 종아리 및 발 */}
          <group ref={leftKneeRef} position={[0, -0.2, 0]}>
            <Cylinder args={[0.05, 0.04, 0.2, 16]} position={[0, -0.1, 0]} castShadow receiveShadow>
              <meshStandardMaterial color={skinColor} />
            </Cylinder>
            <RoundedBox args={[0.07, 0.05, 0.12]} position={[0, -0.2, 0.02]} radius={0.02} castShadow>
              <meshStandardMaterial color="#fff" />
            </RoundedBox>
          </group>
        </group>
        
        <group ref={rightLegRef} position={[0.1, 0, 0]}>
          {/* 허벅지 */}
          <Cylinder args={[0.06, 0.05, 0.2, 16]} position={[0, -0.1, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={pantsColor} roughness={0.9} />
          </Cylinder>
          {/* 종아리 및 발 */}
          <group ref={rightKneeRef} position={[0, -0.2, 0]}>
            <Cylinder args={[0.05, 0.04, 0.2, 16]} position={[0, -0.1, 0]} castShadow receiveShadow>
              <meshStandardMaterial color={skinColor} />
            </Cylinder>
            <RoundedBox args={[0.07, 0.05, 0.12]} position={[0, -0.2, 0.02]} radius={0.02} castShadow>
              <meshStandardMaterial color="#fff" />
            </RoundedBox>
          </group>
        </group>
      </group>
    </group>
  );
}

// 인터랙티브 존 래퍼 (호버 시 원 뜨는 것 제거, 클릭만 가능)
function InteractiveZone({ 
  position, 
  children, 
  zone, 
  onClick 
}: { 
  position: [number, number, number]; 
  children: React.ReactNode; 
  zone: ActiveZone;
  onClick: (zone: ActiveZone) => void;
}) {
  return (
    <group 
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); onClick(zone); }}
    >
      {children}
    </group>
  );
}

function DioramaRoom({ reducedMotion = false, activeZone = "all", onZoneClick }: AboutSceneProps) {
  const handleZoneClick = (zone: ActiveZone) => {
    if (onZoneClick) onZoneClick(zone);
  };

  // 노트북 모드일 때 메인 조명 끄기 위한 값
  const isLaptopMode = activeZone === "laptop";

  return (
    <group position={[0, -1, 0]}>
      {/* 감성적인 우드 바닥 (Floor) */}
      <Box args={[8, 0.4, 8]} position={[0, -0.2, 0]} receiveShadow>
        <meshStandardMaterial color="#b08968" roughness={0.8} />
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
        <meshStandardMaterial color="#7f5539" roughness={0.8} />
      </Box>
      <Box args={[8, 0.4, 0.1]} position={[0, 0.2, -3.95]} receiveShadow>
        <meshStandardMaterial color="#7f5539" roughness={0.8} />
      </Box>

      {/* 큰 창문 (빛이 들어오는 느낌) */}
      <group position={[0, 2.5, -4]}>
        <Box args={[3.6, 2.6, 0.2]} position={[0, 0, 0]} castShadow>
          <meshStandardMaterial color="#fff" />
        </Box>
        {/* 창밖 풍경 (밤하늘/노을) */}
        <Box args={[3.4, 2.4, 0.05]} position={[0, 0, 0.05]}>
          <meshBasicMaterial color={isLaptopMode ? "#1e1e2f" : "#ffb703"} />
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

      {/* 1. 노트북 존 (왼쪽 구석) */}
      <InteractiveZone position={[-2.5, 0, -2.5]} zone="laptop" onClick={handleZoneClick}>
        <RoundedBox args={[2.2, 0.1, 1.2]} position={[0, 1, 0]} radius={0.05} castShadow receiveShadow>
          <meshStandardMaterial color="#7f5539" roughness={0.7} />
        </RoundedBox>
        <Cylinder args={[0.06, 0.06, 1, 16]} position={[-0.9, 0.5, -0.4]} castShadow receiveShadow><meshStandardMaterial color="#222" /></Cylinder>
        <Cylinder args={[0.06, 0.06, 1, 16]} position={[0.9, 0.5, -0.4]} castShadow receiveShadow><meshStandardMaterial color="#222" /></Cylinder>
        <Cylinder args={[0.06, 0.06, 1, 16]} position={[-0.9, 0.5, 0.4]} castShadow receiveShadow><meshStandardMaterial color="#222" /></Cylinder>
        <Cylinder args={[0.06, 0.06, 1, 16]} position={[0.9, 0.5, 0.4]} castShadow receiveShadow><meshStandardMaterial color="#222" /></Cylinder>
        
        <group position={[0, 1.05, 0]}>
          <RoundedBox args={[0.7, 0.03, 0.5]} position={[0, 0, 0]} radius={0.01} castShadow>
            <meshStandardMaterial color="#d1d5db" metalness={0.6} roughness={0.3} />
          </RoundedBox>
          <Box args={[0.6, 0.031, 0.25]} position={[0, 0, 0.05]}>
            <meshStandardMaterial color="#333" />
          </Box>
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

        {/* 감성 스탠드 조명 (노트북 모드일 때만 켜짐) */}
        <group position={[-0.8, 1.05, -0.3]}>
          <Cylinder args={[0.12, 0.15, 0.05, 32]} castShadow><meshStandardMaterial color="#eab308" /></Cylinder>
          <Cylinder args={[0.02, 0.02, 0.5, 16]} position={[0, 0.25, 0]} castShadow><meshStandardMaterial color="#eab308" /></Cylinder>
          <Sphere args={[0.15, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} position={[0, 0.5, 0]} rotation={[0.5, 0, 0]} castShadow>
            <meshStandardMaterial color={isLaptopMode ? "#fef08a" : "#fff"} side={2} />
          </Sphere>
          {isLaptopMode && (
            <pointLight position={[0, 0.4, 0.1]} intensity={2.5} color="#fef08a" distance={4} />
          )}
        </group>

        <group position={[0, 0.5, 0.8]}>
          <Cylinder args={[0.05, 0.05, 0.5, 16]} position={[0, 0, 0]} castShadow><meshStandardMaterial color="#333" /></Cylinder>
          <Cylinder args={[0.3, 0.3, 0.05, 32]} position={[0, -0.25, 0]} castShadow><meshStandardMaterial color="#111" /></Cylinder>
          <RoundedBox args={[0.6, 0.1, 0.6]} position={[0, 0.25, 0]} radius={0.05} castShadow receiveShadow><meshStandardMaterial color="#f4f4f5" /></RoundedBox>
          <RoundedBox args={[0.6, 0.6, 0.1]} position={[0, 0.55, 0.25]} radius={0.05} castShadow receiveShadow><meshStandardMaterial color="#f4f4f5" /></RoundedBox>
        </group>
      </InteractiveZone>

      {/* 2. 휴식 존 (오른쪽 벽면) - 책 제거 */}
      <InteractiveZone position={[2.5, 0, -2.5]} zone="reading" onClick={handleZoneClick}>
        <group position={[0, 0.3, 0]} rotation={[0, -Math.PI / 6, 0]}>
          <RoundedBox args={[1.4, 0.6, 1.4]} position={[0, 0, 0]} radius={0.2} castShadow receiveShadow><meshStandardMaterial color="#e07a5f" roughness={0.9} /></RoundedBox>
          <RoundedBox args={[1.4, 1.2, 0.4]} position={[0, 0.4, -0.5]} radius={0.2} castShadow receiveShadow><meshStandardMaterial color="#e07a5f" roughness={0.9} /></RoundedBox>
          <RoundedBox args={[0.3, 0.8, 1.2]} position={[-0.65, 0.2, 0.1]} radius={0.15} castShadow receiveShadow><meshStandardMaterial color="#e07a5f" roughness={0.9} /></RoundedBox>
          <RoundedBox args={[0.3, 0.8, 1.2]} position={[0.65, 0.2, 0.1]} radius={0.15} castShadow receiveShadow><meshStandardMaterial color="#e07a5f" roughness={0.9} /></RoundedBox>
          <RoundedBox args={[0.6, 0.4, 0.2]} position={[0, 0.4, -0.2]} rotation={[0.2, 0, 0]} radius={0.1} castShadow><meshStandardMaterial color="#f4a261" /></RoundedBox>
        </group>

        <group position={[1.2, 0, -0.5]}>
          <Cylinder args={[0.2, 0.2, 0.05, 32]} position={[0, 0.025, 0]} castShadow><meshStandardMaterial color="#333" /></Cylinder>
          <Cylinder args={[0.03, 0.03, 2.5, 16]} position={[0, 1.25, 0]} castShadow><meshStandardMaterial color="#333" /></Cylinder>
          <Cylinder args={[0.3, 0.4, 0.5, 32]} position={[0, 2.5, 0]} castShadow><meshStandardMaterial color="#fefae0" side={2} transparent opacity={0.9} /></Cylinder>
          {!isLaptopMode && <pointLight position={[0, 2.5, 0]} intensity={1.2} color="#ffedd5" distance={5} />}
        </group>
      </InteractiveZone>

      {/* 3. 운동 존 (앞쪽) */}
      <InteractiveZone position={[1.5, 0, 2]} zone="exercising" onClick={handleZoneClick}>
        <group position={[-1.2, 0.1, 0.5]}>
          <group position={[0, 0, 0]}>
            <Cylinder args={[0.03, 0.03, 0.4]} rotation={[0, 0, Math.PI / 2]} castShadow><meshStandardMaterial color="#ccc" metalness={0.8} /></Cylinder>
            <Cylinder args={[0.15, 0.15, 0.1]} position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><meshStandardMaterial color="#111" /></Cylinder>
            <Cylinder args={[0.15, 0.15, 0.1]} position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><meshStandardMaterial color="#111" /></Cylinder>
          </group>
        </group>
      </InteractiveZone>
      
      <group position={[-3.2, 0, 2.5]}>
        <Cylinder args={[0.4, 0.3, 0.8]} position={[0, 0.4, 0]} castShadow receiveShadow><meshStandardMaterial color="#d4a373" roughness={0.8} /></Cylinder>
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.1}>
          <group position={[0, 1.2, 0]}>
            <Sphere args={[0.8, 16, 16]} position={[0, 0, 0]} castShadow receiveShadow><meshStandardMaterial color="#52796f" roughness={0.8} /></Sphere>
            <Sphere args={[0.6, 16, 16]} position={[0.5, -0.2, 0.3]} castShadow receiveShadow><meshStandardMaterial color="#52796f" roughness={0.8} /></Sphere>
            <Sphere args={[0.5, 16, 16]} position={[-0.4, -0.1, -0.4]} castShadow receiveShadow><meshStandardMaterial color="#52796f" roughness={0.8} /></Sphere>
          </group>
        </Float>
      </group>

      <group position={[-3.8, 0, 0]}>
        <Box args={[0.6, 3.5, 2.5]} position={[0, 1.75, 0]} castShadow receiveShadow><meshStandardMaterial color="#7f5539" /></Box>
        <Box args={[0.65, 0.05, 2.4]} position={[0, 1, 0]} castShadow><meshStandardMaterial color="#553d30" /></Box>
        <Box args={[0.65, 0.05, 2.4]} position={[0, 2, 0]} castShadow><meshStandardMaterial color="#553d30" /></Box>
        <Box args={[0.65, 0.05, 2.4]} position={[0, 3, 0]} castShadow><meshStandardMaterial color="#553d30" /></Box>

        <group position={[0, 1.05, -0.8]}>
          <Box args={[0.4, 0.5, 0.1]} position={[0, 0.25, 0]} castShadow><meshStandardMaterial color="#e63946" /></Box>
          <Box args={[0.4, 0.6, 0.1]} position={[0, 0.3, 0.12]} castShadow><meshStandardMaterial color="#457b9d" /></Box>
          <Box args={[0.4, 0.55, 0.1]} position={[0, 0.275, 0.24]} castShadow><meshStandardMaterial color="#f4a261" /></Box>
        </group>
        <group position={[0, 2.05, 0.2]}>
          <Box args={[0.4, 0.4, 0.1]} position={[0, 0.2, 0]} castShadow><meshStandardMaterial color="#2a9d8f" /></Box>
          <Box args={[0.4, 0.4, 0.1]} position={[0, 0.2, 0.12]} castShadow><meshStandardMaterial color="#e9c46a" /></Box>
        </group>
        
        <group position={[0, 3.05, -0.6]}>
          <Cylinder args={[0.15, 0.1, 0.2]} position={[0, 0.1, 0]} castShadow><meshStandardMaterial color="#fff" /></Cylinder>
          <Sphere args={[0.2]} position={[0, 0.3, 0]} castShadow><meshStandardMaterial color="#84a59d" /></Sphere>
        </group>
      </group>

      <MainAvatar activeZone={activeZone} reducedMotion={reducedMotion} />
    </group>
  );
}

function SceneContents({ reducedMotion = false, activeZone = "all", onZoneClick }: AboutSceneProps) {
  const isLaptopMode = activeZone === "laptop";

  return (
    <>
      <SoftShadows size={15} samples={10} focus={0.5} />
      
      {/* 노트북 모드일 때는 전체 조명을 어둡게(밤 분위기), 아닐 때는 노을빛 유지 */}
      <ambientLight intensity={isLaptopMode ? 0.1 : 0.4} color={isLaptopMode ? "#1e1e2f" : "#fbbf24"} />
      
      <directionalLight
        castShadow
        position={[10, 8, -10]}
        intensity={isLaptopMode ? 0.2 : 2.5}
        color={isLaptopMode ? "#3b82f6" : "#ffb703"}
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
      
      <directionalLight position={[-5, 5, 5]} intensity={isLaptopMode ? 0.2 : 0.8} color="#a78bfa" />

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
      <CameraRig reducedMotion={reducedMotion} />
      <Environment preset={isLaptopMode ? "night" : "sunset"} />
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
