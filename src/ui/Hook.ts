import { players } from "../constants/Player";
import Client from "../core/Client";
import PacketMap from "../core/utils/PacketMap";
import RendererSystem from "../rendering/RendererSystem";
import RenderingConfig from "../rendering/RenderingConfig";
import { Point } from "../types";
import getElem from "../utils/getElem";
import Loader from "./Loader";
import generateStoreList, { storeMenu } from "./utils/generateStoreList";
import updateClanMenu, { allianceMenu } from "./utils/updateClanMenu";

const moveKeys: Record<number, [number, number]> = {
    87: [0, -1],
    38: [0, -1],
    83: [0, 1],
    40: [0, 1],
    65: [-1, 0],
    37: [-1, 0],
    68: [1, 0],
    39: [1, 0]
};

function getMoveDir(): number | null {
    let dx = 0;
    let dy = 0;

    for (const key in moveKeys) {
        const keyNum = Number(key);

        if (Input.keys[keyNum]) {
            const [mx, my] = moveKeys[keyNum];

            dx += mx;
            dy += my;
        }
    }

    return (dx === 0 && dy === 0) ? null : parseFloat(Math.atan2(dy, dx).toFixed(2));
}

const gameCanvas = getElem<"canvas">("gameCanvas");

export class Input {
    static keys: Record<string | number, boolean> = {};

    private static mouseX: number = 0;
    private static mouseY: number = 0;

    static init() {
        gameCanvas.addEventListener("mousemove", (event) => {
            Input.mouseX = event.clientX;
            Input.mouseY = event.clientY;
        });
    }

    static getAttackDir() {
        const mouseDir = Math.atan2(this.mouseY - (window.innerHeight / 2), this.mouseX - (window.innerWidth / 2));
        return mouseDir;
    }
}

Input.init();

function sendMoveDir() {
    const moveDir = getMoveDir();

    Client.lastMoveDir = moveDir;
    Client.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.MOVE, Client.lastMoveDir);
}

document.addEventListener("contextmenu", (event) => event.preventDefault());

export const chatBox = getElem<"input">("chatBox");
export const chatHolder = getElem<"div">("chatHolder");

chatHolder.style.alignItems = "center";
chatHolder.style.flexDirection = "column";

function resetMovementDir() {
    Input.keys = {};
    Client.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.RESET_MOVEMENT_DIR);
}

function toggleChat() {
    if (chatHolder.style.display !== "flex") {
        chatHolder.style.display = "flex";
        chatBox.focus();
        resetMovementDir();
    } else {
        chatHolder.style.display = "none";
        requestAnimationFrame(() => chatBox.blur());

        if (chatBox.value.length) Client.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.SEND_CHAT, chatBox.value.slice(0, 30));

    }

    chatBox.value = "";
}

gameCanvas.addEventListener("mousedown", (event) => {
    inWindow = true;
});

gameCanvas.addEventListener("wheel", (event) => {
    if (event.deltaY > 0) {
        RenderingConfig.maxScreenWidth *= 0.95;
        RenderingConfig.maxScreenHeight *= 0.95;
    } else {
        RenderingConfig.maxScreenWidth /= 0.95;
        RenderingConfig.maxScreenHeight /= 0.95;
    }

    RendererSystem.resize();
});

let inWindow = false;

export function isOnWindow() {
    return inWindow;
}

window.onblur = () => {
    inWindow = false;
};

window.onfocus = () => {
    inWindow = true;

    if (Client.player) {
        for (const player of players.sidMap.values()) {
            player.resetReloads();
        }
    }
};

function isKeyboardActive() {
    return chatHolder.style.display !== "flex" && allianceMenu.style.display !== "block";
}

document.addEventListener("keydown", (event) => {
    inWindow = true;

    if (event.code === "Enter") {
        toggleChat();
    } else if (isKeyboardActive()) {
        Input.keys[event.code] = true;
        Input.keys[event.keyCode] = true;
        Input.keys[event.key] = true;

        if (moveKeys[event.keyCode]) {
            sendMoveDir();
        } else {
            if (event.code === "KeyE") {
                Client.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.AUTO_GATHER, 1);
            } else if (/Digit[0-9]/.test(event.code)) {
                const player = Client.player;
                const id = parseInt(event.code.split("Digit")[1]) - 1;

                if (typeof player.weapons[id] === "number") {
                    Client.weaponIndex = player.weapons[id];
                    Client.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.SELECT_TO_BUILD, player.weapons[id], true);
                } else if (typeof player.items[id - player.weapons.length] === "number") {
                    Client.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.SELECT_TO_BUILD, player.items[id - player.weapons.length], false);
                }
            }
        }
    }
});

document.addEventListener("keyup", (event) => {
    Input.keys[event.code] = false;
    Input.keys[event.keyCode] = false;
    Input.keys[event.key] = false;

    if (moveKeys[event.keyCode]) {
        sendMoveDir();
    }
});

export const enterGameButton = getElem<"div">("enterGame");
const nameInput = getElem<"input">("nameInput");

const allianceButton = getElem<"div">("allianceButton");
const storeButton = getElem<"div">("storeButton");

export default function Hook() {
    enterGameButton.onclick = () => {
        const name = nameInput.value;

        Client.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.JOIN_GAME, {
            name,
            moofoll: 1,
            skin: Loader.skinColor
        });
    };

    allianceButton.onclick = (event) => {
        chatHolder.style.display = "none";
        chatBox.blur();

        resetMovementDir();

        if (allianceMenu.style.display != "block") {
            updateClanMenu();
        } else {
            allianceMenu.style.display = "none";
        }

        event.preventDefault();
    };

    storeButton.onclick = (event) => {
        chatHolder.style.display = "none";
        chatBox.blur();

        if (storeMenu.style.display != "block") {
            storeMenu.style.display = "block";
            allianceMenu.style.display = "none";
            generateStoreList();
        } else {
            storeMenu.style.display = "none";
        }

        event.preventDefault();
    };
}