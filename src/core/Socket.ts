import { decode, encode } from "msgpack-lite";
import getElem from "../utils/getElem";
import PacketMap, { ClientToServerPacketMap, ServerToClientPacketMap } from "./utils/PacketMap";
import { enterGameButton } from "../ui/Hook";
import Client, { gameUI, mainMenu } from "./Client";
import PacketManager from "./utils/PacketManager";

type EventKey = keyof ServerToClientPacketMap;
type EventCallback<K extends EventKey> = (...args: ServerToClientPacketMap[K]) => void;

const menuCardHolder = getElem<"div">("menuCardHolder");
const loadingText = getElem<"div">("loadingText");

export default class Socket extends WebSocket {
    private handlers: {
        [K in EventKey]?: EventCallback<K>[]
    } = {};

    constructor(url: string) {
        super(url);

        this.binaryType = "arraybuffer";

        this.onopen = () => this.onOpen();
        this.onmessage = (event) => this.onMessage(event);
        this.onclose = (event) => this.onClose(event);
    }

    private onOpen() {
        menuCardHolder.style.display = "block";
        loadingText.style.display = "none";

        enterGameButton.classList.remove("disabled");
    }

    private onMessage(event: MessageEvent) {
        const parsed = decode(new Uint8Array(event.data));
        const type = parsed[0] as keyof ServerToClientPacketMap;

        this.dispatch(type, parsed[1]);
    }

    private onClose(event: CloseEvent) {
        mainMenu.style.display = "block";
        gameUI.style.display = "none";
        menuCardHolder.style.display = "none";
        loadingText.style.display = "block";

        if (event.code == 1000) {
            loadingText.innerText = "Kicked";
        } else if (event.code == 4001) {
            loadingText.innerText = "Invalid Connection";
        } else {
            loadingText.innerText = "Disconnected";
        }
    }

    private dispatch<K extends keyof ServerToClientPacketMap>(
        type: K,
        data: unknown
    ) {
        const handlers = this.handlers[type];
        if (!handlers) return;

        const typedData = data as ServerToClientPacketMap[K];
        handlers.forEach(callback => {
            callback(...typedData);
        });
    }


    sendMsg<K extends keyof ClientToServerPacketMap>(type: K, ...data: ClientToServerPacketMap[K]) {
        if (this.readyState === WebSocket.OPEN && PacketManager.manage(type, data)) {
            this.send(encode([type, data]));

            if (type !== PacketMap.CLIENT_TO_SERVER.PING_SOCKET) {
                Client.packets++;
                setTimeout(() => Client.packets--, 1e3);
            }
        }
    }

    on<K extends EventKey>(event: K, callback: EventCallback<K>) {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }

        this.handlers[event]!.push(callback);
    }
}