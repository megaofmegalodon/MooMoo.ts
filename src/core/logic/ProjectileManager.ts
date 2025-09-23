import items from "../../constants/items";
import Player, { players } from "../../constants/Player";
import Projectile from "../../constants/Projectile";
import getDist from "../../utils/getDist";
import Client from "../Client";

export const projectiles: Map<number, Projectile> = new Map();

export default class ProjectileManager {
    static add(x: number, y: number, dir: number, range: number, speed: number, indx: number, layer: number, sid: number) {
        const bulletPosition = {
            x: x - Math.cos(dir) * 70,
            y: y - Math.sin(dir) * 70
        };

        const turretPosition = { x, y };
        let source: Player | null = null;
        let isTurret = false;

        for (const player of players.sidMap.values()) {
            if (player.visible) {
                const secondary = items.weapons[player.weaponData.secondary];
                const realPosition = player.getRealPosition();

                if (speed == 1.5 && (getDist(realPosition, turretPosition) <= 35 || getDist(realPosition, turretPosition) <= 35)) {
                    source = player;
                    isTurret = true;
                    break;
                } else if (secondary && typeof secondary.projectile == "number" && getDist(realPosition, bulletPosition) <= 35) {
                    source = player;
                    break;
                }
            }
        }

        if (source) {
            if (isTurret) {
                source.reloads[53] = 2500;
            } else {
                let weaponID = speed == 1.6 ? 9 : speed == 2.5 ? 12 : speed == 2 ? 13 : 15;
                let wpn = items.weapons[weaponID];

                source.reloads[weaponID] = wpn.speed;
                source.weaponData.secondary = weaponID;
            }
        }

        const projectile = new Projectile(x, y, dir, range, speed, sid, layer, indx);
        projectiles.set(sid, projectile);
    }

    static remove(sid: number, range: number) {
        const projectile = projectiles.get(sid);
        if (projectile) projectile.range = range;
    }
}