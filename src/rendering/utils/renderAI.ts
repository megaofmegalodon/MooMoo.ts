import Ai from "../../constants/Ai";
/*
var aiSprites = {};
function renderAI(obj, ctxt) {
    var tmpIndx = obj.index;
    var tmpSprite = aiSprites[tmpIndx];
    if (!tmpSprite) {
        var tmpImg = new Image();
        tmpImg.onload = function() {
            this.isLoaded = true;
            this.onload = null;
        };
        tmpImg.src = ".././img/animals/" + obj.src + ".png";
        tmpSprite = tmpImg;
        aiSprites[tmpIndx] = tmpSprite;
    }
    if (tmpSprite.isLoaded) {
        var tmpScale = obj.scale * 1.2 * (obj.spriteMlt||1);
        ctxt.drawImage(tmpSprite, -tmpScale, -tmpScale, tmpScale*2, tmpScale*2);
    }
}*/

const aiSprites: Record<number, HTMLImageElement> = {};

export default function renderAI(ai: Ai, ctx: CanvasRenderingContext2D) {
    const tmpIndex = ai.index;
    let tmpSprite = aiSprites[tmpIndex];

    if (!tmpSprite) {
        const tmpImage = new Image();
        tmpImage.onload = () => {
            tmpImage.isLoaded = true;
        };

        tmpImage.src = `https://sandbox.moomoo.io/img/animals/${ai.src}.png`;

        tmpSprite = tmpImage;
        aiSprites[tmpIndex] = tmpSprite;
    }

    if (tmpSprite.isLoaded) {
        const tmpScale = ai.scale * 1.2 * (ai.spriteMlt || 1);
        ctx.drawImage(
            tmpSprite,
            -tmpScale,
            -tmpScale,
            tmpScale * 2,
            tmpScale * 2
        );
    }
}