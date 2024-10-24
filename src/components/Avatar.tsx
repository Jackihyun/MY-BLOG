"use client";

import React, { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Avatar() {
  const avatarRef = useRef<THREE.Group>(null);
  const pivotRef = useRef<THREE.Group>(null);

  const { scene } = useGLTF("/models/face.glb");

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

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
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
          borderRadius: "20px",
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)",
          backgroundColor: "#fff",
        }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <group ref={pivotRef}>
          {/* avatarRef.current가 null이 아닐 때만 primitive를 렌더링 */}
          {avatarRef.current && <primitive object={avatarRef.current} />}
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
