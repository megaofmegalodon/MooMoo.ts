import { gameObjects } from "../../core/logic/ObjectManager";
import RendererSystem, { mainContext } from "../RendererSystem";
import RendererUtils, { isOnScreen } from "../RendererUtils";

const config = {
    volcanoScale: 320,
    innerVolcanoScale: 100,
    volcanoAnimationDuration: 3200
};

interface VolcanoCanvas {
    animationTime: number;
    body: HTMLCanvasElement | null;
    inner: HTMLCanvasElement | null;
}

const volcanoCanvas: VolcanoCanvas = {
    animationTime: 0,
    body: null,
    inner: null
};

function drawVolcanoImages() {
    const bodyScale = config.volcanoScale * 2;

    const volcanoLand = document.createElement("canvas");
    volcanoLand.width = volcanoLand.height = bodyScale;

    const ctxLand = volcanoLand.getContext("2d")!;
    ctxLand.strokeStyle = "#3e3e3e";
    ctxLand.lineWidth = RendererUtils.outlineWidth * 2;
    ctxLand.fillStyle = "#7f7f7f";

    RendererUtils.drawPolygon(ctxLand, 10, 0, 0, bodyScale);

    volcanoCanvas.body = volcanoLand;

    const innerScale = config.innerVolcanoScale * 2;
    const volcanoLava = document.createElement("canvas");
    volcanoLava.width = volcanoLava.height = innerScale;

    const ctxLava = volcanoLava.getContext("2d")!;
    ctxLava.strokeStyle = RendererUtils.outlineColor;
    ctxLava.lineWidth = RendererUtils.outlineWidth * 1.6;
    ctxLava.fillStyle = "#f54e16";
    ctxLava.strokeStyle = "#f56f16";

    RendererUtils.drawPolygon(ctxLand, 10, 0, 0, innerScale);

    volcanoCanvas.inner = volcanoLava;
}

drawVolcanoImages();

export default function renderGameObjects(delta: number, layer: number) {
    const [xOffset, yOffset] = RendererSystem.getOffset();

    for (const gameObject of gameObjects.entities) {
        if (gameObject && gameObject.active) {
            const tmpX = gameObject.x + gameObject.xWiggle - xOffset;
            const tmpY = gameObject.y + gameObject.yWiggle - yOffset;

            if (layer == 0) gameObject.update(delta);

            if (gameObject.layer == layer && isOnScreen(tmpX, tmpY, gameObject.scale + gameObject.blocker)) {
                mainContext.globalAlpha = gameObject.hideFromEnemy ? .6 : 1;

                if (gameObject.isItem) {
                    const tmpSprite = RendererSystem.getItemSprite(gameObject);

                    mainContext.save();
                    mainContext.translate(tmpX, tmpY);
                    mainContext.rotate(gameObject.dir);

                    mainContext.drawImage(tmpSprite, -(tmpSprite.width / 2), -(tmpSprite.height / 2));

                    if (gameObject.blocker) {
                        mainContext.strokeStyle = "#db6e6e";
                        mainContext.globalAlpha = 0.3;
                        mainContext.lineWidth = 6;

                        RendererUtils.drawCircle(0, 0, mainContext, gameObject.blocker, false, true);
                    }

                    mainContext.restore();
                } else {
                    if (gameObject.type == 4) {
                        mainContext.globalAlpha = 1;

                        volcanoCanvas.animationTime += delta;
                        volcanoCanvas.animationTime %= config.volcanoAnimationDuration;

                        const halfAnimationDuration = config.volcanoAnimationDuration / 2;
                        const scaleFactor = 1.7 + 0.3 * (Math.abs(halfAnimationDuration - volcanoCanvas.animationTime) / halfAnimationDuration);
                        const innerVolcanoScale = config.innerVolcanoScale * scaleFactor;

                        mainContext.drawImage(
                            volcanoCanvas.body!,
                            tmpX - config.volcanoScale,
                            tmpY - config.volcanoScale,
                            config.volcanoScale * 2,
                            config.volcanoScale * 2
                        );

                        mainContext.drawImage(
                            volcanoCanvas.inner!,
                            tmpX - innerVolcanoScale,
                            tmpY - innerVolcanoScale,
                            innerVolcanoScale * 2,
                            innerVolcanoScale * 2
                        );
                    } else {
                        const tmpSprite = RendererSystem.getResSprite(gameObject);
                        mainContext.drawImage(tmpSprite, tmpX - (tmpSprite.width / 2), tmpY - (tmpSprite.height / 2));
                    }
                }
            }
        }
    }
}