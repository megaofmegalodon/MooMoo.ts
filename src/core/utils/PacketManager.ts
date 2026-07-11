import { clientToServerArr, serverToClientArr } from "./PacketMap";

function createPRNG(seed: number) {
    return function nextRandom() {
        seed |= 0;
        seed = seed + 1831565813 | 0;

        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t,
            ((t ^ t >>> 14) >>> 0) / 4294967296
    };
}

function createCipherMap(charArray: string[], seed: number) {
    const length = charArray.length;
    const indices = charArray.map((_, index) => index);
    const nextRandom = createPRNG(seed >>> 0);

    for (let i = length - 1; i > 0; i--) {
        const randomIndex = Math.floor(nextRandom() * (i + 1));
        const temp = indices[i];

        indices[i] = indices[randomIndex];
        indices[randomIndex] = temp;
    }

    const encryptMap: Record<string, number> = {};
    const decryptMap: Record<number, string> = {};

    for (let i = 0; i < length; i++) {
        const char = charArray[i];
        const shuffledIndex = indices[i];

        encryptMap[char] = shuffledIndex;
        decryptMap[shuffledIndex] = char;
    }

    return {
        encrypt: encryptMap,
        decrypt: decryptMap
    };
}

function hexToBytes(hexString: string) {
    const buffer = new Uint8Array(hexString.length / 2);

    for (let i = 0; i < buffer.length; i++) {
        const index = i * 2;
        const slice = hexString.slice(index, index + 2);

        buffer[i] = parseInt(slice, 16);
    }

    return buffer;
}

interface ICipherMap {
    encrypt: Record<string, number>;
    decrypt: Record<number, string>;
}

interface IPacketCipherMap {
    c2s: ICipherMap;
    s2c: ICipherMap;
}

export default class PacketManager {
    sequence = 0;
    tables?: IPacketCipherMap;
    salt?: Uint8Array;

    static readonly PACKET_PADDING = 6;

    private initTable(seed: number) {
        const c2sSeedBase = (seed ^ Math.imul(1, 2654435761)) >>> 0;
        const s2cSeedBase = (c2sSeedBase ^ 2246822507) >>> 0;

        this.tables = {
            c2s: createCipherMap(clientToServerArr, c2sSeedBase),
            s2c: createCipherMap(serverToClientArr, s2cSeedBase),
        };
    }

    init(id: string, seed: number, salt: string) {
        this.sequence = 0;
        this.initTable(seed >>> 0);
        this.salt = hexToBytes(salt);
    }

    async getPacketSignature(data: ArrayBuffer) {
        if (!this.salt) return;
        const cryptoKey = await crypto.subtle.importKey("raw", this.salt as unknown as ArrayBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
        const signature = await crypto.subtle.sign("HMAC", cryptoKey, data);
        return new Uint8Array(signature).subarray(0, PacketManager.PACKET_PADDING);
    }
}