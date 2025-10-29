import RendererSystem from "../rendering/RendererSystem";
import RendererUtils from "../rendering/RendererUtils";
import { renderProjectile } from "../rendering/utils/renderProjectiles";
import lerp from "../utils/lerp";
import ScriptConfig from "../utils/ScriptConfig";
import EntityManager from "./EntityManager";
import GameObject from "./GameObject";
import items, { Weapon } from "./items";
import store from "./store";

export const players = new EntityManager<Player>();

export type PlayerInitType = [id: string, sid: number, name: string, x: number, y: number, dir: number, health: number, maxHealth: number, scale: number, skinColor: number];

function renderPlayerWeapon(ctx: CanvasRenderingContext2D, weapon: Weapon, weaponVariant: number) {
    RendererUtils.renderTool(weapon, ScriptConfig.WEAPON_VARIANTS[weaponVariant], 35, 0, ctx);

    if (weapon.projectile && !weapon.hideProjectile) {
        renderProjectile(35, 0, items.projectiles[weapon.projectile], ctx);
    }
}

export class ChatMessage {
    life: number = 3e3;

    yOff: number = 0;
    index: number = 0;

    maxOff: number = 0;

    constructor(
        public msg: string
    ) {
    }

    render(baseY: number, mainContext: CanvasRenderingContext2D) {
        mainContext.font = "28px Hammersmith One";

        const textWidth = mainContext.measureText(this.msg).width + 17;

        mainContext.fillStyle = "rgba(0, 0, 0, .25)";
        mainContext.roundRect(-textWidth / 2, baseY - 23.5 + this.yOff, textWidth, 42, 4);
        mainContext.fill();

        mainContext.fillStyle = "#ffffff";
        mainContext.lineJoin = "round";
        mainContext.textAlign = "center";
        mainContext.textBaseline = "middle";

        mainContext.fillText(this.msg, 0, baseY + this.yOff);
    }

    update(delta: number, index: number) {
        this.life -= delta;

        if (this.index != index) {
            this.maxOff = -47 * index;
        }

        this.index = index;

        const maxOff = Math.abs(this.maxOff);
        const yOff = Math.abs(this.yOff);

        this.yOff -= .3 * delta;

        if (yOff >= maxOff) {
            this.yOff = this.maxOff;
        }
    }
}

interface PlayerWeaponData {
    /**
     * Shows the reload number from 0 to 1.
     * 1 means fully reloaded.
     */

    reload: number;

    /**
     * The damage of the weapon that's already calculated with variant bonus damage.
     */

    dmg: number;
    variant: number;

    /**
     * The knockback power of the weapon, with the base knock already added.
     */

    knock: number;
}

export default class Player {
    trap: GameObject | undefined;
    name: string = "unknown";

    /**
     * This attribute represents smooth animation x position of the player.
     * Do not use this since it might not be accurate.
     */

    x: number = 0;

    /**
     * This attribute represents smooth animation y position of the player.
     * Do not use this since it might not be accurate.
     */

    y: number = 0;

    /**
     * This attribute represents the last animation x position of the player.
     * Do not use this for any calculation in the script.
     */

    x1: number = 0;

    /**
    * This attribute represents the last animation y position of the player.
    * Do not use this for any calculation in the script.
    */

    y1: number = 0;

    /**
     * This attribute represents the current x position of the player.
     */

    x2: number = 0;

    /**
     * This attribute represents the current y position of the player.
     */

    y2: number = 0;

    /**
     * This attribute represents the smooth animation direction.
     * Which may not be accurate.
     */

    dir: number = 0;

    dirPlus: number = 0;
    animSpeed: number = 0;
    animTime: number = 0;
    targetAngle: number = 0;

    tmpRatio: number = 0;
    animIndex: number = 0;

    d1: number = 0;

    /**
     * This attribute represents the current direction.
     */

    d2: number = 0;

    health: number = 100;
    maxHealth: number = 100;

    scale: number = 35;
    skinColor: number = 0;

    nameScale: number = 0;
    isPlayer: true = true;

    chatMessages: ChatMessage[] = [];

    skinIndex: number = -1;
    tailIndex: number = -1;

    buildIndex: number = -1;
    weaponIndex: number = 0;

    age: number = 1;
    XP: number = 0;
    maxXP: number = 300;

    weaponVariant: number = 0;
    team: string = "";

    isLeader: number = 0;
    iconIndex: number = -1;

    food: number = 100;
    wood: number = 100;
    stone: number = 100;
    points: number = 100;
    kills: number = 0;

    forcePos: boolean = false;
    visible: boolean = false;

    deltaTime: number = 0;
    zIndex: number = 0;

    skinRot: number = 0;

    weapons: number[] = [0];
    items: number[] = [0, 3, 6, 10];

    skins: Record<number, boolean> = {};
    tails: Record<number, boolean> = {};

    constructor(
        public id: string,
        public sid: number
    ) {
        for (const hat of store.hats) {
            if (!hat.price) this.skins[hat.id] = true;
        }

        for (const acc of store.accessories) {
            if (!acc.price) this.tails[acc.id] = true;
        }
    }

    setData(data: PlayerInitType) {
        this.id = data[0];
        this.sid = data[1];
        this.name = data[2];

        this.x2 = this.x = data[3];
        this.y2 = this.y = data[4];

        this.dir = data[5];
        this.health = data[6];
        this.maxHealth = data[7];
        this.scale = data[8];
        this.skinColor = data[9];
    }

    upgradePoints: number = 0;
    upgrAge: number = 2;

    isOwner: boolean = false;

    hitTime: number = 0;
    shameCount: number = 0;
    shameTimer: number = 0;

    bullTick: number = 0;

    weaponData = {
        primary: 0,
        primaryVariant: 0,
        secondary: 15,
        secondaryVariant: 0
    };

    weaponXP: number[] = [];
    reloads: Record<number, number> = Object.fromEntries([...(Array(16).keys()), 52].map(k => [k, 0]));

    itemCounts: Record<number, number> = {};

    updateWeaponData(id: number, variant?: number, didHit?: boolean) {
        if (id < 9) {
            this.weaponData.primary = id;
            if (typeof variant === "number") this.weaponData.primaryVariant = variant;
        } else {
            this.weaponData.secondary = id;
            if (typeof variant === "number") this.weaponData.secondaryVariant = variant;
        }
    }

    /**
     * Fetches data for a specific weapon group
     * 
     * @param indx 
     * @returns 
     */

    fetchWeaponData(indx: 0 | 1): PlayerWeaponData {
        const wpnId = indx === 0 ? this.weaponData.primary : this.weaponData.secondary;
        const wpn = items.weapons[wpnId];

        const wpnVariant = indx === 0 ? this.weaponData.primaryVariant : this.weaponData.secondaryVariant;
        const reload = this.getReload(indx);
        const dmg = wpn.dmg * ScriptConfig.WEAPON_VARIANTS[wpnVariant].val;

        return { reload, dmg, variant: wpnVariant, knock: (wpn.knock || 0) + .3 };
    }

    /**
     * Fetches the reload data of the player's primary or secondary.
     * 
     * @param indx - Pick 0 for primary, 1 for secondary, and 2 for turret gear.
     * @returns 
     */

    getReload(indx: 0 | 1 | 2) {
        if (indx == 2) return 1 - (this.reloads[53] / 2500);
        const wpnId = indx === 0 ? this.weaponData.primary : this.weaponData.secondary;
        const wpnSpeed = items.weapons[wpnId]?.speed;

        if (typeof wpnSpeed !== "number") return 1;

        return 1 - (this.reloads[wpnId] / wpnSpeed);
    }

    resetReloads() {
        this.reloads = Object.fromEntries([...(Array(16).keys()), 53].map(k => [k, 0]));
    }

    update(delta: number) {
        if (this.buildIndex === -1) {
            this.reloads[this.weaponIndex] = Math.max(0, this.reloads[this.weaponIndex] - delta);
        }

        this.reloads[53] = Math.max(0, this.reloads[53] - delta);
    }

    getRealPosition() {
        return {
            x: this.x2,
            y: this.y2
        };
    }

    spawn() {
        this.trap = undefined;
        this.weaponData = {
            primary: 0,
            primaryVariant: 0,
            secondary: 15,
            secondaryVariant: 0
        };

        this.age = 1;
        this.XP = 0;
        this.maxXP = 300;

        this.upgradePoints = 0;
        this.upgrAge = 2;

        this.shameCount = 0;
        this.shameTimer = 0;

        this.weapons = [0];
        this.items = [0, 3, 6, 10];

        this.weaponIndex = 0;
        this.buildIndex = -1;

        this.food = 100;
        this.wood = 100;
        this.stone = 100;
        this.points = 100;
        this.kills = 0;

        this.chatMessages.length = 0;

        this.shameCount = 0;
        this.shameTimer = 0;

        this.weaponXP = [];
        this.resetReloads();
    }

    animate(delta: number) {
        this.animTime -= delta;

        if (this.animTime <= 0) {
            this.animTime = 0;
            this.dirPlus = 0;
            this.tmpRatio = 0;
            this.animIndex = 0;
            return;
        }

        const directionProgress = delta / (this.animSpeed * (this.animIndex === 0 ? 0.25 : 0.75));
        this.tmpRatio += this.animIndex === 0 ? directionProgress : -directionProgress;

        this.tmpRatio = Math.max(0, Math.min(1, this.tmpRatio));
        this.dirPlus = lerp(0, this.targetAngle, this.tmpRatio);

        if (this.animIndex === 0 && this.tmpRatio >= 1) {
            this.animIndex = 1;
        }
    }

    render(mainContext: CanvasRenderingContext2D) {
        const weapon = items.weapons[this.weaponIndex];

        const handAngle = Math.PI / 4 * (weapon.armS ?? 1);
        const oHandAngle = (this.buildIndex === -1) ? (weapon.hndS ?? 1) : 1;
        const oHandDist = (this.buildIndex === -1) ? (weapon.hndD ?? 1) : 1;

        if (this.tailIndex > 0) {
            RendererUtils.renderTail(this.tailIndex, mainContext, this);
        }

        // RENDER WEAPON BELOW HANDS:
        if (this.buildIndex < 0 && !weapon.aboveHand) {
            renderPlayerWeapon(mainContext, weapon, this.weaponVariant);
        }

        mainContext.fillStyle = RendererUtils.skinColors[this.skinColor];

        RendererUtils.drawCircle(
            this.scale * Math.cos(handAngle),
            this.scale * Math.sin(handAngle),
            mainContext,
            14
        );

        RendererUtils.drawCircle(
            (this.scale * oHandDist) * Math.cos(-handAngle * oHandAngle),
            (this.scale * oHandDist) * Math.sin(-handAngle * oHandAngle),
            mainContext,
            14
        );

        // RENDER WEAPON ABOVE HAND:
        if (this.buildIndex < 0 && weapon.aboveHand) {
            renderPlayerWeapon(mainContext, weapon, this.weaponVariant);
        }

        if (this.buildIndex >= 0) {
            const item = items.list[this.buildIndex];
            const tmpSprite = RendererSystem.getItemSprite(item);

            mainContext.drawImage(tmpSprite, this.scale - item.holdOffset, -tmpSprite.width / 2);
        }

        RendererUtils.drawCircle(0, 0, mainContext, this.scale);

        if (this.skinIndex > 0) {
            mainContext.rotate(Math.PI / 2);
            RendererUtils.renderSkin(this.skinIndex, mainContext, this);
        }
    }

    /**
     * Adds a player into the client's memory.
     * Returns true if added, returns false if not.
     * 
     * @param player 
     */

    static addPlayer(player: Player) {
        let done = false;

        if (!players.has(player.sid)) {
            players.add(player.sid, player.id, player);
            done = true;
        }

        return done;
    }

    /**
     * Removes a player from the client's memory.
     * 
     * @param player 
     */

    static removePlayer(player: Player) {
        players.remove(player.sid, player.id);
    }
}