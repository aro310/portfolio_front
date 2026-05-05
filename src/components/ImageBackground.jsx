import { useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

export function ImageBackground() {
  const { viewport } = useThree();
  const texture = useTexture("/textures/bureau3.jpg");

  return (
    <mesh position={[0, 14.5, -50]} renderOrder={-100}>
      <planeGeometry args={[viewport.width * 12, viewport.height * 6]} />
      <meshBasicMaterial
        map={texture}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
