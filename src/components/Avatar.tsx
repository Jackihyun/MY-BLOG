"use client";

import React, { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Avatar() {
  const avatarRef = useRef<THREE.Group>(null);
  const pivotRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/face.glb", true);
  useEffect(() => {
    if (scene) {
      const boundingBox = new THREE.Box3().setFromObject(scene);
      const center = boundingBox.getCenter(new THREE.Vector3());
      scene.position.sub(center);
      scene.scale.set(4, 4, 4);

      if (pivotRef.current) {
        pivotRef.current.add(scene);
      }
    }
  }, [scene]);

  useEffect(() => {
    if (scene) {
      scene.traverse((object: any) => {
        if (object.isMesh) {
          object.material.color.convertSRGBToLinear();
          object.material.needsUpdate = true;
        }
      });
    }
  }, [scene]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0", // 배경색은 간단한 밝은 회색으로 설정
      }}
    >
      <Canvas
        onCreated={(state) => {
          state.gl.outputColorSpace = "srgb-linear";
        }}
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{
          width: "30vw",
          height: "30vw",
          maxWidth: "300px",
          minWidth: "200px",
          minHeight: "200px",
          maxHeight: "300px",
          aspectRatio: "1/1",
          borderRadius: "20px", // 테두리를 더 둥글게
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)", // 부드러운 그림자
          backgroundColor: "gray-100", // 캔버스 내부는 하얀색으로 설정
        }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <group ref={pivotRef}>
          <primitive object={scene} ref={avatarRef} />
        </group>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
