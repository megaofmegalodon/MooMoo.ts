export default function lerpAngle(a: number, b: number, t: number): number {
    const delta = ((b - a + Math.PI) % (2 * Math.PI)) - Math.PI;
    return a + delta * t;
}