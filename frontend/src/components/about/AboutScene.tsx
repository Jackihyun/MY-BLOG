"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, RoundedBox, Sphere, Cylinder, Box, Float, Billboard } from "@react-three/drei";
import { Suspense, useRef, useState, useMemo, useEffect } from "react";
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  Group,
  LinearFilter,
  MathUtils,
  Mesh,
  PCFSoftShadowMap,
  SRGBColorSpace,
  Vector3,
} from "three";

export type ActiveZone = "all" | "laptop" | "reading" | "exercising";

interface AboutSceneProps {
  reducedMotion?: boolean;
  activeZone?: ActiveZone;
  onZoneClick?: (zone: ActiveZone) => void;
}

type QualityMode = "high" | "low" | "ultra";

const SPEECH_MESSAGES: Record<ActiveZone, string> = {
  all: "안녕하세요, Jackihyun입니다.",
  laptop: "열심히 코딩 중이에요.",
  reading: "잠깐 쉬는 중이에요.",
  exercising: "리프레시하고 다시 올게요.",
};

function AvatarSpeechBubble({
  activeZone,
  visible,
  qualityMode = "high",
}: {
  activeZone: ActiveZone;
  visible: boolean;
  qualityMode?: QualityMode;
}) {
  const bubbleX = activeZone === "reading" ? -1.85 : 0.8;
  const bubbleScale = activeZone === "exercising" ? 0.72 : 1;
  const message = SPEECH_MESSAGES[activeZone];
  const textTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const dprCap = qualityMode === "high" ? 2.5 : qualityMode === "low" ? 1.75 : 1.25;
    const baseWidth = qualityMode === "ultra" ? 900 : 1200;
    const baseHeight = qualityMode === "ultra" ? 220 : 280;
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const w = Math.floor(baseWidth * dpr);
    const h = Math.floor(baseHeight * dpr);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, baseWidth, baseHeight);
    ctx.fillStyle = "#3f3f46";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const fontSize =
      qualityMode === "high"
        ? message.length > 18
          ? 66
          : 74
        : qualityMode === "low"
          ? message.length > 18
            ? 58
            : 66
          : message.length > 18
            ? 48
            : 54;
    ctx.font = `700 ${fontSize}px 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif`;
    ctx.fillText(message, baseWidth / 2, baseHeight / 2);
    const texture = new CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, [message, qualityMode]);

  useEffect(() => {
    return () => {
      textTexture?.dispose();
    };
  }, [textTexture]);

  if (!textTexture) return null;
  if (!visible) return null;

  return (
    <group position={[bubbleX, 2.05, 0.12]} scale={[bubbleScale, bubbleScale, 1]}>
      <Billboard follow>
        <group>
          <RoundedBox args={[2.8, 0.86, 0.03]} radius={0.16} renderOrder={1000}>
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.35}
              metalness={0.02}
              transparent
              opacity={0.96}
              toneMapped={false}
              depthTest={false}
              depthWrite={false}
            />
          </RoundedBox>
          <mesh position={[0, -0.52, 0]} rotation={[0, 0, Math.PI / 4]} renderOrder={1000}>
            <planeGeometry args={[0.17, 0.17]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.35}
              metalness={0.02}
              transparent
              opacity={0.96}
              toneMapped={false}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0.02, 0.031]} renderOrder={1001}>
            <planeGeometry args={[2.4, 0.52]} />
            <meshBasicMaterial map={textTexture} transparent depthTest={false} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      </Billboard>
    </group>
  );
}

// 카메라를 고정(전체 화면)으로 유지
function CameraRig({
  reducedMotion = false,
  qualityMode = "high",
}: {
  reducedMotion?: boolean;
  qualityMode?: QualityMode;
}) {
  const { camera, pointer } = useThree();
  const currentLookAt = useRef(new Vector3(0, 0.5, 0));
  const targetLookAt = new Vector3(0, 0.5, 0);
  const targetPos = new Vector3();

  useFrame(() => {
    const pointerScale = qualityMode === "ultra" ? 0.8 : qualityMode === "low" ? 1.2 : 2;
    const pointerX = reducedMotion ? 0 : pointer.x * pointerScale;
    const pointerY = reducedMotion ? 0 : pointer.y * pointerScale;
    targetPos.set(7.5 + pointerX, 6 + pointerY, 9);

    const damping = qualityMode === "ultra" ? 0.025 : 0.04;
    camera.position.lerp(targetPos, damping);
    currentLookAt.current.lerp(targetLookAt, damping);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

function MainAvatar({ 
  activeZone,
  reducedMotion = false,
  onArrival,
  showSpeech = false,
  qualityMode = "high",
}: { 
  activeZone: ActiveZone;
  reducedMotion?: boolean;
  onArrival?: (zone: ActiveZone) => void;
  showSpeech?: boolean;
  qualityMode?: QualityMode;
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

  const skinColor = "#f3c7a7";
  const hairColor = "#1f2933";
  const shirtColor = "#f8fafc";
  const vestColor = "#2563eb";
  const pantsColor = "#334155";
  const shoeColor = "#111827";

  const targetPos = useMemo(() => new Vector3(), []);
  const targetRot = useRef(0);
  
  const hasArrived = useRef(false);
  const currentZone = useRef<ActiveZone>("all");
  /** reading 상태: 앞 지점으로 걷고, 도착 시 좌석 자세로 즉시 스냅 */
  const readingNavRef = useRef<"front" | "seat">("front");
  /** laptop 상태: 의자 앞 지점으로 걷고, 도착 시 좌석 위치로 즉시 스냅 */
  const laptopNavRef = useRef<"front" | "seat">("front");

  const [isExercising, setIsExercising] = useState(false);

  /** 천천히 걷는 느낌을 위해 이동/회전 보정 속도를 낮춤 */
  const MOVE_LERP = 0.028;
  const IDLE_LERP = 0.07;
  const ROT_TO_MOVE_DIR = 0.09;

  const SOFA_FRONT_X = 2.5;
  const SOFA_FRONT_Z = -1.95;
  const SOFA_SEAT_X = 2.48;
  const SOFA_SEAT_Y = 0.64;
  const SOFA_SEAT_Z = -2.3;
  const EXERCISE_FRONT_X = 0.82;
  const EXERCISE_FRONT_Z = 2.35;
  const CHAIR_FRONT_X = -2.5;
  const CHAIR_FRONT_Z = -1.1;
  const CHAIR_SEAT_X = -2.5;
  const CHAIR_SEAT_Y = 0.5;
  const CHAIR_SEAT_Z = -1.7;
  const currentXZ = useMemo(() => new Vector3(), []);
  const targetXZ = useMemo(() => new Vector3(), []);
  const moveTarget = useMemo(() => new Vector3(), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = reducedMotion ? 0 : state.clock.elapsedTime;
    const moveLerp = reducedMotion ? 1 : MOVE_LERP;
    const idleLerp = reducedMotion ? 1 : IDLE_LERP;
    const rotToMoveDir = reducedMotion ? 1 : ROT_TO_MOVE_DIR;

    if (currentZone.current !== activeZone) {
      const prev = currentZone.current;
      hasArrived.current = false;
      if (prev === "reading" && activeZone !== "reading") {
        // reading 이탈 시 내려오는 애니메이션 없이 즉시 앞 지점으로 배치
        if (readingNavRef.current === "seat") {
          groupRef.current.position.set(SOFA_FRONT_X, 0, SOFA_FRONT_Z);
          groupRef.current.rotation.x = 0;
        }
        readingNavRef.current = "front";
      }
      if (prev === "laptop" && activeZone !== "laptop") {
        // laptop 이탈 시도 동일한 앞 지점으로 즉시 내려와 일관된 출입 경로 유지
        if (laptopNavRef.current === "seat") {
          groupRef.current.position.set(CHAIR_FRONT_X, 0, CHAIR_FRONT_Z);
          groupRef.current.rotation.x = 0;
        }
        laptopNavRef.current = "front";
      }
      if (activeZone === "reading") {
        // 소파를 통과하지 않도록 먼저 앞 지점으로 접근한 뒤 좌석으로 이동
        readingNavRef.current = "front";
      }
      if (activeZone === "laptop") {
        laptopNavRef.current = "front";
      }
      currentZone.current = activeZone;
      setIsExercising(false);
    }

    if (activeZone === "all") {
      targetPos.set(0, 0, 0);
      targetRot.current = Math.PI / 4;
    } else if (activeZone === "laptop") {
      if (laptopNavRef.current === "seat") {
        targetPos.set(CHAIR_SEAT_X, CHAIR_SEAT_Y, CHAIR_SEAT_Z);
      } else {
        targetPos.set(CHAIR_FRONT_X, 0, CHAIR_FRONT_Z);
        const dxFront = groupRef.current.position.x - CHAIR_FRONT_X;
        const dzFront = groupRef.current.position.z - CHAIR_FRONT_Z;
        if (Math.hypot(dxFront, dzFront) <= 0.2) {
          // 의자 위로 올라가는 이동 없이 좌석 위치로 스냅
          laptopNavRef.current = "seat";
          groupRef.current.position.set(CHAIR_SEAT_X, CHAIR_SEAT_Y, CHAIR_SEAT_Z);
        }
      }
      targetRot.current = Math.PI;
    } else if (activeZone === "reading") {
      if (readingNavRef.current === "seat") {
        targetPos.set(SOFA_SEAT_X, SOFA_SEAT_Y, SOFA_SEAT_Z);
      } else {
        targetPos.set(SOFA_FRONT_X, 0, SOFA_FRONT_Z);
        const dxFront = groupRef.current.position.x - SOFA_FRONT_X;
        const dzFront = groupRef.current.position.z - SOFA_FRONT_Z;
        if (Math.hypot(dxFront, dzFront) <= 0.22) {
          // 올라타는 이동 없이 즉시 소파 좌석 위치로 스냅
          readingNavRef.current = "seat";
          groupRef.current.position.set(SOFA_SEAT_X, SOFA_SEAT_Y, SOFA_SEAT_Z);
        }
      }
      targetRot.current = -Math.PI / 6;
    } else if (activeZone === "exercising") {
      // 아령 앞 바닥 지점으로 이동
      targetPos.set(EXERCISE_FRONT_X, 0, EXERCISE_FRONT_Z);
      targetRot.current = Math.PI / 3;
    }

    currentXZ.set(groupRef.current.position.x, 0, groupRef.current.position.z);
    targetXZ.set(targetPos.x, 0, targetPos.z);

    const distanceThreshold = activeZone === "reading" ? 0.18 : 0.08;
    const distanceXZ = currentXZ.distanceTo(targetXZ);
    const isSofaSeatApproach = activeZone === "reading" && readingNavRef.current === "seat";
    const isLaptopSeatApproach = activeZone === "laptop" && laptopNavRef.current === "seat";
    const isSeatApproach = isSofaSeatApproach || isLaptopSeatApproach;
    const distance3D = groupRef.current.position.distanceTo(targetPos);
    const reachedCurrentTarget = isSeatApproach ? distance3D <= 0.11 : distanceXZ <= distanceThreshold;

    const isMoving = !reachedCurrentTarget;
    const poseStopThreshold = isSeatApproach ? 0.22 : 0.18;
    const shouldStopWalkPose = isSeatApproach ? distance3D <= poseStopThreshold : distanceXZ <= poseStopThreshold;

    const lieBackX = -0.3;
    const poseMoving =
      reducedMotion ? false : (activeZone === "exercising" ? isMoving : (isMoving && !shouldStopWalkPose));

    if (!poseMoving && !hasArrived.current) {
      const isReadyForArrival =
        (activeZone === "reading" && readingNavRef.current === "seat") ||
        (activeZone === "laptop" && laptopNavRef.current === "seat") ||
        (activeZone !== "reading" && activeZone !== "laptop");
      if (isReadyForArrival) {
        hasArrived.current = true;
        if (activeZone === "exercising") {
          setIsExercising(true);
        }
        if (onArrival) onArrival(activeZone);
      }
    }

    if (isMoving) {
      const dx = targetPos.x - groupRef.current.position.x;
      const dz = targetPos.z - groupRef.current.position.z;
      const moveRot = Math.atan2(dx, dz);
      let diff = moveRot - groupRef.current.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      groupRef.current.rotation.y += diff * rotToMoveDir;

      moveTarget.set(targetPos.x, isSeatApproach ? targetPos.y : 0, targetPos.z);
      groupRef.current.position.lerp(moveTarget, moveLerp);
    } else {
      let diff = targetRot.current - groupRef.current.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      groupRef.current.rotation.y += diff * rotToMoveDir;

      groupRef.current.position.lerp(targetPos, idleLerp);
    }

    const canLieOnSofa =
      activeZone === "reading" &&
      readingNavRef.current === "seat" &&
      !isMoving &&
      groupRef.current.position.y > 0.42;

    if (reducedMotion) {
      groupRef.current.rotation.x = 0;
    } else if (canLieOnSofa) {
      groupRef.current.rotation.x += (lieBackX - groupRef.current.rotation.x) * 0.35;
    } else {
      groupRef.current.rotation.x += (0 - groupRef.current.rotation.x) * 0.12;
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

    if (poseMoving) {
      if (bodyRef.current) bodyRef.current.position.y = 0.25 + Math.abs(Math.sin(t * 8)) * 0.04;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 8) * 0.45;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.sin(t * 8) * 0.45;
      if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.sin(t * 8) * 0.5;
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * 8) * 0.5;
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
        const onSeatLying =
          readingNavRef.current === "seat" && groupRef.current.position.y > 0.42;

        if (readingNavRef.current === "front" && !poseMoving) {
          if (leftArmRef.current) {
            leftArmRef.current.rotation.x = -0.15;
            leftArmRef.current.rotation.z = 0.08;
          }
          if (rightArmRef.current) {
            rightArmRef.current.rotation.x = -0.15;
            rightArmRef.current.rotation.z = -0.08;
          }
          if (headRef.current) {
            headRef.current.rotation.x = 0.06;
            headRef.current.rotation.y = Math.sin(t * 0.8) * 0.04;
          }
        } else if (onSeatLying && !poseMoving) {
          if (bodyRef.current) {
            bodyRef.current.rotation.x = -0.36;
            bodyRef.current.position.y = 0.12;
            bodyRef.current.position.z = 0.2;
          }

          if (leftLegRef.current) leftLegRef.current.rotation.x = -0.28;
          if (rightLegRef.current) rightLegRef.current.rotation.x = -0.24;
          if (leftKneeRef.current) leftKneeRef.current.rotation.x = 0.78;
          if (rightKneeRef.current) rightKneeRef.current.rotation.x = 0.72;

          if (leftArmRef.current) {
            leftArmRef.current.rotation.x = -0.42;
            leftArmRef.current.rotation.z = 0.26;
          }
          if (rightArmRef.current) {
            rightArmRef.current.rotation.x = -0.36;
            rightArmRef.current.rotation.z = -0.22;
          }

          if (headRef.current) {
            headRef.current.rotation.x = 0.26;
            headRef.current.rotation.y = Math.sin(t * 0.2) * 0.015;
          }
        } else if (!poseMoving) {
          if (headRef.current) headRef.current.rotation.y = Math.sin(t * 0.8) * 0.03;
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
      <AvatarSpeechBubble activeZone={activeZone} visible={showSpeech} qualityMode={qualityMode} />
      <group ref={bodyRef}>
        <group ref={headRef} position={[0, 0.65, 0]}>
          <Cylinder args={[0.06, 0.08, 0.1, 20]} position={[0, -0.15, 0]} castShadow>
            <meshStandardMaterial color={skinColor} roughness={0.58} />
          </Cylinder>
          <Sphere args={[0.26, 40, 32]} position={[0, 0.03, -0.04]} scale={[1.02, 0.92, 1]} castShadow>
            <meshStandardMaterial color={hairColor} roughness={0.72} />
          </Sphere>
          <Sphere args={[0.24, 40, 32]} position={[0, -0.02, 0.04]} scale={[0.96, 1.02, 0.95]} castShadow receiveShadow>
            <meshStandardMaterial color={skinColor} roughness={0.46} />
          </Sphere>
          <RoundedBox args={[0.09, 0.055, 0.07]} position={[-0.09, 0.2, 0.1]} rotation={[0.16, 0, -0.12]} radius={0.025} castShadow>
            <meshStandardMaterial color={hairColor} roughness={0.76} />
          </RoundedBox>
          <RoundedBox args={[0.12, 0.06, 0.08]} position={[0.04, 0.21, 0.11]} rotation={[0.1, 0, 0.18]} radius={0.025} castShadow>
            <meshStandardMaterial color={hairColor} roughness={0.76} />
          </RoundedBox>
          <Sphere args={[0.028, 20, 20]} position={[-0.09, 0.02, 0.255]}>
            <meshBasicMaterial color="#111827" />
          </Sphere>
          <Sphere args={[0.028, 20, 20]} position={[0.09, 0.02, 0.255]}>
            <meshBasicMaterial color="#111827" />
          </Sphere>
          <Sphere args={[0.008, 12, 12]} position={[-0.082, 0.03, 0.278]}>
            <meshBasicMaterial color="#ffffff" />
          </Sphere>
          <Sphere args={[0.008, 12, 12]} position={[0.098, 0.03, 0.278]}>
            <meshBasicMaterial color="#ffffff" />
          </Sphere>
          <RoundedBox args={[0.12, 0.018, 0.012]} position={[0, -0.075, 0.27]} radius={0.008}>
            <meshBasicMaterial color="#9f4f4f" />
          </RoundedBox>
          <Sphere args={[0.04, 18, 18]} position={[-0.13, -0.04, 0.24]}>
            <meshBasicMaterial color="#ff9999" transparent opacity={0.5} />
          </Sphere>
          <Sphere args={[0.04, 18, 18]} position={[0.13, -0.04, 0.24]}>
            <meshBasicMaterial color="#ff9999" transparent opacity={0.5} />
          </Sphere>
        </group>

        <group position={[0, 0.2, 0]}>
          <RoundedBox args={[0.38, 0.44, 0.24]} radius={0.09} castShadow receiveShadow>
            <meshStandardMaterial color={vestColor} roughness={0.62} />
          </RoundedBox>
          <RoundedBox args={[0.22, 0.39, 0.25]} position={[0, 0.015, 0.012]} radius={0.055} castShadow receiveShadow>
            <meshStandardMaterial color={shirtColor} roughness={0.5} />
          </RoundedBox>
          <RoundedBox args={[0.055, 0.19, 0.016]} position={[0, 0.08, 0.14]} radius={0.01}>
            <meshBasicMaterial color="#94a3b8" />
          </RoundedBox>
        </group>

        <group ref={leftArmRef} position={[-0.2, 0.35, 0]}>
          <Cylinder args={[0.048, 0.04, 0.25, 20]} position={[0, -0.12, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={skinColor} roughness={0.54} />
          </Cylinder>
          <Cylinder args={[0.064, 0.052, 0.12, 20]} position={[0, -0.04, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={vestColor} roughness={0.58} />
          </Cylinder>
          <Sphere args={[0.052, 20, 20]} position={[0, -0.26, 0]} castShadow>
            <meshStandardMaterial color={skinColor} roughness={0.48} />
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
          <Cylinder args={[0.048, 0.04, 0.25, 20]} position={[0, -0.12, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={skinColor} roughness={0.54} />
          </Cylinder>
          <Cylinder args={[0.064, 0.052, 0.12, 20]} position={[0, -0.04, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={vestColor} roughness={0.58} />
          </Cylinder>
          <Sphere args={[0.052, 20, 20]} position={[0, -0.26, 0]} castShadow>
            <meshStandardMaterial color={skinColor} roughness={0.48} />
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
          <Cylinder args={[0.064, 0.052, 0.2, 20]} position={[0, -0.1, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={pantsColor} roughness={0.72} />
          </Cylinder>
          <group ref={leftKneeRef} position={[0, -0.2, 0]}>
            <Cylinder args={[0.052, 0.04, 0.2, 20]} position={[0, -0.1, 0]} castShadow receiveShadow>
              <meshStandardMaterial color={pantsColor} roughness={0.72} />
            </Cylinder>
            <RoundedBox args={[0.12, 0.05, 0.18]} position={[0, -0.2, 0.04]} radius={0.025} castShadow>
              <meshStandardMaterial color={shoeColor} roughness={0.58} />
            </RoundedBox>
          </group>
        </group>
        
        <group ref={rightLegRef} position={[0.1, 0, 0]}>
          <Cylinder args={[0.064, 0.052, 0.2, 20]} position={[0, -0.1, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={pantsColor} roughness={0.72} />
          </Cylinder>
          <group ref={rightKneeRef} position={[0, -0.2, 0]}>
            <Cylinder args={[0.052, 0.04, 0.2, 20]} position={[0, -0.1, 0]} castShadow receiveShadow>
              <meshStandardMaterial color={pantsColor} roughness={0.72} />
            </Cylinder>
            <RoundedBox args={[0.12, 0.05, 0.18]} position={[0, -0.2, 0.04]} radius={0.025} castShadow>
              <meshStandardMaterial color={shoeColor} roughness={0.58} />
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

function DioramaRoom({ reducedMotion = false, activeZone = "all", onZoneClick, isLaptopMode, hasArrived }: AboutSceneProps & { isLaptopMode: boolean; hasArrived: boolean }) {
  const handleZoneClick = (zone: ActiveZone) => {
    if (onZoneClick) onZoneClick(zone);
  };
  const palette = {
    floor: "#d8e0eb",
    wall: "#f7f9fc",
    wallAccent: "#e6edf7",
    trim: "#7b8798",
    frame: "#334155",
    glass: "#d7ecff",
    warmLight: "#fff2cc",
    brass: "#c49a5b",
    sofa: "#60786b",
    pillow: "#e36f68",
    desk: "#475569",
    deskMetal: "#1f2937",
    cream: "#f8fafc",
    plantPot: "#475569",
    leaf1: "#2f8f6b",
    leaf2: "#35a77b",
    leaf3: "#5bb99a",
    shelfBody: "#243447",
    shelfLayer: "#3f5168",
    accentA: "#f59e0b",
    accentB: "#0ea5e9",
    accentC: "#22c55e",
  };

  return (
    <group position={[0, -1, 0]}>
      <Box args={[8, 0.4, 8]} position={[0, -0.2, 0]} receiveShadow>
        <meshStandardMaterial color={palette.floor} roughness={0.85} />
      </Box>
      
      <Box args={[0.4, 5, 8]} position={[-4.2, 2.5, 0]} receiveShadow castShadow>
        <meshStandardMaterial color={palette.wall} roughness={0.92} />
      </Box>
      
      <group position={[0, 2.5, -4.2]}>
        <Box args={[8, 1.2, 0.4]} position={[0, 1.9, 0]} receiveShadow castShadow><meshStandardMaterial color={palette.wallAccent} roughness={0.92} /></Box>
        <Box args={[8, 1.2, 0.4]} position={[0, -1.9, 0]} receiveShadow castShadow><meshStandardMaterial color={palette.wallAccent} roughness={0.92} /></Box>
        <Box args={[2, 2.6, 0.4]} position={[-3, 0, 0]} receiveShadow castShadow><meshStandardMaterial color={palette.wallAccent} roughness={0.92} /></Box>
        <Box args={[2, 2.6, 0.4]} position={[3, 0, 0]} receiveShadow castShadow><meshStandardMaterial color={palette.wallAccent} roughness={0.92} /></Box>
      </group>

      <Box args={[0.1, 0.4, 8]} position={[-3.95, 0.2, 0]} receiveShadow><meshStandardMaterial color={palette.trim} roughness={0.85} /></Box>
      <Box args={[8, 0.4, 0.1]} position={[0, 0.2, -3.95]} receiveShadow><meshStandardMaterial color={palette.trim} roughness={0.85} /></Box>

      <group position={[0, 2.55, -3.98]}>
        <RoundedBox args={[4.45, 2.85, 0.12]} position={[0, 0, 0]} radius={0.06} castShadow receiveShadow>
          <meshStandardMaterial color="#f8fafc" roughness={0.58} />
        </RoundedBox>
        <mesh position={[0, 0, 0.075]}>
          <planeGeometry args={[4.08, 2.42]} />
          <meshBasicMaterial color="#38bdf8" toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.86, 0.078]}>
          <planeGeometry args={[4.08, 0.7]} />
          <meshBasicMaterial color="#1d4ed8" toneMapped={false} transparent opacity={0.34} />
        </mesh>
        <mesh position={[-1.15, -0.62, 0.079]}>
          <planeGeometry args={[1.35, 0.62]} />
          <meshBasicMaterial color="#0f766e" toneMapped={false} transparent opacity={0.42} />
        </mesh>
        <mesh position={[0.72, -0.7, 0.08]}>
          <planeGeometry args={[1.7, 0.5]} />
          <meshBasicMaterial color="#15803d" toneMapped={false} transparent opacity={0.42} />
        </mesh>
        <mesh position={[0.9, 0.42, 0.081]}>
          <circleGeometry args={[0.32, 32]} />
          <meshBasicMaterial color="#fde68a" transparent opacity={0.98} toneMapped={false} />
        </mesh>
        <Box args={[0.28, 0.72, 0.035]} position={[-1.62, -0.48, 0.1]} castShadow>
          <meshBasicMaterial color="#075985" toneMapped={false} />
        </Box>
        <Box args={[0.34, 0.92, 0.035]} position={[-1.18, -0.36, 0.1]} castShadow>
          <meshBasicMaterial color="#0c4a6e" toneMapped={false} />
        </Box>
        <Box args={[0.24, 0.56, 0.035]} position={[-0.7, -0.56, 0.1]} castShadow>
          <meshBasicMaterial color="#0369a1" toneMapped={false} />
        </Box>
        <Box args={[4.34, 0.12, 0.14]} position={[0, 1.32, 0.13]} castShadow><meshStandardMaterial color={palette.frame} roughness={0.55} /></Box>
        <Box args={[4.34, 0.12, 0.14]} position={[0, -1.32, 0.13]} castShadow><meshStandardMaterial color={palette.frame} roughness={0.55} /></Box>
        <Box args={[0.12, 2.72, 0.14]} position={[-2.17, 0, 0.13]} castShadow><meshStandardMaterial color={palette.frame} roughness={0.55} /></Box>
        <Box args={[0.12, 2.72, 0.14]} position={[2.17, 0, 0.13]} castShadow><meshStandardMaterial color={palette.frame} roughness={0.55} /></Box>
        <Box args={[0.08, 2.42, 0.15]} position={[0, 0, 0.15]} castShadow><meshStandardMaterial color={palette.frame} roughness={0.55} /></Box>
        <Box args={[4.08, 0.08, 0.15]} position={[0, 0, 0.15]} castShadow><meshStandardMaterial color={palette.frame} roughness={0.55} /></Box>
        <Box args={[4.64, 0.16, 0.3]} position={[0, -1.55, 0.26]} castShadow receiveShadow>
          <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
        </Box>
      </group>

      {/* open-top room: 천장은 제거하고 상부 조명만 유지 */}
      <pointLight position={[0, 4.2, 0]} intensity={0.72} color={palette.warmLight} distance={9} />
      <spotLight position={[-2.7, 4.8, 2.8]} angle={0.46} penumbra={0.65} intensity={1.15} color="#e0f2fe" distance={12} castShadow />

      {/* low wall rail under the window */}
      <Box args={[3.65, 0.07, 0.08]} position={[0, 0.95, -3.78]}>
        <meshStandardMaterial color={palette.brass} emissive={palette.brass} emissiveIntensity={0.24} metalness={0.35} roughness={0.45} />
      </Box>

      {/* wall frames */}
      <group position={[-3.98, 2.7, 1.6]} rotation={[0, Math.PI / 2, 0]}>
        <Box args={[1.3, 0.9, 0.08]} castShadow><meshStandardMaterial color={palette.frame} roughness={0.75} /></Box>
        <Box args={[1.08, 0.68, 0.09]} position={[0, 0, 0.01]}><meshStandardMaterial color={palette.cream} /></Box>
        <mesh position={[0, 0, 0.055]}>
          <planeGeometry args={[0.96, 0.56]} />
          <meshBasicMaterial color={palette.accentC} />
        </mesh>
      </group>
      <group position={[2.92, 3.25, -3.92]}>
        <Box args={[1.18, 0.82, 0.08]} castShadow><meshStandardMaterial color={palette.frame} roughness={0.72} /></Box>
        <Box args={[0.98, 0.62, 0.09]} position={[0, 0, 0.01]}><meshStandardMaterial color={palette.cream} roughness={0.7} /></Box>
        <mesh position={[0, 0.02, 0.058]}>
          <planeGeometry args={[0.84, 0.48]} />
          <meshBasicMaterial color="#111827" toneMapped={false} />
        </mesh>
        <mesh position={[-0.16, 0.08, 0.06]}>
          <planeGeometry args={[0.34, 0.2]} />
          <meshBasicMaterial color="#0ea5e9" toneMapped={false} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0.22, -0.07, 0.061]}>
          <planeGeometry args={[0.32, 0.16]} />
          <meshBasicMaterial color="#22c55e" toneMapped={false} transparent opacity={0.82} />
        </mesh>
        <Box args={[1.28, 0.08, 0.12]} position={[0, -0.48, 0.02]} castShadow><meshStandardMaterial color={palette.brass} metalness={0.35} roughness={0.45} /></Box>
      </group>

      <Cylinder args={[3, 3, 0.04, 96]} position={[0, 0.02, 0]} receiveShadow>
        <meshStandardMaterial color="#eef4fb" roughness={0.82} />
      </Cylinder>
      <Cylinder args={[2.95, 2.95, 0.012, 96]} position={[0, 0.06, 0]} receiveShadow>
        <meshStandardMaterial color="#c9d6e6" roughness={0.88} transparent opacity={0.5} />
      </Cylinder>

      <InteractiveZone position={[-2.5, 0, -2.5]} zone="laptop" onClick={handleZoneClick}>
        <RoundedBox args={[2.35, 0.12, 1.25]} position={[0, 1, 0]} radius={0.07} castShadow receiveShadow>
          <meshStandardMaterial color={palette.desk} roughness={0.48} metalness={0.08} />
        </RoundedBox>
        <RoundedBox args={[2.05, 0.045, 0.88]} position={[0, 1.08, 0.02]} radius={0.035} castShadow receiveShadow>
          <meshStandardMaterial color="#64748b" roughness={0.5} />
        </RoundedBox>
        <Cylinder args={[0.06, 0.06, 1, 16]} position={[-0.9, 0.5, -0.4]} castShadow receiveShadow><meshStandardMaterial color={palette.deskMetal} /></Cylinder>
        <Cylinder args={[0.06, 0.06, 1, 16]} position={[0.9, 0.5, -0.4]} castShadow receiveShadow><meshStandardMaterial color={palette.deskMetal} /></Cylinder>
        <Cylinder args={[0.06, 0.06, 1, 16]} position={[-0.9, 0.5, 0.4]} castShadow receiveShadow><meshStandardMaterial color={palette.deskMetal} /></Cylinder>
        <Cylinder args={[0.06, 0.06, 1, 16]} position={[0.9, 0.5, 0.4]} castShadow receiveShadow><meshStandardMaterial color={palette.deskMetal} /></Cylinder>
        
        <group position={[0, 1.05, 0]}>
            <RoundedBox args={[0.7, 0.03, 0.5]} position={[0, 0, 0]} radius={0.01} castShadow><meshStandardMaterial color="#d6d2cc" metalness={0.55} roughness={0.35} /></RoundedBox>
          <Box args={[0.6, 0.031, 0.25]} position={[0, 0, 0.05]}><meshStandardMaterial color="#333" /></Box>
          <group position={[0, 0.015, -0.25]} rotation={[-0.2, 0, 0]}>
              <RoundedBox args={[0.7, 0.5, 0.03]} position={[0, 0.25, 0]} radius={0.01} castShadow><meshStandardMaterial color="#d6d2cc" metalness={0.55} roughness={0.35} /></RoundedBox>
            <Box args={[0.66, 0.46, 0.031]} position={[0, 0.25, 0.001]}><meshStandardMaterial color="#0f172a" /></Box>
            <mesh position={[0, 0.25, 0.017]}>
              <planeGeometry args={[0.62, 0.42]} />
                <meshBasicMaterial color="#0ea5e9" transparent opacity={0.86} />
            </mesh>
            <mesh position={[-0.12, 0.31, 0.019]}>
              <planeGeometry args={[0.22, 0.035]} />
              <meshBasicMaterial color="#e0f2fe" transparent opacity={0.8} />
            </mesh>
            <mesh position={[0.12, 0.23, 0.019]}>
              <planeGeometry args={[0.28, 0.035]} />
              <meshBasicMaterial color="#bbf7d0" transparent opacity={0.75} />
            </mesh>
          </group>
        </group>

        <group position={[-0.8, 1.05, -0.3]}>
          <Cylinder args={[0.12, 0.15, 0.05, 32]} castShadow><meshStandardMaterial color={palette.brass} metalness={0.6} roughness={0.35} /></Cylinder>
          <Cylinder args={[0.02, 0.02, 0.5, 16]} position={[0, 0.25, 0]} castShadow><meshStandardMaterial color={palette.brass} metalness={0.6} roughness={0.35} /></Cylinder>
          <Sphere args={[0.15, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} position={[0, 0.5, 0]} rotation={[0.5, 0, 0]} castShadow>
            <meshStandardMaterial color={isLaptopMode ? "#ffe3b1" : palette.cream} side={2} />
          </Sphere>
          {isLaptopMode && (
            <pointLight position={[0, 0.4, 0.1]} intensity={2.8} color="#ffd89b" distance={4.5} />
          )}
        </group>

        <group position={[0, 0.5, 0.8]}>
          <Cylinder args={[0.05, 0.05, 0.5, 16]} position={[0, 0, 0]} castShadow><meshStandardMaterial color={palette.deskMetal} /></Cylinder>
          <Cylinder args={[0.3, 0.3, 0.05, 32]} position={[0, -0.25, 0]} castShadow><meshStandardMaterial color="#111" /></Cylinder>
          <RoundedBox args={[0.68, 0.1, 0.68]} position={[0, 0.25, 0]} radius={0.06} castShadow receiveShadow><meshStandardMaterial color="#e2e8f0" roughness={0.65} /></RoundedBox>
          <RoundedBox args={[0.6, 0.6, 0.1]} position={[0, 0.55, 0.25]} radius={0.05} castShadow receiveShadow><meshStandardMaterial color={palette.cream} /></RoundedBox>
          <RoundedBox args={[0.48, 0.09, 0.45]} position={[0, 0.83, 0.04]} radius={0.04} castShadow receiveShadow><meshStandardMaterial color="#94a3b8" roughness={0.72} /></RoundedBox>
        </group>
      </InteractiveZone>

      <InteractiveZone position={[2.5, 0, -2.5]} zone="reading" onClick={handleZoneClick}>
        <group position={[0, 0.3, 0]} rotation={[0, -Math.PI / 6, 0]}>
          <RoundedBox args={[1.48, 0.54, 1.42]} position={[0, 0, 0]} radius={0.18} castShadow receiveShadow><meshStandardMaterial color={palette.sofa} roughness={0.74} /></RoundedBox>
          <RoundedBox args={[1.48, 1.16, 0.38]} position={[0, 0.4, -0.5]} radius={0.18} castShadow receiveShadow><meshStandardMaterial color="#536b60" roughness={0.78} /></RoundedBox>
          <RoundedBox args={[0.31, 0.75, 1.2]} position={[-0.66, 0.2, 0.1]} radius={0.14} castShadow receiveShadow><meshStandardMaterial color="#536b60" roughness={0.78} /></RoundedBox>
          <RoundedBox args={[0.31, 0.75, 1.2]} position={[0.66, 0.2, 0.1]} radius={0.14} castShadow receiveShadow><meshStandardMaterial color="#536b60" roughness={0.78} /></RoundedBox>
          <RoundedBox args={[0.58, 0.14, 0.82]} position={[-0.32, 0.31, 0.18]} radius={0.08} castShadow receiveShadow><meshStandardMaterial color="#6f8879" roughness={0.82} /></RoundedBox>
          <RoundedBox args={[0.58, 0.14, 0.82]} position={[0.32, 0.31, 0.18]} radius={0.08} castShadow receiveShadow><meshStandardMaterial color="#6f8879" roughness={0.82} /></RoundedBox>
          <RoundedBox args={[0.6, 0.4, 0.2]} position={[0, 0.4, -0.2]} rotation={[0.2, 0, 0]} radius={0.1} castShadow><meshStandardMaterial color={palette.pillow} roughness={0.62} /></RoundedBox>
        </group>

        <group position={[1.2, 0, -0.5]}>
          <Cylinder args={[0.2, 0.2, 0.05, 32]} position={[0, 0.025, 0]} castShadow><meshStandardMaterial color={palette.brass} metalness={0.45} roughness={0.4} /></Cylinder>
          <Cylinder args={[0.03, 0.03, 2.5, 16]} position={[0, 1.25, 0]} castShadow><meshStandardMaterial color={palette.brass} metalness={0.45} roughness={0.4} /></Cylinder>
          <Cylinder args={[0.3, 0.4, 0.5, 32]} position={[0, 2.5, 0]} castShadow><meshStandardMaterial color={palette.warmLight} side={2} transparent opacity={0.9} /></Cylinder>
          {!isLaptopMode && <pointLight position={[0, 2.5, 0]} intensity={1.2} color={palette.warmLight} distance={5} />}
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

      <InteractiveZone position={[0, 0, 0]} zone="all" onClick={handleZoneClick}>
        <Cylinder args={[0.45, 0.45, 0.03, 32]} position={[0, 0.03, 0]} receiveShadow>
          <meshStandardMaterial color={activeZone === "all" ? "#fde68a" : "#f8fafc"} opacity={0.7} transparent />
        </Cylinder>
      </InteractiveZone>
      
      <group position={[-3.2, 0, 2.5]}>
        <Cylinder args={[0.4, 0.3, 0.8]} position={[0, 0.4, 0]} castShadow receiveShadow><meshStandardMaterial color={palette.plantPot} roughness={0.85} /></Cylinder>
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.1}>
          <group position={[0, 1.2, 0]}>
            <Sphere args={[0.8, 16, 16]} position={[0, 0, 0]} castShadow receiveShadow><meshStandardMaterial color={palette.leaf1} roughness={0.8} /></Sphere>
            <Sphere args={[0.6, 16, 16]} position={[0.5, -0.2, 0.3]} castShadow receiveShadow><meshStandardMaterial color={palette.leaf2} roughness={0.8} /></Sphere>
            <Sphere args={[0.5, 16, 16]} position={[-0.4, -0.1, -0.4]} castShadow receiveShadow><meshStandardMaterial color={palette.leaf3} roughness={0.8} /></Sphere>
          </group>
        </Float>
      </group>

      {/* side table + books near sofa (restore) */}
      <group position={[3.35, 0, -1.8]}>
        <Cylinder args={[0.25, 0.25, 0.55, 24]} position={[0, 0.28, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={palette.frame} roughness={0.8} />
        </Cylinder>
        <Cylinder args={[0.34, 0.34, 0.04, 24]} position={[0, 0.56, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={palette.accentA} roughness={0.75} />
        </Cylinder>
        <Box args={[0.28, 0.05, 0.18]} position={[0, 0.62, 0.03]} castShadow>
          <meshStandardMaterial color={palette.accentC} />
        </Box>
        <Box args={[0.28, 0.05, 0.18]} position={[0.02, 0.67, -0.02]} castShadow>
          <meshStandardMaterial color={palette.accentB} />
        </Box>
      </group>

      {/* open tech shelf */}
      <group position={[-3.64, 0, 0.18]}>
        <Box args={[0.09, 2.95, 0.09]} position={[0, 1.48, -0.96]} castShadow><meshStandardMaterial color={palette.shelfBody} roughness={0.62} /></Box>
        <Box args={[0.09, 2.95, 0.09]} position={[0, 1.48, 0.96]} castShadow><meshStandardMaterial color={palette.shelfBody} roughness={0.62} /></Box>
        <Box args={[0.09, 2.95, 0.09]} position={[0.56, 1.48, -0.96]} castShadow><meshStandardMaterial color={palette.shelfBody} roughness={0.62} /></Box>
        <Box args={[0.09, 2.95, 0.09]} position={[0.56, 1.48, 0.96]} castShadow><meshStandardMaterial color={palette.shelfBody} roughness={0.62} /></Box>
        <Box args={[0.68, 0.07, 2.1]} position={[0.28, 0.56, 0]} castShadow receiveShadow><meshStandardMaterial color={palette.shelfLayer} roughness={0.7} /></Box>
        <Box args={[0.68, 0.07, 2.1]} position={[0.28, 1.34, 0]} castShadow receiveShadow><meshStandardMaterial color={palette.shelfLayer} roughness={0.7} /></Box>
        <Box args={[0.68, 0.07, 2.1]} position={[0.28, 2.12, 0]} castShadow receiveShadow><meshStandardMaterial color={palette.shelfLayer} roughness={0.7} /></Box>
        <Box args={[0.68, 0.07, 2.1]} position={[0.28, 2.9, 0]} castShadow receiveShadow><meshStandardMaterial color={palette.shelfLayer} roughness={0.7} /></Box>

        <group position={[0.26, 0.68, -0.58]}>
          <RoundedBox args={[0.5, 0.18, 0.32]} radius={0.025} castShadow receiveShadow><meshStandardMaterial color="#e2e8f0" roughness={0.54} /></RoundedBox>
          <mesh position={[-0.14, 0.03, 0.17]}>
            <planeGeometry args={[0.07, 0.04]} />
            <meshBasicMaterial color={palette.accentC} />
          </mesh>
          <mesh position={[0.02, 0.03, 0.17]}>
            <planeGeometry args={[0.07, 0.04]} />
            <meshBasicMaterial color={palette.accentC} />
          </mesh>
          <mesh position={[0.18, 0.03, 0.17]}>
            <planeGeometry args={[0.07, 0.04]} />
            <meshBasicMaterial color={palette.accentC} />
          </mesh>
        </group>
        <group position={[0.28, 1.46, 0.28]}>
          <Box args={[0.46, 0.16, 0.3]} castShadow receiveShadow><meshStandardMaterial color="#f8fafc" roughness={0.55} /></Box>
          <mesh position={[0, 0.03, 0.155]}>
            <planeGeometry args={[0.28, 0.045]} />
            <meshBasicMaterial color={palette.accentB} />
          </mesh>
        </group>
        <group position={[0.24, 2.24, -0.16]}>
          <Box args={[0.08, 0.46, 0.22]} position={[0, 0.2, -0.34]} rotation={[0, 0, 0.08]} castShadow><meshStandardMaterial color={palette.accentA} roughness={0.64} /></Box>
          <Box args={[0.08, 0.5, 0.22]} position={[0, 0.23, -0.18]} rotation={[0, 0, -0.04]} castShadow><meshStandardMaterial color={palette.accentB} roughness={0.64} /></Box>
          <Box args={[0.08, 0.4, 0.22]} position={[0, 0.18, -0.02]} rotation={[0, 0, 0.06]} castShadow><meshStandardMaterial color={palette.accentC} roughness={0.64} /></Box>
          <Cylinder args={[0.18, 0.14, 0.32, 20]} position={[0.02, 0.16, 0.52]} castShadow receiveShadow>
            <meshStandardMaterial color="#475569" roughness={0.72} />
          </Cylinder>
          <Sphere args={[0.24, 16, 16]} position={[0.02, 0.55, 0.52]} castShadow>
            <meshStandardMaterial color={palette.leaf2} roughness={0.78} />
          </Sphere>
        </group>
      </group>
    </group>
  );
}

function SceneContents({
  reducedMotion = false,
  activeZone = "all",
  onZoneClick,
  qualityMode = "high",
}: AboutSceneProps & { qualityMode?: QualityMode }) {
  const isUltra = qualityMode === "ultra";
  const castDetailedShadows = qualityMode !== "ultra";
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
        ambientColor: "#e0f2fe",
        ambientIntensity: 0.72,
        dirColor: "#fcd34d",
        dirIntensity: 1.15,
        fillColor: "#dbeafe",
        fillIntensity: 0.72,
      };
    }
    
    if (timeOfDay === "night") {
      return {
        ambientColor: "#dbeafe",
        ambientIntensity: 0.7,
        dirColor: "#93c5fd",
        dirIntensity: 0.92,
        fillColor: "#f8fafc",
        fillIntensity: 0.66,
      };
    } else if (timeOfDay === "sunset") {
      return {
        ambientColor: "#fef3c7",
        ambientIntensity: 0.82,
        dirColor: "#ffb703",
        dirIntensity: 1.28,
        fillColor: "#e0f2fe",
        fillIntensity: 0.78,
      };
    } else {
      return {
        ambientColor: "#f8fafc",
        ambientIntensity: 0.86,
        dirColor: "#ffffff",
        dirIntensity: 1.35,
        fillColor: "#dbeafe",
        fillIntensity: 0.84,
      };
    }
  };

  const lights = getLightSettings();

  return (
    <>
      {/* 그림자를 아주 연하게 만들기 위해 SoftShadows 제거 (기본 그림자만 사용) */}
      
      {/* 환경광: 방 전체의 기본 밝기를 결정 (그림자 진 곳을 밝혀줌) */}
      <hemisphereLight intensity={0.52} color="#f8fafc" groundColor="#cbd5e1" />
      <ambientLight intensity={lights.ambientIntensity} color={lights.ambientColor} />
      
      {/* 메인 방향광: 그림자를 생성하는 빛 */}
      <directionalLight
        castShadow={castDetailedShadows}
        position={[10, 15, -10]}
        intensity={lights.dirIntensity}
        color={lights.dirColor}
        shadow-mapSize-width={qualityMode === "high" ? 2048 : 1024}
        shadow-mapSize-height={qualityMode === "high" ? 2048 : 1024}
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
      <directionalLight position={[0, 10, 10]} intensity={lights.fillIntensity * 0.42} color={lights.fillColor} />

      <DioramaRoom reducedMotion={reducedMotion} activeZone={activeZone} onZoneClick={onZoneClick} isLaptopMode={isLaptopMode} hasArrived={hasArrived} />
      
      <group position={[0, -1, 0]}>
        <MainAvatar
          activeZone={activeZone}
          reducedMotion={reducedMotion}
          onArrival={handleArrival}
          showSpeech={hasArrived}
          qualityMode={qualityMode}
        />
      </group>
      
      {!isUltra && (
        <ContactShadows
          position={[0, -1.05, 0]}
          opacity={qualityMode === "high" ? 0.2 : 0.14}
          scale={25}
          blur={qualityMode === "high" ? 2.5 : 1.8}
          far={4}
          resolution={qualityMode === "high" ? 512 : 256}
          color="#000000"
        />
      )}
      <CameraRig reducedMotion={reducedMotion} qualityMode={qualityMode} />
    </>
  );
}

function AboutSceneFallback({ unavailable = false }: { unavailable?: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#f6ede0] via-[#efe0cc] to-[#e4cfb4] p-6">
      <div className="w-full max-w-[520px] rounded-2xl border border-white/70 bg-white/55 p-6 backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
          About Room
        </p>
        <h3 className="mt-3 text-2xl font-bold text-zinc-900">
          3D Room Preview
        </h3>
        <p className="mt-3 text-sm leading-7 text-zinc-700">
          {unavailable
            ? "현재 브라우저 환경에서는 WebGL 컨텍스트를 만들 수 없어 3D 장면 대신 경량 모드로 전환되었습니다."
            : "3D 장면을 불러오는 중입니다. 잠시 후 자동으로 전환됩니다."}
        </p>
        {unavailable && (
          <div className="mt-4 rounded-xl border border-amber-200/70 bg-amber-50/70 p-4 text-sm text-zinc-700">
            <p className="font-semibold text-zinc-800">
              Chrome에서 하드웨어 가속을 켜면 3D 장면을 볼 수 있어요.
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li><code>Chrome 설정 &gt; 시스템</code>으로 이동</li>
              <li><code>가능한 경우 그래픽 가속 사용</code>을 켜기</li>
              <li>브라우저 재시작 후 About 페이지 다시 열기</li>
            </ol>
          </div>
        )}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="h-14 rounded-lg bg-zinc-200/80" />
          <div className="h-14 rounded-lg bg-zinc-200/80" />
          <div className="h-14 rounded-lg bg-zinc-200/80" />
        </div>
      </div>
    </div>
  );
}

export default function AboutScene({ reducedMotion = false, activeZone = "all", onZoneClick }: AboutSceneProps) {
  const [qualityMode, setQualityMode] = useState<QualityMode>("high");
  const [webglChecked, setWebglChecked] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let available = false;
    try {
      const canvas = document.createElement("canvas");
      const contextAttributes: WebGLContextAttributes = {
        alpha: true,
        antialias: false,
        depth: true,
        stencil: false,
        failIfMajorPerformanceCaveat: true,
        powerPreference: "high-performance",
      };

      const gl2 = canvas.getContext("webgl2", contextAttributes);
      const gl =
        gl2 ??
        canvas.getContext("webgl", contextAttributes) ??
        canvas.getContext("experimental-webgl");

      available = Boolean(gl);
    } catch {
      available = false;
    }

    setWebglAvailable(available);
    setWebglChecked(true);
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const memory = nav.deviceMemory ?? 8;
    const cores = nav.hardwareConcurrency ?? 8;
    const isLikelyUltraLow = memory <= 3 || cores <= 2;
    const isLikelyLow = memory <= 4 || cores <= 4;

    if (isLikelyUltraLow) {
      setQualityMode("ultra");
      return;
    }

    setQualityMode(isLikelyLow ? "low" : "high");
  }, []);

  if (!webglChecked) {
    return <AboutSceneFallback />;
  }

  if (!webglAvailable) {
    return <AboutSceneFallback unavailable />;
  }

  return (
    <div className="absolute inset-0 cursor-pointer">
      <Canvas
        dpr={
          qualityMode === "ultra"
            ? [0.9, 1.1]
            : qualityMode === "low"
              ? [1, 1.5]
              : [1.25, 2]
        }
        camera={{ position: [8, 7, 10], fov: 45 }}
        shadows={qualityMode !== "ultra"}
        gl={{
          antialias: qualityMode !== "ultra",
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = ACESFilmicToneMapping;
          gl.shadowMap.type = PCFSoftShadowMap;
        }}
        fallback={<AboutSceneFallback unavailable />}
      >
        <Suspense fallback={null}>
          <SceneContents
            reducedMotion={reducedMotion}
            activeZone={activeZone}
            onZoneClick={onZoneClick}
            qualityMode={qualityMode}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
