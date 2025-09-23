import { Point } from "../types";

export default function getDist(a: Point, b: Point) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}