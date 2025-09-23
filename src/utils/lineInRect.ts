/**
 * Checks if a line segment intersects or lies within a rectangle.
 * 
 * @param recX - Left X of the rectangle
 * @param recY - Top Y of the rectangle
 * @param recX2 - Right X of the rectangle
 * @param recY2 - Bottom Y of the rectangle
 * @param x1 - X of the first endpoint of the line
 * @param y1 - Y of the first endpoint of the line
 * @param x2 - X of the second endpoint of the line
 * @param y2 - Y of the second endpoint of the line
 * 
 * @returns 
 */

export default function lineInRect(
    recX: number,
    recY: number,
    recX2: number,
    recY2: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
) {
    let minX = x1;
    let maxX = x2;

    if (x1 > x2) {
        minX = x2;
        maxX = x1;
    }

    if (maxX > recX2) maxX = recX2;
    if (minX < recX) minX = recX;

    if (minX > maxX) return false;

    let minY = y1;
    let maxY = y2;
    const dx = x2 - x1;

    if (Math.abs(dx) > 0.0000001) {
        const a = (y2 - y1) / dx;
        const b = y1 - a * x1;

        minY = a * minX + b;
        maxY = a * maxX + b;
    }

    if (minY > maxY) {
        const tmp = maxY;

        maxY = minY;
        minY = tmp;
    }

    if (maxY > recY2) maxY = recY2;
    if (minY < recY) minY = recY;

    if (minY > maxY) return false;

    return true;
}
