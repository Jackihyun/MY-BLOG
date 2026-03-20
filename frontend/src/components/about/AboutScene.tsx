"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, RoundedBox, Sphere, Cylinder, Box, Float, SoftShadows, Stars, Sky } from "@react-three/drei";
import { Suspense, useRef, useState, useMemo, useEffect } from "react";
import { Group, Mesh, Vector3, MathUtils, Color } from "three";

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
    const pointerX = reducedMotion ? 0 : pointer.x * 2;
    const pointerY = reducedMotion ? 0 : pointer.y * 2;
    targetPos.set(7.5 + pointerX, 6 + pointerY, 9);

    camera.position.lerp(targetPos, 0.04);
    currentLookAt.current.lerp(targetLookAt, 0.04);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

function MainAvatar({ 
  activeZone,
  reducedMotion = false,
  onArrival
}: { 
  activeZone: ActiveZone;
  reducedMotion?: boolean;
  onArrival?: (zone: ActiveZone) => void;
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
  const shirtColor = "#f1faee";
  const pantsColor = "#457b9d";

  const targetPos = useMemo(() => new Vector3(), []);
  const targetRot = useRef(0);
  
  // 도착 상태를 추적하기 위한 ref
  const hasArrived = useRef(false);
  const currentZone = useRef<ActiveZone>("all");

  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return;
    const t = state.clock.elapsedTime;

    // 존이 변경되었을 때 초기화
    if (currentZone.current !== activeZone) {
      hasArrived.current = false;
      currentZone.current = activeZone;
    }

    // 1. 상태에 따른 목표 위치 및 회전 설정
    // Y축(높이)을 바닥(0)에 맞추고, 의자/소파에 앉을 때만 살짝 올림
    if (activeZone === "all") {
      targetPos.set(0, 0, 0);
      targetRot.current = Math.PI / 4;
    } else if (activeZone === "laptop") {
      // 노트북 자리 (이동 중에는 바닥 높이(0), 도착하면 의자 높이(0.45)로)
      const isClose = groupRef.current.position.distanceTo(new Vector3(-2.5, groupRef.current.position.y, -1.8)) < 0.2;
      targetPos.set(-2.5, isClose ? 0.45 : 0, -1.8);
      targetRot.current = Math.PI;
    } else if (activeZone === "reading") {
      // 독서 자리 (이동 중에는 바닥 높이(0), 도착하면 소파 높이(0.35)로)
      const isClose = groupRef.current.position.distanceTo(new Vector3(2.5, groupRef.current.position.y, -2.4)) < 0.2;
      targetPos.set(2.5, isClose ? 0.35 : 0, -2.4);
      targetRot.current = -Math.PI / 6;
    } else if (activeZone === "exercising") {
      targetPos.set(1.5, 0, 2);
      targetRot.current = -Math.PI / 4;
    }

    // 2. 이동 및 회전 처리 (Y축 무시하고 평면 거리만 계산하여 이동 여부 판단)
    const currentPosXZ = new Vector3(groupRef.current.position.x, 0, groupRef.current.position.z);
    const targetPosXZ = new Vector3(targetPos.x, 0, targetPos.z);
    const distanceXZ = currentPosXZ.distanceTo(targetPosXZ);
    const isMoving = distanceXZ > 0.1;
    
    // 도착 이벤트 발생
    if (!isMoving && !hasArrived.current) {
      hasArrived.current = true;
      if (onArrival) onArrival(activeZone);
    }
    
    if (isMoving) {
      const dx = targetPos.x - groupRef.current.position.x;
      const dz = targetPos.z - groupRef.current.position.z;
      const moveRot = Math.atan2(dx, dz);
      
      let diff = moveRot - groupRef.current.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      groupRef.current.rotation.y += diff * 0.1;
      
      // 이동 중일 때는 Y축을 0으로 강제 유지 (붕 뜨는 현상 방지)
      groupRef.current.position.lerp(new Vector3(targetPos.x, 0, targetPos.z), 0.05);
    } else {
      let diff = targetRot.current - groupRef.current.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      groupRef.current.rotation.y += diff * 0.1;
      
      // 도착했을 때만 Y축(의자/소파 높이)까지 부드럽게 이동
      groupRef.current.position.lerp(targetPos, 0.1);
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
      if (bodyRef.current) bodyRef.current.position.y = 0.25 + Math.abs(Math.sin(t * 15)) * 0.05;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 15) * 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.sin(t * 15) * 0.6;
      if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.sin(t * 15) * 0.6;
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * 15) * 0.6;
    } else {
      if (activeZone === "all") {
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = Math.sin(t * 5) * 0.3 + 2.5;
          rightArmRef.current.rotation.x = 0;
        }
        if (leftArmRef.current) leftArmRef.current.rotation.z = 0.2;
        if (headRef.current) headRef.current.rotation.y = Math.sin(t * 2) * 0.1;
      } else if (activeZone === "laptop") {
        if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI / 2;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI / 2;
        if (leftKneeRef.current) leftKneeRef.current.rotation.x = Math.PI / 2;
        if (rightKneeRef.current) rightKneeRef.current.rotation.x = Math.PI / 2;
        
        if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 15) * 0.1 - 0.5;
        if (rightArmRef.current) rightArmRef.current.rotation.x = Math.cos(t * 15) * 0.1 - 0.5;
        if (headRef.current) headRef.current.rotation.y = Math.sin(t * 2) * 0.05;
      } else if (activeZone === "reading") {
        if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI / 2.2;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI / 2.2;
        if (leftKneeRef.current) leftKneeRef.current.rotation.x = Math.PI / 2.2;
        if (rightKneeRef.current) rightKneeRef.current.rotation.x = Math.PI / 2.2;
        
        if (leftArmRef.current) leftArmRef.current.rotation.z = 0.2;
        if (rightArmRef.current) rightArmRef.current.rotation.z = -0.2;
        if (headRef.current) headRef.current.rotation.x = Math.sin(t * 1) * 0.05 + 0.1;
      } else if (activeZone === "exercising") {
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
        <group ref={headRef} position={[0, 0.65, 0]}>
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

        <group position={[0, 0.2, 0]}>
          <RoundedBox args={[0.3, 0.4, 0.2]} radius={0.08} castShadow receiveShadow>
            <meshStandardMaterial color={shirtColor} roughness={0.9} />
          </RoundedBox>
        </group>

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

        <group ref={leftLegRef} position={[-0.1, 0, 0]}>
          <Cylinder args={[0.06, 0.05, 0.2, 16]} position={[0, -0.1, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={pantsColor} roughness={0.9} />
          </Cylinder>
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
          <Cylinder args={[0.06, 0.05, 0.2, 16]} position={[0, -0.1, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={pantsColor} roughness={0.9} />
          </Cylinder>
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

// 배경 환경 컴포넌트
function OutdoorEnvironment({ isNight }: { isNight: boolean }) {
  const skyColor = useRef(new Color());
  const groundColor = useRef(new Color());
  
  useFrame(() => {
    // 부드러운 색상 전환
    const targetSky = isNight ? new Color("#0f172a") : new Color("#fb923c");
    const targetGround = isNight ? new Color("#1e293b") : new Color("#d97706");
    
    skyColor.current.lerp(targetSky, 0.02);
    groundColor.current.lerp(targetGround, 0.02);
  });

  return (
    <group>
      {isNight ? (
        <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      ) : (
        <Sky distance={450000} sunPosition={[10, 2, -10]} inclination={0.49} azimuth={0.25} />
      )}
      
      {/* 먼 배경 바닥 (잔디/땅) */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial color={isNight ? "#0f172a" : "#7c9a6c"} />
      </mesh>
      
      {/* 창밖 나무들 */}
      <group position={[0, -1, -10]}>
        {[...Array(5)].map((_, i) => (
          <group key={i} position={[(i - 2) * 4 + Math.random() * 2, 0, Math.random() * -5]}>
            <Cylinder args={[0.2, 0.3, 3]} position={[0, 1.5, 0]}>
              <meshBasicMaterial color={isNight ? "#1e293b" : "#5d4037"} />
            </Cylinder>
            <Sphere args={[1.5, 16, 16]} position={[0, 3.5, 0]}>
              <meshBasicMaterial color={isNight ? "#0f172a" : "#386641"} />
            </Sphere>
            <Sphere args={[1.2, 16, 16]} position={[0.8, 3, 0.5]}>
              <meshBasicMaterial color={isNight ? "#0f172a" : "#2a5934"} />
            </Sphere>
          </group>
        ))}
      </group>
    </group>
  );
}

function DioramaRoom({ reducedMotion = false, activeZone = "all", onZoneClick, isLaptopMode }: AboutSceneProps & { isLaptopMode: boolean }) {
  const handleZoneClick = (zone: ActiveZone) => {
    if (onZoneClick) onZoneClick(zone);
  };

  return (
    <group position={[0, -1, 0]}>
      {/* 감성적인 우드 바닥 */}
      <Box args={[8, 0.4, 8]} position={[0, -0.2, 0]} receiveShadow>
        <meshStandardMaterial color="#b08968" roughness={0.8} />
      </Box>
      
      {/* 따뜻한 크림색 벽 */}
      <Box args={[0.4, 5, 8]} position={[-4.2, 2.5, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#fdfbf7" roughness={0.9} />
      </Box>
      
      {/* 뒷벽 (창문 뚫기 위해 여러 파트로 분할) */}
      <group position={[0, 2.5, -4.2]}>
        {/* 창문 위 */}
        <Box args={[8, 1.2, 0.4]} position={[0, 1.9, 0]} receiveShadow castShadow>
          <meshStandardMaterial color="#fdfbf7" roughness={0.9} />
        </Box>
        {/* 창문 아래 */}
        <Box args={[8, 1.2, 0.4]} position={[0, -1.9, 0]} receiveShadow castShadow>
          <meshStandardMaterial color="#fdfbf7" roughness={0.9} />
        </Box>
        {/* 창문 왼쪽 */}
        <Box args={[2, 2.6, 0.4]} position={[-3, 0, 0]} receiveShadow castShadow>
          <meshStandardMaterial color="#fdfbf7" roughness={0.9} />
        </Box>
        {/* 창문 오른쪽 */}
        <Box args={[2, 2.6, 0.4]} position={[3, 0, 0]} receiveShadow castShadow>
          <meshStandardMaterial color="#fdfbf7" roughness={0.9} />
        </Box>
      </group>

      {/* 나무 몰딩 */}
      <Box args={[0.1, 0.4, 8]} position={[-3.95, 0.2, 0]} receiveShadow>
        <meshStandardMaterial color="#7f5539" roughness={0.8} />
      </Box>
      <Box args={[8, 0.4, 0.1]} position={[0, 0.2, -3.95]} receiveShadow>
        <meshStandardMaterial color="#7f5539" roughness={0.8} />
      </Box>

      {/* 뚫린 창문 프레임 */}
      <group position={[0, 2.5, -4]}>
        {/* 창틀 (바깥쪽) */}
        <Box args={[4.2, 2.8, 0.2]} position={[0, 0, 0]} castShadow>
          <meshStandardMaterial color="#fff" />
        </Box>
        {/* 창틀 (안쪽 빈 공간을 위해 덮어씌움) */}
        <Box args={[4, 2.6, 0.25]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#000" colorWrite={false} depthWrite={false} />
        </Box>
        {/* 투명한 유리 */}
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[4, 2.6]} />
          <meshPhysicalMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.2} 
            roughness={0.1} 
            metalness={0.1}
            transmission={0.9}
            thickness={0.5}
          />
        </mesh>
        {/* 창살 */}
        <Box args={[0.1, 2.6, 0.1]} position={[0, 0, 0.05]} castShadow>
          <meshStandardMaterial color="#fff" />
        </Box>
        <Box args={[4, 0.1, 0.1]} position={[0, 0, 0.05]} castShadow>
          <meshStandardMaterial color="#fff" />
        </Box>
      </group>

      {/* 포근한 러그 */}
      <Cylinder args={[3, 3, 0.04, 64]} position={[0, 0.02, 0]} receiveShadow>
        <meshStandardMaterial color="#e2e8f0" roughness={1} />
      </Cylinder>

      {/* 1. 노트북 존 */}
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

        {/* 감성 스탠드 조명 */}
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

      {/* 2. 휴식 존 */}
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

      {/* 3. 운동 존 */}
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
    </group>
  );
}

function SceneContents({ reducedMotion = false, activeZone = "all", onZoneClick }: AboutSceneProps) {
  const [isLaptopMode, setIsLaptopMode] = useState(false);
  
  // 아바타가 도착했을 때만 조명을 바꾸기 위한 콜백
  const handleArrival = (zone: ActiveZone) => {
    setIsLaptopMode(zone === "laptop");
  };

  // 존이 바뀌면 일단 조명은 원래대로 (이동 중에는 밝게)
  useEffect(() => {
    if (activeZone !== "laptop") {
      setIsLaptopMode(false);
    }
  }, [activeZone]);

  return (
    <>
      <SoftShadows size={15} samples={10} focus={0.5} />
      
      {/* 바깥 풍경 (노을/밤하늘) */}
      <OutdoorEnvironment isNight={isLaptopMode} />
      
      {/* 메인 조명들 */}
      <ambientLight intensity={isLaptopMode ? 0.05 : 0.4} color={isLaptopMode ? "#1e1e2f" : "#fbbf24"} />
      
      <directionalLight
        castShadow
        position={[10, 8, -10]}
        intensity={isLaptopMode ? 0.1 : 2.5}
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
      
      <directionalLight position={[-5, 5, 5]} intensity={isLaptopMode ? 0.1 : 0.8} color="#a78bfa" />

      <DioramaRoom reducedMotion={reducedMotion} activeZone={activeZone} onZoneClick={onZoneClick} isLaptopMode={isLaptopMode} />
      
      <MainAvatar activeZone={activeZone} reducedMotion={reducedMotion} onArrival={handleArrival} />
      
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
