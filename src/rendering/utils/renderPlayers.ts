import { players } from "../../constants/Player";
import Client from "../../core/Client";
import { Input, isOnWindow } from "../../ui/Hook";
import RendererSystem, { mainContext } from "../RendererSystem";

export default function renderPlayers(delta: number, layer: number) {
    const [xOffset, yOffset] = RendererSystem.getOffset();

    mainContext.globalAlpha = 1;

    for (const player of players.entities) {
        if (player && player.zIndex == layer) {
            player.animate(delta);
            if (isOnWindow()) player.update(delta);

            if (player.visible) {
                player.skinRot += .002 * delta;

                mainContext.save();
                mainContext.translate(player.x - xOffset, player.y - yOffset);

                mainContext.rotate((player.sid === Client.mySID ? Input.getAttackDir() : player.dir) + player.dirPlus);
                player.render(mainContext);
                mainContext.restore();
            }
        }
    }
}