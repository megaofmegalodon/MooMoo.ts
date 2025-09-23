import Client from "../../core/Client";
import ScriptConfig from "../../utils/ScriptConfig";
import RendererSystem from "../RendererSystem";
import RenderingConfig from "../RenderingConfig";

interface IBiome {
    top: number;
    bottom: number;

    color: string;
}

class BiomeHandler {
    static data: IBiome[];

    static fetch(): IBiome[] {
        if (!this.data) {
            this.data = [{
                top: 0,
                bottom: ScriptConfig.SNOW_BIOME_TOP,
                color: "#ffffff"
            }, {
                top: ScriptConfig.SNOW_BIOME_TOP,
                bottom: ScriptConfig.MAP_SIZE - ScriptConfig.SNOW_BIOME_TOP,
                color: "#b6db66"
            }, {
                top: ScriptConfig.MAP_SIZE - ScriptConfig.SNOW_BIOME_TOP,
                bottom: ScriptConfig.MAP_SIZE,
                color: "#dbc666"
            }];
        }

        return this.data;
    }
}

export default function renderBackground(mainContext: CanvasRenderingContext2D) {
    const [xOffset, yOffset] = RendererSystem.getOffset();

    const player = Client.player;

    const maxScreenWidth = RenderingConfig.maxScreenWidth;
    const maxScreenHeight = RenderingConfig.maxScreenHeight;

    const viewTop = yOffset;
    const viewBottom = yOffset + maxScreenHeight;

    const height = ScriptConfig.MAP_SIZE;

    for (const biome of BiomeHandler.fetch()) {
        if (viewBottom > biome.top && viewTop < biome.bottom) {
            if (
                player &&
                (
                    biome.top > 0 ? player.y - maxScreenHeight / 2 >= biome.top : true
                ) &&
                (
                    biome.bottom < height ? player.y + maxScreenHeight / 2 <= biome.bottom : true
                )
            ) {
                mainContext.fillStyle = biome.color;
                mainContext.fillRect(0, 0, maxScreenWidth, maxScreenHeight);
            } else {
                const y = Math.max(0, biome.top - viewTop);
                const height = Math.min(biome.bottom, viewBottom) - Math.max(biome.top, viewTop);

                mainContext.fillStyle = biome.color;
                mainContext.fillRect(0, y, maxScreenWidth, height);
            }
        }
    }
}