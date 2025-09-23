import items, { IProjectile } from "../../constants/items";
import Projectile from "../../constants/Projectile";
import { projectiles } from "../../core/logic/ProjectileManager";
import RendererSystem, { mainContext } from "../RendererSystem";
import RendererUtils, { isOnScreen } from "../RendererUtils";

const projectileSprites: Record<string, HTMLImageElement> = {};

export function renderProjectile(x: number, y: number, obj: Projectile | IProjectile, ctx: CanvasRenderingContext2D) {
    if (obj.src) {
        const tmpSrc = items.projectiles[obj.indx].src!;
        let tmpSprite = projectileSprites[tmpSrc];

        if (!tmpSprite) {
            tmpSprite = new Image();
            tmpSprite.onload = () => {
                tmpSprite.isLoaded = true;
            }

            tmpSprite.src = `https://sandbox.moomoo.io/img/weapons/${tmpSrc}.png`;
            projectileSprites[tmpSrc] = tmpSprite;
        }

        if (tmpSprite.isLoaded) {
            ctx.drawImage(
                tmpSprite,
                x - (obj.scale / 2),
                y - (obj.scale / 2),
                obj.scale,
                obj.scale
            );
        }
    } else if (obj.indx == 1) {
        ctx.fillStyle = "#939393";
        RendererUtils.drawCircle(x, y, ctx, obj.scale);
    }
}

export default function renderProjectiles(delta: number, layer: number) {
    const [xOffset, yOffset] = RendererSystem.getOffset();

    for (const proj of projectiles.values()) {
        if (proj.active && proj.layer == layer) {
            proj.update(delta);

            const tmpX = proj.x - xOffset;
            const tmpY = proj.y - yOffset;

            if (!proj.active) {
                projectiles.delete(proj.sid);
                continue;
            }

            if (proj.active && isOnScreen(tmpX, tmpY, proj.scale)) {
                mainContext.save();
                mainContext.translate(tmpX, tmpY);
                mainContext.rotate(proj.dir);

                renderProjectile(0, 0, proj, mainContext);

                mainContext.restore();
            }
        }
    }
}