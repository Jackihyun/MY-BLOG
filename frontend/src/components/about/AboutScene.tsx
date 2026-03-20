"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, RoundedBox, Sphere, Cylinder, Box } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { Group, Mesh } from "three";

interface AboutSceneProps {
  reducedMotion?: boolean;
}

function CameraRig({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const { camera, pointer } = useThree();

  useFrame(() => {
    const targetX = reducedMotion ? 0 : pointer.x * 0.45;
    const targetY = reducedMotion ? 0.18 : 0.18 + pointer.y * 0.18;

    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (targetY - camera.position.y) * 0.04;
    camera.lookAt(0, 0.15, -0.25);
  });

  return null;
}

// 아바타 컴포넌트
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
  const headRef = useRef<Mesh>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return;
    const t = state.clock.elapsedTime;

    if (activity === "laptop") {
      // 타이핑 애니메이션
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 15) * 0.1 - 0.5;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.cos(t * 15) * 0.1 - 0.5;
      if (headRef.current) headRef.current.rotation.y = Math.sin(t * 2) * 0.05;
    } else if (activity === "reading") {
      // 책 읽으며 고개 끄덕임
      if (headRef.current) headRef.current.rotation.x = Math.sin(t * 1.5) * 0.05 + 0.1;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.8;
    } else if (activity === "exercising") {
      // 스쿼트 애니메이션
      const squat = Math.abs(Math.sin(t * 2)) * 0.2;
      groupRef.current.position.y = position[1] - squat;
      if (leftArmRef.current) leftArmRef.current.rotation.z = Math.sin(t * 2) * 0.5 + 0.5;
      if (rightArmRef.current) rightArmRef.current.rotation.z = -Math.sin(t * 2) * 0.5 - 0.5;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* 머리 */}
      <Sphere ref={headRef} args={[0.25, 32, 32]} position={[0, 0.6, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.6} />
        {/* 눈 */}
        <Sphere args={[0.03, 16, 16]} position={[-0.08, 0.05, 0.22]}>
          <meshBasicMaterial color="#333" />
        </Sphere>
        <Sphere args={[0.03, 16, 16]} position={[0.08, 0.05, 0.22]}>
          <meshBasicMaterial color="#333" />
        </Sphere>
      </Sphere>

      {/* 몸통 */}
      <group ref={bodyRef} position={[0, 0.2, 0]}>
        <Cylinder args={[0.15, 0.2, 0.4, 32]} castShadow receiveShadow>
          <meshStandardMaterial color="#88b04b" roughness={0.8} />
        </Cylinder>
      </group>

      {/* 팔 */}
      <group ref={leftArmRef} position={[-0.2, 0.35, 0]}>
        <Cylinder args={[0.05, 0.05, 0.3, 16]} position={[0, -0.15, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={color} roughness={0.6} />
        </Cylinder>
      </group>
      <group ref={rightArmRef} position={[0.2, 0.35, 0]}>
        <Cylinder args={[0.05, 0.05, 0.3, 16]} position={[0, -0.15, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={color} roughness={0.6} />
        </Cylinder>
      </group>

      {/* 다리 (앉아있거나 서있거나) */}
      {activity === "exercising" ? (
        <>
          <Cylinder args={[0.06, 0.06, 0.3, 16]} position={[-0.1, -0.15, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#333" roughness={0.8} />
          </Cylinder>
          <Cylinder args={[0.06, 0.06, 0.3, 16]} position={[0.1, -0.15, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#333" roughness={0.8} />
          </Cylinder>
        </>
      ) : (
        <>
          <Cylinder args={[0.06, 0.06, 0.3, 16]} position={[-0.1, -0.05, 0.15]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#333" roughness={0.8} />
          </Cylinder>
          <Cylinder args={[0.06, 0.06, 0.3, 16]} position={[0.1, -0.05, 0.15]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#333" roughness={0.8} />
          </Cylinder>
        </>
      )}
    </group>
  );
}

function RoomScene({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const roomRef = useRef<Group>(null);

  useFrame((state) => {
    if (roomRef.current && !reducedMotion) {
      roomRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={roomRef} position={[0, -0.5, 0]}>
      {/* 바닥 */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#e8d5c4" roughness={0.9} />
      </mesh>
      
      {/* 벽 */}
      <mesh position={[0, 2, -4]} receiveShadow>
        <planeGeometry args={[12, 4]} />
        <meshStandardMaterial color="#f4efe6" roughness={0.9} />
      </mesh>

      {/* 1. 노트북 존 (왼쪽) */}
      <group position={[-2.5, 0, -1]}>
        {/* 책상 */}
        <Box args={[1.5, 0.1, 0.8]} position={[0, 0.7, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#8c6b5d" roughness={0.8} />
        </Box>
        <Box args={[0.1, 0.7, 0.1]} position={[-0.65, 0.35, -0.3]} castShadow receiveShadow>
          <meshStandardMaterial color="#555" />
        </Box>
        <Box args={[0.1, 0.7, 0.1]} position={[0.65, 0.35, -0.3]} castShadow receiveShadow>
          <meshStandardMaterial color="#555" />
        </Box>
        <Box args={[0.1, 0.7, 0.1]} position={[-0.65, 0.35, 0.3]} castShadow receiveShadow>
          <meshStandardMaterial color="#555" />
        </Box>
        <Box args={[0.1, 0.7, 0.1]} position={[0.65, 0.35, 0.3]} castShadow receiveShadow>
          <meshStandardMaterial color="#555" />
        </Box>
        
        {/* 노트북 */}
        <group position={[0, 0.75, 0]}>
          <Box args={[0.5, 0.02, 0.35]} position={[0, 0, 0]} castShadow>
            <meshStandardMaterial color="#ccc" />
          </Box>
          <Box args={[0.5, 0.35, 0.02]} position={[0, 0.17, -0.17]} rotation={[-0.2, 0, 0]} castShadow>
            <meshStandardMaterial color="#bbb" />
          </Box>
          {/* 화면 빛 */}
          <mesh position={[0, 0.17, -0.15]} rotation={[-0.2, 0, 0]}>
            <planeGeometry args={[0.45, 0.3]} />
            <meshBasicMaterial color="#d7ecff" transparent opacity={0.8} />
          </mesh>
        </group>

        {/* 의자 */}
        <Box args={[0.5, 0.1, 0.5]} position={[0, 0.4, 0.8]} castShadow receiveShadow>
          <meshStandardMaterial color="#d4a373" />
        </Box>
        
        {/* 노트북 아바타 */}
        <Avatar position={[0, 0.45, 0.8]} activity="laptop" color="#ffb347" reducedMotion={reducedMotion} />
      </group>

      {/* 2. 독서 존 (중앙/오른쪽 뒤) */}
      <group position={[1.5, 0, -2]}>
        {/* 소파/침대 */}
        <RoundedBox args={[2, 0.4, 1]} position={[0, 0.2, 0]} radius={0.1} castShadow receiveShadow>
          <meshStandardMaterial color="#a8dadc" roughness={0.7} />
        </RoundedBox>
        <RoundedBox args={[2, 0.8, 0.2]} position={[0, 0.4, -0.4]} radius={0.1} castShadow receiveShadow>
          <meshStandardMaterial color="#a8dadc" roughness={0.7} />
        </RoundedBox>

        {/* 책 */}
        <Box args={[0.3, 0.05, 0.2]} position={[0, 0.6, 0.3]} rotation={[0.2, 0, 0]} castShadow>
          <meshStandardMaterial color="#e63946" />
        </Box>

        {/* 독서 아바타 */}
        <Avatar position={[0, 0.45, 0.1]} activity="reading" color="#f4a261" reducedMotion={reducedMotion} />
      </group>

      {/* 3. 운동 존 (오른쪽 앞) */}
      <group position={[3, 0, 1]}>
        {/* 요가 매트 */}
        <Box args={[1.2, 0.02, 2]} position={[0, 0.01, 0]} receiveShadow>
          <meshStandardMaterial color="#457b9d" roughness={0.9} />
        </Box>

        {/* 덤벨 */}
        <group position={[-0.4, 0.05, 0.5]}>
          <Cylinder args={[0.02, 0.02, 0.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <meshStandardMaterial color="#333" />
          </Cylinder>
          <Cylinder args={[0.08, 0.08, 0.05]} position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <meshStandardMaterial color="#111" />
          </Cylinder>
          <Cylinder args={[0.08, 0.08, 0.05]} position={[0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <meshStandardMaterial color="#111" />
          </Cylinder>
        </group>

        {/* 운동 아바타 */}
        <Avatar position={[0, 0.3, 0]} activity="exercising" color="#e9c46a" reducedMotion={reducedMotion} />
      </group>
      
      {/* 화분 장식 */}
      <group position={[-4, 0, -3]}>
        <Cylinder args={[0.3, 0.2, 0.5]} position={[0, 0.25, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#e76f51" />
        </Cylinder>
        <Sphere args={[0.5, 16, 16]} position={[0, 0.8, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#2a9d8f" roughness={0.8} />
        </Sphere>
      </group>
    </group>
  );
}

function SceneContents({ reducedMotion = false }: AboutSceneProps) {
  return (
    <>
      <color attach="background" args={["#f4e9da"]} />
      <fog attach="fog" args={["#f4e9da", 10, 22]} />
      <ambientLight intensity={0.9} />
      <directionalLight
        castShadow
        position={[5, 8, 5]}
        intensity={1.5}
        color="#fff7ee"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-3, 3, -1]} intensity={0.8} color="#ffd9a8" />
      <pointLight position={[2, 3, 2]} intensity={0.5} color="#dbeafe" />

      <RoomScene reducedMotion={reducedMotion} />
      
      <ContactShadows
        position={[0, -0.55, 0]}
        opacity={0.3}
        scale={15}
        blur={2}
        far={4}
        resolution={1024}
        color="#8f6f57"
      />
      <CameraRig reducedMotion={reducedMotion} />
      <Environment preset="sunset" />
    </>
  );
}

export default function AboutScene({ reducedMotion = false }: AboutSceneProps) {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 2, 8], fov: 35 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <SceneContents reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
