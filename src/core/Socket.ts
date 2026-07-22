import { decode, encode } from "msgpack-lite";
import getElem from "../utils/getElem";
import PacketMap, { MOOMOO_CLIENT_TO_SERVER_MAP, MOOMOO_SERVER_TO_CLIENT_MAP } from "./utils/PacketMap";
import { enterGameButton } from "../ui/Hook";
import Client, { gameUI, mainMenu } from "./Client";
import PacketManager from "./utils/PacketManager";

type EventKey = keyof MOOMOO_SERVER_TO_CLIENT_MAP;
type EventCallback<K extends EventKey> = (...args: MOOMOO_SERVER_TO_CLIENT_MAP[K]) => void;

const menuCardHolder = getElem<"div">("menuCardHolder");
const loadingText = getElem<"div">("loadingText");

export default class Socket extends WebSocket {
    private handlers: {
        [K in EventKey]?: EventCallback<K>[]
    } = {};

    private manager = new PacketManager();
    private isLocalServer = false;

    constructor(url: string) {
        super(url);

        this.binaryType = "arraybuffer";
        this.isLocalServer = url.includes("localhost");

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

        if (this.isLocalServer) {
            const type = parsed[0] as keyof MOOMOO_SERVER_TO_CLIENT_MAP;
            this.dispatch(type, parsed[1]);
            return;
        }

        if (parsed[0] === "io-init") {
            const [id, seed, salt] = parsed[1] as MOOMOO_SERVER_TO_CLIENT_MAP["io-init"];
            this.manager.init(id, seed, salt);
            return;
        }

        if (this.manager.tables && typeof parsed[0] === "number") {
            parsed[0] = this.manager.tables.s2c.decrypt[parsed[0]];
            if (parsed[0] === undefined) return;
        }

        const type = parsed[0] as keyof MOOMOO_SERVER_TO_CLIENT_MAP;
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

    private dispatch<K extends keyof MOOMOO_SERVER_TO_CLIENT_MAP>(
        type: K,
        data: unknown
    ) {
        const handlers = this.handlers[type];
        if (!handlers) return;

        const typedData = data as MOOMOO_SERVER_TO_CLIENT_MAP[K];
        handlers.forEach(callback => {
            callback(...typedData);
        });
    }

    async sendMsg<K extends keyof MOOMOO_CLIENT_TO_SERVER_MAP>(type: K, ...data: MOOMOO_CLIENT_TO_SERVER_MAP[K]) {
        if (this.readyState !== WebSocket.OPEN) return;

        if (this.isLocalServer) {
            this.send(new Uint8Array(encode([type, data])));
            return;
        }

        const encryptPacketId = this.manager.tables?.c2s.encrypt[type];
        if (encryptPacketId === undefined) return;

        const currentSequence = ++this.manager.sequence;
        const packetData = encode([encryptPacketId, data, currentSequence]);
        const binary = new Uint8Array(PacketManager.PACKET_PADDING + packetData.length);
        const signature = (await this.manager.getPacketSignature(packetData as any))!;

        binary.set(signature, 0);
        binary.set(packetData, PacketManager.PACKET_PADDING);

        this.send(binary);
    }

    on<K extends EventKey>(event: K, callback: EventCallback<K>) {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }

        this.handlers[event]!.push(callback);
    }
}