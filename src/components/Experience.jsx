import { Environment, OrbitControls, Html, useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import { Avatar } from "./Avatar";
import { ImageBackground } from "./ImageBackground";

const Background = () => {
  const { scene } = useGLTF("/models/background.glb");
  return (
    <primitive
      object={scene}
      position={[2, -2.0, -2.0]}
      scale={2.25}
      rotation={[0, Math.PI / -2, 0]}
    />
  );
};

export const Experience = () => {
  return (
    <>
      <OrbitControls />
      <Environment preset="sunset" />

      <Suspense
        fallback={
          <Html center>
            <div style={{ color: "white" }}>
              Chargement de la scène…
            </div>
          </Html>
        }
      >
        <ImageBackground />
        <Avatar position={[0, -2.0, 5]} scale={1.44} />
        <Background />
      </Suspense>
    </>
  );
};

useGLTF.preload("/models/background.glb");
