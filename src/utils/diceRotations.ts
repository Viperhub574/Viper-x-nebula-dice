import { ColorId } from '../types';

export interface Rotation3D {
  x: number;
  y: number;
  z: number;
}

// Maps color face to its primary Euler angles (in degrees) to face the viewer
export function getBaseRotationForColor(colorId: ColorId): { x: number; y: number } {
  switch (colorId) {
    case 'kirmizi': // Front face
      return { x: 0, y: 0 };
    case 'mavi': // Back face
      return { x: 0, y: 180 };
    case 'yesil': // Right face
      return { x: 0, y: -90 };
    case 'sari': // Left face
      return { x: 0, y: 90 };
    case 'mor': // Top face
      return { x: -90, y: 0 };
    case 'turuncu': // Bottom face
      return { x: 90, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}

// Calculates next target rotation by adding full turns to previous rotation
export function getNextDiceRotation(
  colorId: ColorId,
  currentRotation: Rotation3D,
  spinMagnitude: number = 2
): Rotation3D {
  const base = getBaseRotationForColor(colorId);

  // Calculate multiples of 360 to keep rotation advancing realistically forward
  const currentTurnsX = Math.round(currentRotation.x / 360);
  const currentTurnsY = Math.round(currentRotation.y / 360);

  const nextTurnsX = currentTurnsX + spinMagnitude;
  const nextTurnsY = currentTurnsY + spinMagnitude;

  // Small wobble on Z axis for organic tumbling effect
  const randomWobbleZ = (Math.random() - 0.5) * 15;

  return {
    x: nextTurnsX * 360 + base.x,
    y: nextTurnsY * 360 + base.y,
    z: Math.round(randomWobbleZ),
  };
}
