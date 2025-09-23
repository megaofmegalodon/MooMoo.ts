import GameObject from "../../constants/GameObject";
import { STORE_HAT_MAP } from "../../constants/store";
import RendererUtils from "../../rendering/RendererUtils";
import getDist from "../../utils/getDist";
import ScriptConfig from "../../utils/ScriptConfig";
import Client from "../Client";

/**
 * The constant that holds all of the GameObjects.
 * This should never be loop through or used unless for rendering.
 */

export const gameObjects: Map<number, GameObject> = new Map();

export default class ObjectManager {
    private static gridMap: Map<string, GameObject[]> = new Map();
    private static chunkSize = 1440;

    static add(sid: number, x: number, y: number, dir: number, scale: number, type: number, id: number, setSID: boolean, owner?: number) {
        const gameObject = new GameObject(x, y, dir, scale, type, id, owner);
        if (setSID) gameObject.sid = sid;

        gameObjects.set(sid, gameObject);

        const key = this.getKey(x, y);
        if (!this.gridMap.has(key)) this.gridMap.set(key, []);
        this.gridMap.get(key)!.push(gameObject);
    }

    static getObject(sid: number) {
        return gameObjects.get(sid);
    }

    private static getKey(x: number, y: number) {
        return `${Math.floor(x / this.chunkSize)},${Math.floor(y / this.chunkSize)}`;
    }

    /**
     * Grabs objects near the chunks.
     * 
     * @param x - X-Axis position in the game world.
     * @param y - Y-Axis position in the game world.
     * @param objectFilter - Optional filter function.
     * @param chunkStart - Starting chunk offset. Value indicates the top left most position of a chunk.
     * @param chunkEnd  - Ending chunk offset. Value indicates the bottom right most position of a chunk.
     * @returns 
     */

    static getObjects(x: number, y: number, objectFilter: (gameObject: GameObject) => boolean = () => true, chunkStart: number = -1, chunkEnd: number = 1) {
        const closeObjects: GameObject[] = [];

        const chunkX = Math.floor(x / this.chunkSize);
        const chunkY = Math.floor(y / this.chunkSize);

        for (let dx = chunkStart; dx <= chunkEnd; dx++) {
            for (let dy = chunkStart; dy <= chunkEnd; dy++) {
                const searchKey = `${chunkX + dx},${chunkY + dy}`;
                const objects = this.gridMap.get(searchKey);

                if (objects && objects.length) {
                    closeObjects.push(...objects);
                }
            }
        }

        return closeObjects.filter(objectFilter);
    }

    private static removeObjectFromChunks(gameObject: GameObject | undefined) {
        if (!gameObject) return;

        const key = this.getKey(gameObject.x, gameObject.y);
        const objects = this.gridMap.get(key);

        if (objects) {
            const index = objects.indexOf(gameObject);
            if (index >= 0) objects.splice(index, 1);
        }
    }

    /**
     * 
     * @param x 
     * @param y 
     * @param scale 
     * @param id 
     * @param ignoreId - The id number to ignore.
     * @returns 
     */

    static checkItem(x: number, y: number, scale: number, id: number, ignoreId?: number) {
        for (const gameObject of gameObjects.values()) {
            const blockS = gameObject.blocker ? gameObject.blocker : gameObject.getScale(1, gameObject.isItem);

            if (typeof ignoreId === "number" && gameObject.sid === ignoreId) continue;

            if (getDist({ x, y }, gameObject) < scale + blockS) {
                return false;
            }
        }

        if (id != 18 && y >= (ScriptConfig.MAP_SIZE / 2) - (RendererUtils.riverWidth / 2) && y <= (ScriptConfig.MAP_SIZE / 2) + (RendererUtils.riverWidth / 2)) {
            return false;
        }

        return true;
    }

    static remove(sid: number) {
        const gameObject = gameObjects.get(sid);
        this.removeObjectFromChunks(gameObject);
        gameObjects.delete(sid);
    }

    static removeAll(ownerSID: number) {
        const toRemove = [];

        for (const obj of gameObjects.values()) {
            if (obj.ownerSID === ownerSID) {
                this.removeObjectFromChunks(obj);
                toRemove.push(obj.sid);
            }
        }

        for (const sid of toRemove) {
            gameObjects.delete(sid);
        }
    }
}