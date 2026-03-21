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
  
  const hasArrived = useRef(false);
  const currentZone = useRef<ActiveZone>("all");
  
  const [isExercising, setIsExercising] = useState(false);

  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return;
    const t = state.clock.elapsedTime;

    if (currentZone.current !== activeZone) {
      hasArrived.current = false;
      currentZone.current = activeZone;
      setIsExercising(false);
    }

    if (activeZone === "all") {
      targetPos.set(0, 0, 0);
      targetRot.current = Math.PI / 4;
    } else if (activeZone === "laptop") {
      const isClose = groupRef.current.position.distanceTo(new Vector3(-2.5, groupRef.current.position.y, -1.8)) < 0.2;
      // 책상에 더 가까이 붙으면서도 의자 위에 정확히 앉도록 Y축과 Z축을 미세 조정
      targetPos.set(-2.5, isClose ? 0.5 : 0, -1.7);
      targetRot.current = Math.PI;
    } else if (activeZone === "reading") {
      const isClose = groupRef.current.position.distanceTo(new Vector3(2.5, groupRef.current.position.y, -2.5)) < 0.2;
      // 소파 등받이에 기대기 위해 위치 재조정 (Z축을 뒤로, Y축을 살짝 낮춤)
      targetPos.set(2.5, isClose ? 0.35 : 0, -2.6);
      targetRot.current = -Math.PI / 6;
    } else if (activeZone === "exercising") {
      targetPos.set(1.5, 0, 2);
      targetRot.current = -Math.PI / 4;
    }

    const currentPosXZ = new Vector3(groupRef.current.position.x, 0, groupRef.current.position.z);
    const targetPosXZ = new Vector3(targetPos.x, 0, targetPos.z);
    const distanceXZ = currentPosXZ.distanceTo(targetPosXZ);
    const isMoving = distanceXZ > 0.1;
    
    if (!isMoving && !hasArrived.current) {
      hasArrived.current = true;
      if (activeZone === "exercising") {
        setIsExercising(true);
      }
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
      
      groupRef.current.position.lerp(new Vector3(targetPos.x, 0, targetPos.z), 0.05);
    } else {
      let diff = targetRot.current - groupRef.current.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      groupRef.current.rotation.y += diff * 0.1;
      
      groupRef.current.position.lerp(targetPos, 0.1);
    }

    if (headRef.current) headRef.current.rotation.set(0, 0, 0);
    if (leftArmRef.current) leftArmRef.current.rotation.set(0, 0, 0);
    if (rightArmRef.current) rightArmRef.current.rotation.set(0, 0, 0);
    if (leftLegRef.current) leftLegRef.current.rotation.set(0, 0, 0);
    if (rightLegRef.current) rightLegRef.current.rotation.set(0, 0, 0);
    if (leftKneeRef.current) leftKneeRef.current.rotation.set(0, 0, 0);
    if (rightKneeRef.current) rightKneeRef.current.rotation.set(0, 0, 0);
    if (bodyRef.current) {
      bodyRef.current.position.set(0, 0.25, 0);
      bodyRef.current.rotation.set(0, 0, 0);
    }

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
        // 의자에 앉는 자세 (허벅지는 앞으로, 종아리는 아래로)
        if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI / 2;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI / 2;
        if (leftKneeRef.current) leftKneeRef.current.rotation.x = Math.PI / 2;
        if (rightKneeRef.current) rightKneeRef.current.rotation.x = Math.PI / 2;
        
        // 노트북 위로 손이 올라가도록 팔 각도 수정 (앞으로 쭉 뻗고 살짝만 내림)
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -1.4 + Math.sin(t * 15) * 0.1;
          leftArmRef.current.rotation.z = 0.1;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -1.4 + Math.cos(t * 15) * 0.1;
          rightArmRef.current.rotation.z = -0.1;
        }
        if (headRef.current) headRef.current.rotation.y = Math.sin(t * 2) * 0.05;
      } else if (activeZone === "reading") {
        // 소파에 자연스럽게 눕는 자세 (등받이에 기대는 느낌)
        if (bodyRef.current) {
          bodyRef.current.rotation.x = -0.6; // 너무 눕지 않고 등받이 각도(약 35도)에 맞춤
          bodyRef.current.position.y = 0.15; // 높이 살짝 낮춤
          bodyRef.current.position.z = 0.1; // 뒤로 살짝 뺌
        }
        
        // 다리는 소파 밖으로 자연스럽게 떨어지도록 (무릎을 살짝 굽힘)
        if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI / 2.2;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI / 2.2;
        if (leftKneeRef.current) leftKneeRef.current.rotation.x = 0.5; // 무릎이 아래로 떨어지게
        if (rightKneeRef.current) rightKneeRef.current.rotation.x = 0.5;
        
        // 팔은 배 위에 편안하게 모음
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -0.8;
          leftArmRef.current.rotation.z = 0.6;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -0.8;
          rightArmRef.current.rotation.z = -0.6;
        }
        
        if (headRef.current) {
          headRef.current.rotation.x = 0.2; // 정면을 살짝 응시
          headRef.current.rotation.y = Math.sin(t * 0.5) * 0.05;
        }
      } else if (activeZone === "exercising") {
        if (leftLegRef.current) leftLegRef.current.rotation.x = -0.1;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -0.1;
        
        const curl = (Math.sin(t * 3) + 1) / 2;
        
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -0.2 - (curl * 1.5);
          leftArmRef.current.rotation.z = 0.2;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -0.2 - (curl * 1.5);
          rightArmRef.current.rotation.z = -0.2;
        }
        
        if (bodyRef.current) {
          bodyRef.current.position.y = 0.25 + (Math.sin(t * 3) * 0.02);
        }
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
          
          <group position={[0, -0.26, 0.05]} visible={isExercising}>
            <Cylinder args={[0.02, 0.02, 0.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#ccc" metalness={0.8} />
            </Cylinder>
            <Cylinder args={[0.06, 0.06, 0.04]} position={[-0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#111" />
            </Cylinder>
            <Cylinder args={[0.06, 0.06, 0.04]} position={[0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#111" />
            </Cylinder>
          </group>
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
          
          <group position={[0, -0.26, 0.05]} visible={isExercising}>
            <Cylinder args={[0.02, 0.02, 0.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#ccc" metalness={0.8} />
            </Cylinder>
            <Cylinder args={[0.06, 0.06, 0.04]} position={[-0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#111" />
            </Cylinder>
            <Cylinder args={[0.06, 0.06, 0.04]} position={[0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#111" />
            </Cylinder>
          </group>
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

function OutdoorEnvironment({ timeOfDay }: { timeOfDay: "day" | "sunset" | "night" }) {
  const skyColor = useRef(new Color());
  const groundColor = useRef(new Color());
  
  useFrame(() => {
    let targetSky, targetGround;
    
    if (timeOfDay === "night") {
      targetSky = new Color("#1e1b4b");
      targetGround = new Color("#0f172a");
    } else if (timeOfDay === "sunset") {
      targetSky = new Color("#fb923c");
      targetGround = new Color("#d97706");
    } else {
      targetSky = new Color("#60a5fa");
      targetGround = new Color("#4ade80");
    }
    
    skyColor.current.lerp(targetSky, 0.02);
    groundColor.current.lerp(targetGround, 0.02);
  });

  return (
    <group>
      {timeOfDay === "night" ? (
        <Stars radius={50} depth={50} count={1000} factor={3} saturation={0.5} fade speed={1} />
      ) : (
        <Sky 
          distance={450000} 
          sunPosition={timeOfDay === "sunset" ? [10, 2, -10] : [10, 20, -10]} 
          inclination={timeOfDay === "sunset" ? 0.49 : 0.2} 
          azimuth={0.25} 
        />
      )}
      
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial color={timeOfDay === "night" ? "#1a1816" : (timeOfDay === "sunset" ? "#7c9a6c" : "#86efac")} />
      </mesh>
      
      <group position={[0, -1, -10]}>
        {[...Array(5)].map((_, i) => (
          <group key={i} position={[(i - 2) * 4 + Math.random() * 2, 0, Math.random() * -5]}>
            <Cylinder args={[0.2, 0.3, 3]} position={[0, 1.5, 0]}>
              <meshBasicMaterial color={timeOfDay === "night" ? "#2c2826" : "#5d4037"} />
            </Cylinder>
            <Sphere args={[1.5, 16, 16]} position={[0, 3.5, 0]}>
              <meshBasicMaterial color={timeOfDay === "night" ? "#1a1816" : "#386641"} />
            </Sphere>
            <Sphere args={[1.2, 16, 16]} position={[0.8, 3, 0.5]}>
              <meshBasicMaterial color={timeOfDay === "night" ? "#1a1816" : "#2a5934"} />
            </Sphere>
          </group>
        ))}
      </group>
    </group>
  );
}

function DioramaRoom({ reducedMotion = false, activeZone = "all", onZoneClick, isLaptopMode, hasArrived }: AboutSceneProps & { isLaptopMode: boolean; hasArrived: boolean }) {
  const handleZoneClick = (zone: ActiveZone) => {
    if (onZoneClick) onZoneClick(zone);
  };

  return (
    <group position={[0, -1, 0]}>
      <Box args={[8, 0.4, 8]} position={[0, -0.2, 0]} receiveShadow>
        <meshStandardMaterial color="#b08968" roughness={0.8} />
      </Box>
      
      <Box args={[0.4, 5, 8]} position={[-4.2, 2.5, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#fdfbf7" roughness={0.9} />
      </Box>
      
      <group position={[0, 2.5, -4.2]}>
        <Box args={[8, 1.2, 0.4]} position={[0, 1.9, 0]} receiveShadow castShadow><meshStandardMaterial color="#fdfbf7" roughness={0.9} /></Box>
        <Box args={[8, 1.2, 0.4]} position={[0, -1.9, 0]} receiveShadow castShadow><meshStandardMaterial color="#fdfbf7" roughness={0.9} /></Box>
        <Box args={[2, 2.6, 0.4]} position={[-3, 0, 0]} receiveShadow castShadow><meshStandardMaterial color="#fdfbf7" roughness={0.9} /></Box>
        <Box args={[2, 2.6, 0.4]} position={[3, 0, 0]} receiveShadow castShadow><meshStandardMaterial color="#fdfbf7" roughness={0.9} /></Box>
      </group>

      <Box args={[0.1, 0.4, 8]} position={[-3.95, 0.2, 0]} receiveShadow><meshStandardMaterial color="#7f5539" roughness={0.8} /></Box>
      <Box args={[8, 0.4, 0.1]} position={[0, 0.2, -3.95]} receiveShadow><meshStandardMaterial color="#7f5539" roughness={0.8} /></Box>

      <group position={[0, 2.5, -4]}>
        <Box args={[4.2, 2.8, 0.2]} position={[0, 0, 0]} castShadow><meshStandardMaterial color="#fff" /></Box>
        <Box args={[4, 2.6, 0.25]} position={[0, 0, 0]}><meshBasicMaterial color="#000" colorWrite={false} depthWrite={false} /></Box>
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[4, 2.6]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} roughness={0.1} metalness={0.1} transmission={0.9} thickness={0.5} />
        </mesh>
        <Box args={[0.1, 2.6, 0.1]} position={[0, 0, 0.05]} castShadow><meshStandardMaterial color="#fff" /></Box>
        <Box args={[4, 0.1, 0.1]} position={[0, 0, 0.05]} castShadow><meshStandardMaterial color="#fff" /></Box>
      </group>

      <Cylinder args={[3, 3, 0.04, 64]} position={[0, 0.02, 0]} receiveShadow>
        <meshStandardMaterial color="#e2e8f0" roughness={1} />
      </Cylinder>

      <InteractiveZone position={[-2.5, 0, -2.5]} zone="laptop" onClick={handleZoneClick}>
        <RoundedBox args={[2.2, 0.1, 1.2]} position={[0, 1, 0]} radius={0.05} castShadow receiveShadow>
          <meshStandardMaterial color="#7f5539" roughness={0.7} />
        </RoundedBox>
        <Cylinder args={[0.06, 0.06, 1, 16]} position={[-0.9, 0.5, -0.4]} castShadow receiveShadow><meshStandardMaterial color="#222" /></Cylinder>
        <Cylinder args={[0.06, 0.06, 1, 16]} position={[0.9, 0.5, -0.4]} castShadow receiveShadow><meshStandardMaterial color="#222" /></Cylinder>
        <Cylinder args={[0.06, 0.06, 1, 16]} position={[-0.9, 0.5, 0.4]} castShadow receiveShadow><meshStandardMaterial color="#222" /></Cylinder>
        <Cylinder args={[0.06, 0.06, 1, 16]} position={[0.9, 0.5, 0.4]} castShadow receiveShadow><meshStandardMaterial color="#222" /></Cylinder>
        
        <group position={[0, 1.05, 0]}>
          <RoundedBox args={[0.7, 0.03, 0.5]} position={[0, 0, 0]} radius={0.01} castShadow><meshStandardMaterial color="#d1d5db" metalness={0.6} roughness={0.3} /></RoundedBox>
          <Box args={[0.6, 0.031, 0.25]} position={[0, 0, 0.05]}><meshStandardMaterial color="#333" /></Box>
          <group position={[0, 0.015, -0.25]} rotation={[-0.2, 0, 0]}>
            <RoundedBox args={[0.7, 0.5, 0.03]} position={[0, 0.25, 0]} radius={0.01} castShadow><meshStandardMaterial color="#d1d5db" metalness={0.6} roughness={0.3} /></RoundedBox>
            <Box args={[0.66, 0.46, 0.031]} position={[0, 0.25, 0.001]}><meshStandardMaterial color="#111" /></Box>
            <mesh position={[0, 0.25, 0.017]}>
              <planeGeometry args={[0.62, 0.42]} />
              <meshBasicMaterial color="#93c5fd" transparent opacity={0.8} />
            </mesh>
          </group>
        </group>

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

      <InteractiveZone position={[1.5, 0, 2]} zone="exercising" onClick={handleZoneClick}>
        <group position={[-1.2, 0.1, 0.5]} visible={activeZone !== "exercising" || !hasArrived}>
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
  const [hasArrived, setHasArrived] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<"day" | "sunset" | "night">("day");
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) {
      setTimeOfDay("night");
    } else if (hour >= 16 && hour < 18) {
      setTimeOfDay("sunset");
    } else {
      setTimeOfDay("day");
    }
  }, []);
  
  const handleArrival = (zone: ActiveZone) => {
    setHasArrived(true);
    setIsLaptopMode(zone === "laptop");
  };

  useEffect(() => {
    setHasArrived(false);
    if (activeZone !== "laptop") {
      setIsLaptopMode(false);
    }
  }, [activeZone]);

  // 그림자 문제를 해결하기 위해 조명 설정 대폭 수정
  // 그림자를 생성하는 방향광(directionalLight)은 유지하되, 
  // 그림자가 지는 어두운 부분을 밝혀주는 환경광(ambientLight)과 보조광(fill light)을 강하게 설정
  const getLightSettings = () => {
    if (isLaptopMode) {
      return {
        ambientColor: "#ffffff", // 밤에도 기본 물체 색상이 보이도록 흰색 계열의 환경광
        ambientIntensity: 1.2, // 환경광을 매우 높여서 그림자 대비를 줄임
        dirColor: "#fcd34d",
        dirIntensity: 0.5, // 그림자를 만드는 메인 빛은 약하게
        fillColor: "#ffffff",
        fillIntensity: 1.0,
      };
    }
    
    if (timeOfDay === "night") {
      return {
        ambientColor: "#ffffff",
        ambientIntensity: 1.2,
        dirColor: "#93c5fd",
        dirIntensity: 0.5,
        fillColor: "#ffffff",
        fillIntensity: 1.0,
      };
    } else if (timeOfDay === "sunset") {
      return {
        ambientColor: "#ffffff",
        ambientIntensity: 1.5,
        dirColor: "#ffb703",
        dirIntensity: 1.0,
        fillColor: "#ffffff",
        fillIntensity: 1.2,
      };
    } else {
      return {
        ambientColor: "#ffffff",
        ambientIntensity: 1.8, // 낮에는 그림자 진 곳도 매우 밝게
        dirColor: "#ffffff",
        dirIntensity: 1.2,
        fillColor: "#ffffff",
        fillIntensity: 1.5,
      };
    }
  };

  const lights = getLightSettings();

  return (
    <>
      {/* 그림자를 아주 연하게 만들기 위해 SoftShadows 제거 (기본 그림자만 사용) */}
      
      <OutdoorEnvironment timeOfDay={isLaptopMode ? "night" : timeOfDay} />
      
      {/* 환경광: 방 전체의 기본 밝기를 결정 (그림자 진 곳을 밝혀줌) */}
      <ambientLight intensity={lights.ambientIntensity} color={lights.ambientColor} />
      
      {/* 메인 방향광: 그림자를 생성하는 빛 */}
      <directionalLight
        castShadow
        position={[10, 15, -10]}
        intensity={lights.dirIntensity}
        color={lights.dirColor}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.001}
      />
      
      {/* 보조광: 그림자가 지는 반대편에서 빛을 쏴서 그림자를 옅게 만듦 */}
      <directionalLight position={[-10, 10, 10]} intensity={lights.fillIntensity} color={lights.fillColor} />
      <directionalLight position={[0, 10, 10]} intensity={lights.fillIntensity * 0.5} color={lights.fillColor} />

      <DioramaRoom reducedMotion={reducedMotion} activeZone={activeZone} onZoneClick={onZoneClick} isLaptopMode={isLaptopMode} hasArrived={hasArrived} />
      
      <group position={[0, -1, 0]}>
        <MainAvatar activeZone={activeZone} reducedMotion={reducedMotion} onArrival={handleArrival} />
      </group>
      
      {/* 바닥 그림자도 아주 연하게 */}
      <ContactShadows
        position={[0, -1.05, 0]}
        opacity={0.2}
        scale={25}
        blur={2.5}
        far={4}
        resolution={1024}
        color="#000000"
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
