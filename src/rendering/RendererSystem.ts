import { ais } from "../constants/Ai";
import GameObject from "../constants/GameObject";
import items, { ListItem } from "../constants/items";
import Player, { players } from "../constants/Player";
import Client from "../core/Client";
import TextManager from "../core/logic/TextManager";
import PacketMap from "../core/utils/PacketMap";
import { Point } from "../types";
import { Input } from "../ui/Hook";
import getDir from "../utils/getDir";
import getDist from "../utils/getDist";
import getElem from "../utils/getElem";
import lerp from "../utils/lerp";
import lerpAngle from "../utils/lerpAngle";
import randFloat from "../utils/randFloat";
import ScriptConfig from "../utils/ScriptConfig";
import RendererUtils, { itemRenderers, resRenderers } from "./RendererUtils";
import RenderingConfig from "./RenderingConfig";
import renderAI from "./utils/renderAI";
import renderBackground from "./utils/renderBackground";
import renderGameObjects from "./utils/renderGameObjects";
import renderMapBorders from "./utils/renderMapBorders";
import renderPlayers from "./utils/renderPlayers";
import renderProjectiles from "./utils/renderProjectiles";
import renderWaterBodies from "./utils/renderWaterBodies";

CanvasRenderingContext2D.prototype.roundRect = function (x: number, y: number, width: number, height: number, radius: number): CanvasRenderingContext2D {
    radius = Math.max(0, Math.min(radius, width / 2, height / 2));

    this.beginPath();
    this.moveTo(x + radius, y);
    this.arcTo(x + width, y, x + width, y + height, radius);
    this.arcTo(x + width, y + height, x, y + height, radius);
    this.arcTo(x, y + height, x, y, radius);
    this.arcTo(x, y, x + width, y, radius);
    this.closePath();

    return this;
};

const gameCanvas = getElem<"canvas">("gameCanvas");
export const mainContext = gameCanvas.getContext("2d")!;

const mapDisplay = getElem<"canvas">("mapDisplay");
const mapContext = mapDisplay.getContext("2d")!;

mapDisplay.width = 300;
mapDisplay.height = 300;

export const diedText = getElem<"div">("diedText");

export default class RendererSystem {
    private static pixelDensity = window.devicePixelRatio || 1;

    static camX = 0;
    static camY = 0;

    private static waterMult = 1;
    private static waterPlus = 0;

    static deathTextScale = 99999;

    private static lastUpdate = Date.now();

    static getOffset() {
        const xOffset = this.camX - RenderingConfig.maxScreenWidth / 2;
        const yOffset = this.camY - RenderingConfig.maxScreenHeight / 2;

        return [xOffset, yOffset];
    }

    private static gameResSprites: Record<string, HTMLCanvasElement> = {};

    static getResSprite(obj: GameObject) {
        const biomeID = (obj.y >= ScriptConfig.MAP_SIZE - ScriptConfig.SNOW_BIOME_TOP) ? 2 : ((obj.y <= ScriptConfig.SNOW_BIOME_TOP) ? 1 : 0);
        const objId = (obj.type + "_" + obj.scale + "_" + biomeID);

        if (this.gameResSprites[objId]) return this.gameResSprites[objId];

        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = (obj.scale * 2.1) + RendererUtils.outlineWidth;

        const tmpContext = canvas.getContext("2d")!;

        tmpContext.translate((canvas.width / 2), (canvas.height / 2));
        tmpContext.rotate(randFloat(0, Math.PI));

        tmpContext.strokeStyle = RendererUtils.outlineColor;
        tmpContext.lineWidth = RendererUtils.outlineWidth;

        const renderer = resRenderers[obj.type];
        if (renderer) renderer(obj, tmpContext, biomeID);

        this.gameResSprites[objId] = canvas;
        return canvas;
    }

    private static itemSprites: Record<string, HTMLCanvasElement> = {};

    static getItemSprite(obj: GameObject | ListItem, asIcon?: boolean) {
        let objId = `${obj.id}`;

        if (obj.isGameObject && (obj.dmg || obj.trap)) {
            if (!Client.isFriendly(obj.ownerSID ?? -1)) {
                objId += ` red-overlay`;
            }
        }

        const objData = items.list[obj.id];

        if (!asIcon && this.itemSprites[objId]) return this.itemSprites[objId];

        const scale = obj.scale;
        const padding = (objData.spritePadding || 0);
        const size = (scale * 2.5) + RendererUtils.outlineWidth + padding;

        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;

        const tmpContext = canvas.getContext("2d")!;
        tmpContext.translate(size / 2, size / 2);
        if (!asIcon) tmpContext.rotate(Math.PI / 2);

        tmpContext.strokeStyle = RendererUtils.outlineColor;
        tmpContext.lineWidth = RendererUtils.outlineWidth * (asIcon ? (size / 81) : 1);

        const renderer = itemRenderers[obj.name];
        if (renderer) renderer(obj, tmpContext, objId);

        if (!asIcon) this.itemSprites[objId] = canvas;
        return canvas;
    }

    private static icons: string[] = ["crosshair"];
    private static iconSprites: Record<string, HTMLImageElement> = {};

    private static renderIcons() {
        for (const icon of this.icons) {
            const img = document.createElement("img");
            img.src = icon === "crosshair" ? "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Crosshairs_Red.svg/800px-Crosshairs_Red.svg.png" : ""

            img.onload = () => {
                img.isLoaded = true;
            };

            this.iconSprites[icon] = img;
        }
    }

    private static lastSent = Date.now();

    static renderGame() {
        const now = Date.now();
        const delta = now - this.lastUpdate;
        this.lastUpdate = now;

        const [xOffset, yOffset] = this.getOffset();

        const player = Client.player;

        if (player) {
            if (!this.lastSent || now - this.lastSent >= 200) {
                this.lastSent = now;
                Client.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.SEND_AIM, Input.getAttackDir() as number);
            }
        }

        if (RendererSystem.deathTextScale < 120) {
            RendererSystem.deathTextScale += 0.1 * delta;
            diedText.style.fontSize = Math.min(Math.round(RendererSystem.deathTextScale), 120) + "px";
        }

        if (player) {
            const cameraPos: Point = { x: this.camX, y: this.camY };

            const tmpDist = getDist(cameraPos, player);
            const tmpDir = getDir(player, cameraPos);
            const camSpd = Math.min(tmpDist * 0.01 * delta, tmpDist);

            if (tmpDist > 0.05) {
                this.camX += camSpd * Math.cos(tmpDir);
                this.camY += camSpd * Math.sin(tmpDir);
            } else {
                this.camX = player.x;
                this.camY = player.y;
            }
        } else {
            this.camX = ScriptConfig.MAP_SIZE / 2;
            this.camY = ScriptConfig.MAP_SIZE / 2;
        }

        for (const entity of [...players.sidMap.values(), ...ais.values()]) {
            if (entity.forcePos) {
                entity.x = entity.x2;
                entity.y = entity.y2;
                entity.dir = entity.d2;
            } else {
                entity.deltaTime += delta;
                const t = Math.min(1.7, entity.deltaTime / 170);

                entity.x = lerp(entity.x1, entity.x2, t);
                entity.y = lerp(entity.y1, entity.y2, t);
                entity.dir = lerpAngle(entity.d1, entity.d2, t);
            }
        }

        renderBackground(mainContext);

        this.waterMult += this.waterPlus * RendererUtils.waveSpeed * delta;
        if (this.waterMult >= RendererUtils.waveMax) {
            this.waterMult = RendererUtils.waveMax;
            this.waterPlus = -1;
        } else if (this.waterMult <= 1) {
            this.waterMult = this.waterPlus = 1;
        }
        mainContext.globalAlpha = 1;
        mainContext.fillStyle = "#dbc666";
        renderWaterBodies(xOffset, yOffset, mainContext, RendererUtils.riverPadding);

        mainContext.fillStyle = "#91b2db";
        renderWaterBodies(xOffset, yOffset, mainContext, (this.waterMult - 1) * 250);

        mainContext.globalAlpha = 1;
        mainContext.strokeStyle = RendererUtils.outlineColor;
        renderGameObjects(delta, -1);

        mainContext.globalAlpha = 1;
        mainContext.lineWidth = RendererUtils.outlineWidth;
        renderProjectiles(delta, 0);

        renderPlayers(delta, 0);

        mainContext.globalAlpha = 1;
        for (const ai of ais.values()) {

            if (ai.active && ai.visible) {
                ai.animate(delta);

                mainContext.save();
                mainContext.translate(ai.x - xOffset, ai.y - yOffset);
                mainContext.rotate(ai.dir + ai.dirPlus - (Math.PI / 2));

                renderAI(ai, mainContext);

                mainContext.restore();
            }
        }

        renderGameObjects(delta, 0);

        renderProjectiles(delta, 1);
        renderGameObjects(delta, 1);
        renderPlayers(delta, 1);

        renderGameObjects(delta, 2);
        renderGameObjects(delta, 3);

        renderMapBorders(mainContext);

        mainContext.globalAlpha = 1;
        mainContext.fillStyle = "rgba(0, 0, 70, .35)";
        mainContext.fillRect(0, 0, RenderingConfig.maxScreenWidth, RenderingConfig.maxScreenHeight);

        this.renderNames();
        this.renderPlayerChats(delta);

        mainContext.globalAlpha = 1;
        for (const text of TextManager.texts.values()) {
            text.update(delta);

            if (text.life <= 0) {
                TextManager.texts.delete(text.id);
                continue;
            }

            mainContext.save();
            mainContext.globalAlpha = text.alpha;
            mainContext.translate(text.x - xOffset, text.y - yOffset);
            text.render(mainContext);
            mainContext.restore();
        }

        this.renderMinimap();

        requestAnimationFrame(() => this.renderGame());
    }

    private static renderPlayerChats(delta: number) {
        const [xOffset, yOffset] = this.getOffset();
        const baseY = -115;

        for (const player of players.sidMap.values()) {
            if (player.visible) {
                mainContext.save();

                mainContext.translate(player.x - xOffset, player.y - yOffset);

                for (let i = 0; i < player.chatMessages.length; i++) {
                    const chatMessage = player.chatMessages[i];

                    if (chatMessage) {
                        chatMessage.update(delta, i);
                        chatMessage.render(baseY, mainContext);

                        if (chatMessage.life <= 0) {
                            player.chatMessages.splice(i, 1);
                            i--;
                        }
                    }
                }

                mainContext.restore();
            }
        }
    }

    private static renderNames() {
        const [xOffset, yOffset] = this.getOffset();

        mainContext.strokeStyle = RendererUtils.darkOutlineColor;

        for (const entity of [...players.sidMap.values(), ...ais.values()]) {
            if (entity.visible) {
                const teamName = (entity as Player).team;
                const tmpName = `${teamName ? `[${teamName}] ` : ""}${entity.name || ""}`;

                if (tmpName) {
                    mainContext.font = `${(entity.nameScale || 30)}px Hammersmith One`;
                    mainContext.fillStyle = "#ffffff";
                    mainContext.textBaseline = "middle";
                    mainContext.textAlign = "center";
                    mainContext.lineWidth = (entity.nameScale ? 11 : 8);
                    mainContext.lineJoin = "round";
                    mainContext.strokeText(tmpName, entity.x - xOffset, (entity.y - yOffset - entity.scale) - RendererUtils.nameY);
                    mainContext.fillText(tmpName, entity.x - xOffset, (entity.y - yOffset - entity.scale) - RendererUtils.nameY);
                }

                if (entity.health > 0) {
                    const tmpWidth = RendererUtils.healthBarWidth;

                    mainContext.fillStyle = RendererUtils.darkOutlineColor;
                    mainContext.roundRect(
                        entity.x - xOffset - tmpWidth - RendererUtils.healthBarPad,
                        (entity.y - yOffset + entity.scale) + RendererUtils.nameY,
                        tmpWidth * 2 + RendererUtils.healthBarPad * 2,
                        17,
                        8
                    );
                    mainContext.fill();

                    mainContext.fillStyle = (entity == Client.player || (teamName && teamName == Client.player.team)) ? "#8ecc51" : "#cc5151";
                    mainContext.roundRect(
                        entity.x - xOffset - tmpWidth,
                        (entity.y - yOffset + entity.scale) + RendererUtils.nameY + RendererUtils.healthBarPad,
                        (tmpWidth * 2) * (entity.health / entity.maxHealth),
                        17 - RendererUtils.healthBarPad * 2,
                        7
                    );
                    mainContext.fill();
                }
            }
        }
    }

    private static renderMinimap() {
        if (Client.player) {
            const player = Client.player;

            mapContext.clearRect(0, 0, mapDisplay.width, mapDisplay.height);

            mapContext.globalAlpha = 1;
            mapContext.fillStyle = "#fff";
            RendererUtils.drawCircle(
                (player.x / ScriptConfig.MAP_SIZE) * mapDisplay.width,
                (player.y / ScriptConfig.MAP_SIZE) * mapDisplay.height,
                mapContext,
                7,
                true
            );

            if (Client.lastDeath) {
                const lastDeath = Client.lastDeath;

                mapContext.fillStyle = "#fc5553";
                mapContext.font = "34px Hammersmith One";
                mapContext.textBaseline = "middle";
                mapContext.textAlign = "center";
                mapContext.fillText(
                    "x",
                    (lastDeath.x / ScriptConfig.MAP_SIZE) * mapDisplay.width,
                    (lastDeath.y / ScriptConfig.MAP_SIZE) * mapDisplay.height
                );
            }
        }
    }

    static resize() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        gameCanvas.width = screenWidth * this.pixelDensity;
        gameCanvas.height = screenHeight * this.pixelDensity;
        gameCanvas.style.width = `${screenWidth}px`;
        gameCanvas.style.height = `${screenHeight}px`;

        const scaleFillNative = Math.max(
            screenWidth / RenderingConfig.maxScreenWidth,
            screenHeight / RenderingConfig.maxScreenHeight
        ) * this.pixelDensity;

        const transformX = (gameCanvas.width - (RenderingConfig.maxScreenWidth * scaleFillNative)) / 2;
        const transformY = (gameCanvas.height - (RenderingConfig.maxScreenHeight * scaleFillNative)) / 2;

        mainContext.setTransform(
            scaleFillNative, 0,
            0, scaleFillNative,
            transformX, transformY
        );
    }

    static async init() {
        this.renderIcons();

        window.addEventListener("resize", () => this.resize());
        this.resize();

        this.renderGame();
    }
}