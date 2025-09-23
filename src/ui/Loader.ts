import items from "../constants/items";
import Client from "../core/Client";
import PacketMap from "../core/utils/PacketMap";
import RendererSystem from "../rendering/RendererSystem";
import RenderingConfig from "../rendering/RenderingConfig";
import getElem from "../utils/getElem";
import Hook from "./Hook";
import showItemInfo from "./utils/showItemInfo";

declare global {
    interface HTMLImageElement {
        isLoaded: boolean;
    }
}

type MooMooServer = {
    key: string;
    name: string;
    playerCapacity: 40;
    playerCount: number;
    region: string;
    sandbox: string;
    version: string;
}

const serverBrowser = getElem<"div">("serverBrowser");
const actionBar = getElem<"div">("actionBar");

const skinColorHolder = getElem<"div">("skinColorHolder");

function updateSkinColorPicker() {
    skinColorHolder.innerHTML = "";

    for (let i = 0; i < RenderingConfig.skinColors.length; i++) {
        const buttonItem = document.createElement("div");
        buttonItem.classList.add("skinColorItem");
        if (i == Loader.skinColor) buttonItem.classList.add("activeSkin");
        buttonItem.style.backgroundColor = RenderingConfig.skinColors[i];

        buttonItem.onclick = () => {
            Loader.skinColor = i;
            updateSkinColorPicker();
        };

        skinColorHolder.appendChild(buttonItem);
    }
}

export default class Loader {
    static PRIVATE_SERVER: boolean = true;

    private static toolSprites: Record<string, HTMLImageElement> = {};
    static currentServer: MooMooServer;

    static skinColor = 0;

    /**
     * Removes UI elements that are not used.
     */

    private static removeUI() {
        getElem("chatButton").remove();
        getElem("partyButton").remove();
        getElem("joinPartyButton").remove();
        getElem("leaderboardButton").remove();
    }

    private static async findServers() {
        if (this.PRIVATE_SERVER) return;

        const response = await fetch(`https://${location.href.includes("sandbox") ? "api-sandbox" : "api"}.moomoo.io/servers?v=1.26`);
        const data = (await response.json()) as MooMooServer[];

        const serverBrowserInput = document.createElement("select");

        serverBrowserInput.onchange = () => {
            location.href = `https://${location.hostname}/?server=${serverBrowserInput.value}`;
        };

        let currentServer = "frankfurt";

        for (const server of data) {
            if (currentServer != server.region) {
                currentServer = server.region;
                serverBrowserInput.innerHTML += `<option disabled></option>`
            }

            const upperCasedRegion = server.region.slice(0, 1).toUpperCase() + server.region.slice(1);
            serverBrowserInput.innerHTML += `<option value="${server.region}:${server.name}" ${location.href.split("?server=")[1] == `${server.region}:${server.name}` ? "selected" : ""}>${upperCasedRegion} ${server.name} [${server.playerCount}/40]</option>`;
        }

        serverBrowser.appendChild(serverBrowserInput);

        if (!location.href.includes("?server=")) {
            const server = data[0];

            location.href = `https://${location.hostname}/?server=${server.region}:${server.name}`;
            return false;
        }

        const serverData = location.href.split("?server=")[1].split(":");

        this.currentServer = data.find(e => e.region == serverData[0] && e.name == serverData[1])!;

        if (!this.currentServer) {
            const server = data[0];

            location.href = `https://${location.hostname}/?server=${server.region}:${server.name}`;
            return false;
        }

        return true;
    }

    private static prepareUI() {
        actionBar.innerHTML = "";

        for (let i = 0; i < items.weapons.length + items.list.length; i++) {
            const actionBarItem = document.createElement("div");
            actionBarItem.id = `actionBarItem${i}`;
            actionBarItem.classList.add("actionBarItem");
            actionBarItem.style.display = "none";

            actionBar.appendChild(actionBarItem);
        }

        for (let i = 0; i < items.weapons.length + items.list.length; i++) {
            const tmp = items.weapons[i] || items.list[i - items.weapons.length];

            const tmpCanvas = document.createElement("canvas");
            tmpCanvas.width = tmpCanvas.height = 66;

            const tmpContext = tmpCanvas.getContext("2d")!;
            tmpContext.translate((tmpCanvas.width / 2), (tmpCanvas.height / 2));

            tmpContext.imageSmoothingEnabled = false;

            const actionElem = getElem<"div">(`actionBarItem${i}`);
            actionElem.style.position = "relative";

            if (items.weapons[i]) {
                tmpContext.rotate((Math.PI / 4) + Math.PI);

                const tmpSprite = new Image();
                this.toolSprites[tmp.src] = tmpSprite;

                tmpSprite.onload = () => {
                    tmpSprite.isLoaded = true;

                    const tmpPad = 1 / (tmpSprite.height / tmpSprite.width);
                    const tmpMlt = (tmp.iPad || 1);

                    tmpContext.drawImage(
                        tmpSprite,
                        -(tmpCanvas.width * tmpMlt * RenderingConfig.iconPad * tmpPad) / 2,
                        -(tmpCanvas.height * tmpMlt * RenderingConfig.iconPad) / 2,
                        tmpCanvas.width * tmpMlt * tmpPad * RenderingConfig.iconPad,
                        tmpCanvas.height * tmpMlt * RenderingConfig.iconPad
                    );

                    tmpContext.fillStyle = "rgba(0, 0, 70, 0.1)";
                    tmpContext.globalCompositeOperation = "source-atop";
                    tmpContext.fillRect(-tmpCanvas.width / 2, -tmpCanvas.height / 2, tmpCanvas.width, tmpCanvas.height);

                    actionElem.style.backgroundImage = `url('${tmpCanvas.toDataURL()}')`;
                };

                tmpSprite.src = `../../img/weapons/${tmp.src}.png`;

                actionElem.onclick = () => Client.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.SELECT_TO_BUILD, i, true);

                actionElem.onmouseover = () => {
                    showItemInfo(tmp, true);
                };

                actionElem.onmouseout = () => {
                    showItemInfo();
                };
            } else {
                const tmpSprite = RendererSystem.getItemSprite(items.list[i - items.weapons.length], true);
                const tmpScale = Math.min(tmpCanvas.width - RenderingConfig.iconPadding, tmpSprite.width);

                tmpContext.globalAlpha = 1;
                tmpContext.drawImage(tmpSprite, -tmpScale / 2, -tmpScale / 2, tmpScale, tmpScale);

                tmpContext.fillStyle = "rgba(0, 0, 70, 0.1)";
                tmpContext.globalCompositeOperation = "source-atop";
                tmpContext.fillRect(-tmpScale / 2, -tmpScale / 2, tmpScale, tmpScale);

                actionElem.style.backgroundImage = `url('${tmpCanvas.toDataURL()}')`;

                actionElem.onclick = () => Client.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.SELECT_TO_BUILD, i - items.weapons.length, false);

                actionElem.onmouseover = () => {
                    showItemInfo(tmp);
                };

                actionElem.onmouseout = () => {
                    showItemInfo();
                };
            }
        }

        for (let i = 19; i <= 38; i++) {
            const itemCounts = document.createElement("div");
            itemCounts.id = `itemCounts${i}`;
            itemCounts.style.position = "absolute";
            itemCounts.style.top = "1.5px";
            itemCounts.style.right = "5px";
            itemCounts.style.color = "white";
            itemCounts.style.fontSize = "18px";

            itemCounts.innerHTML = "0";

            getElem(`actionBarItem${i}`).appendChild(itemCounts);
        }
    }

    static async main() {
        RendererSystem.init();
        this.removeUI();
        this.prepareUI();
        updateSkinColorPicker();

        await this.findServers();

        Hook();
        Client.connect();
    }
}