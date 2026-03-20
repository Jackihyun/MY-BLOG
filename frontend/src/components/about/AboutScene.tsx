"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, RoundedBox, Sphere, Cylinder, Box } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { Group, Mesh, Vector3 } from "three";

interface AboutSceneProps {
  reducedMotion?: boolean;
}

function CameraRig({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const { camera, pointer } = useThree();
  const target = new Vector3(0, 1, 0);

  useFrame(() => {
    if (reducedMotion) {
      camera.position.lerp(new Vector3(7, 6, 9), 0.05);
    } else {
      camera.position.lerp(new Vector3(7 + pointer.x * 1.5, 6 + pointer.y * 1.5, 9), 0.05);
    }
    camera.lookAt(target);
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

      {/* 다리 */}
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

function DioramaRoom({ reducedMotion = false }: { reducedMotion?: boolean }) {
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

      {/* 중앙 러그 (Rug) */}
      <Cylinder args={[2.5, 2.5, 0.05, 32]} position={[0, 0.02, 0]} receiveShadow>
        <meshStandardMaterial color="#a8dadc" roughness={0.9} />
      </Cylinder>

      {/* 창문 (Window on back wall) */}
      <group position={[0, 2.5, -4]}>
        {/* 창틀 */}
        <Box args={[3.2, 2.2, 0.1]} position={[0, 0, 0]} castShadow>
          <meshStandardMaterial color="#ffffff" />
        </Box>
        {/* 유리/풍경 */}
        <Box args={[3, 2, 0.05]} position={[0, 0, 0.05]}>
          <meshBasicMaterial color="#87CEEB" />
        </Box>
        {/* 창살 */}
        <Box args={[0.1, 2, 0.15]} position={[0, 0, 0.05]} castShadow>
          <meshStandardMaterial color="#ffffff" />
        </Box>
        <Box args={[3, 0.1, 0.15]} position={[0, 0, 0.05]} castShadow>
          <meshStandardMaterial color="#ffffff" />
        </Box>
      </group>

      {/* 1. 노트북 존 (왼쪽 구석) */}
      <group position={[-2.5, 0, -2.5]}>
        {/* 책상 */}
        <Box args={[1.8, 0.1, 1]} position={[0, 1, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#8c6b5d" roughness={0.8} />
        </Box>
        <Box args={[0.1, 1, 0.1]} position={[-0.8, 0.5, -0.4]} castShadow receiveShadow>
          <meshStandardMaterial color="#555" />
        </Box>
        <Box args={[0.1, 1, 0.1]} position={[0.8, 0.5, -0.4]} castShadow receiveShadow>
          <meshStandardMaterial color="#555" />
        </Box>
        <Box args={[0.1, 1, 0.1]} position={[-0.8, 0.5, 0.4]} castShadow receiveShadow>
          <meshStandardMaterial color="#555" />
        </Box>
        <Box args={[0.1, 1, 0.1]} position={[0.8, 0.5, 0.4]} castShadow receiveShadow>
          <meshStandardMaterial color="#555" />
        </Box>
        
        {/* 노트북 */}
        <group position={[0, 1.05, 0]} rotation={[0, 0.2, 0]}>
          <Box args={[0.6, 0.02, 0.4]} position={[0, 0, 0]} castShadow>
            <meshStandardMaterial color="#ccc" />
          </Box>
          <Box args={[0.6, 0.4, 0.02]} position={[0, 0.2, -0.2]} rotation={[-0.2, 0, 0]} castShadow>
            <meshStandardMaterial color="#bbb" />
          </Box>
          {/* 화면 빛 */}
          <mesh position={[0, 0.2, -0.18]} rotation={[-0.2, 0, 0]}>
            <planeGeometry args={[0.55, 0.35]} />
            <meshBasicMaterial color="#d7ecff" transparent opacity={0.8} />
          </mesh>
        </group>

        {/* 의자 */}
        <Box args={[0.6, 0.1, 0.6]} position={[0, 0.5, 0.8]} castShadow receiveShadow>
          <meshStandardMaterial color="#d4a373" />
        </Box>
        <Box args={[0.6, 0.6, 0.1]} position={[0, 0.8, 1.05]} castShadow receiveShadow>
          <meshStandardMaterial color="#d4a373" />
        </Box>
        
        {/* 노트북 아바타 */}
        <Avatar position={[0, 0.55, 0.8]} activity="laptop" color="#ffb347" reducedMotion={reducedMotion} />
      </group>

      {/* 2. 독서 존 (오른쪽 벽면) */}
      <group position={[2.5, 0, -2.5]}>
        {/* 소파 */}
        <RoundedBox args={[2.5, 0.5, 1.2]} position={[0, 0.25, 0]} radius={0.1} castShadow receiveShadow>
          <meshStandardMaterial color="#e07a5f" roughness={0.8} />
        </RoundedBox>
        <RoundedBox args={[2.5, 1, 0.3]} position={[0, 0.5, -0.45]} radius={0.1} castShadow receiveShadow>
          <meshStandardMaterial color="#e07a5f" roughness={0.8} />
        </RoundedBox>
        <RoundedBox args={[0.3, 0.7, 1.2]} position={[-1.1, 0.35, 0]} radius={0.1} castShadow receiveShadow>
          <meshStandardMaterial color="#e07a5f" roughness={0.8} />
        </RoundedBox>
        <RoundedBox args={[0.3, 0.7, 1.2]} position={[1.1, 0.35, 0]} radius={0.1} castShadow receiveShadow>
          <meshStandardMaterial color="#e07a5f" roughness={0.8} />
        </RoundedBox>

        {/* 책 */}
        <Box args={[0.4, 0.08, 0.3]} position={[0.5, 0.55, 0]} rotation={[0, -0.2, 0]} castShadow>
          <meshStandardMaterial color="#f4a261" />
        </Box>

        {/* 독서 아바타 */}
        <Avatar position={[-0.3, 0.55, 0.1]} rotation={[0, 0.3, 0]} activity="reading" color="#457b9d" reducedMotion={reducedMotion} />
      </group>

      {/* 3. 운동 존 (앞쪽) */}
      <group position={[1.5, 0, 2]}>
        {/* 요가 매트 */}
        <Box args={[1.5, 0.02, 2.5]} position={[0, 0.01, 0]} receiveShadow>
          <meshStandardMaterial color="#2a9d8f" roughness={0.9} />
        </Box>

        {/* 덤벨 */}
        <group position={[-1, 0.1, 0.5]}>
          <Cylinder args={[0.03, 0.03, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <meshStandardMaterial color="#333" />
          </Cylinder>
          <Cylinder args={[0.12, 0.12, 0.08]} position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <meshStandardMaterial color="#111" />
          </Cylinder>
          <Cylinder args={[0.12, 0.12, 0.08]} position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <meshStandardMaterial color="#111" />
          </Cylinder>
        </group>

        {/* 운동 아바타 */}
        <Avatar position={[0, 0.3, 0]} rotation={[0, -Math.PI / 4, 0]} activity="exercising" color="#e9c46a" reducedMotion={reducedMotion} />
      </group>
      
      {/* 화분 장식 (왼쪽 앞) */}
      <group position={[-3, 0, 2.5]}>
        <Cylinder args={[0.4, 0.3, 0.6]} position={[0, 0.3, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#e76f51" />
        </Cylinder>
        <Sphere args={[0.7, 16, 16]} position={[0, 1, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#2a9d8f" roughness={0.8} />
        </Sphere>
        <Sphere args={[0.5, 16, 16]} position={[0.4, 0.8, 0.2]} castShadow receiveShadow>
          <meshStandardMaterial color="#2a9d8f" roughness={0.8} />
        </Sphere>
        <Sphere args={[0.4, 16, 16]} position={[-0.3, 0.9, -0.3]} castShadow receiveShadow>
          <meshStandardMaterial color="#2a9d8f" roughness={0.8} />
        </Sphere>
      </group>

      {/* 책장 (왼쪽 벽) */}
      <group position={[-3.8, 0, 0]}>
        <Box args={[0.6, 3, 2]} position={[0, 1.5, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#8c6b5d" />
        </Box>
        {/* 책들 */}
        <Box args={[0.4, 0.4, 0.1]} position={[0, 0.8, -0.5]} castShadow>
          <meshStandardMaterial color="#e63946" />
        </Box>
        <Box args={[0.4, 0.5, 0.1]} position={[0, 0.85, -0.3]} castShadow>
          <meshStandardMaterial color="#457b9d" />
        </Box>
        <Box args={[0.4, 0.45, 0.1]} position={[0, 0.82, -0.1]} castShadow>
          <meshStandardMaterial color="#f4a261" />
        </Box>
        <Box args={[0.4, 0.4, 0.1]} position={[0, 1.8, 0.2]} castShadow>
          <meshStandardMaterial color="#2a9d8f" />
        </Box>
        <Box args={[0.4, 0.4, 0.1]} position={[0, 1.8, 0.4]} castShadow>
          <meshStandardMaterial color="#e9c46a" />
        </Box>
      </group>
    </group>
  );
}

function SceneContents({ reducedMotion = false }: AboutSceneProps) {
  return (
    <>
      {/* 배경색 제거하여 부모 컨테이너(Tailwind)의 배경색이 보이도록 함 */}
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
      />
      <pointLight position={[-2, 4, -2]} intensity={0.6} color="#ffd9a8" />
      <pointLight position={[2, 4, 2]} intensity={0.4} color="#dbeafe" />

      <DioramaRoom reducedMotion={reducedMotion} />
      
      <ContactShadows
        position={[0, -1.05, 0]}
        opacity={0.4}
        scale={20}
        blur={2.5}
        far={4}
        resolution={1024}
        color="#8f6f57"
      />
      <CameraRig reducedMotion={reducedMotion} />
      <Environment preset="city" />
    </>
  );
}

export default function AboutScene({ reducedMotion = false }: AboutSceneProps) {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [7, 6, 9], fov: 50 }}
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
