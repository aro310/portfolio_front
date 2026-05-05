import { Environment, OrbitControls, Html } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import { Avatar } from "./Avatar";

export const Experience = () => {
  const viewport = useThree((state) => state.viewport);
  const videoRef = useRef();
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = "/videos/ral.mp4";
    video.crossOrigin = "Anonymous";
    video.loop = true;
    video.muted = true;
    video.preload = "auto";

    videoRef.current = video;

    const handleCanPlay = () => {
      video.play()
        .then(() => setVideoReady(true))
        .catch(console.error);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.load();

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.pause();
    };
  }, []);

  return (
    <>
      <OrbitControls />
      <Environment preset="sunset" />

      {/* 🎯 SUSPENSE ICI */}
      <Suspense
        fallback={
          <Html center>
            <div style={{ color: "white", fontSize: "18px" }}>
              Chargement de l’avatar…
            </div>
          </Html>
        }
      >
        <Avatar position={[0, -3, 5]} scale={2} />
      </Suspense>

      {/* 🎥 Fond vidéo */}
      {videoReady && videoRef.current && (
        <mesh position={[0, 0, -5]}>
          <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
          <meshBasicMaterial>
            <videoTexture attach="map" args={[videoRef.current]} />
          </meshBasicMaterial>
        </mesh>
      )}
    </>
  );
};
