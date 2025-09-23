import { PlayerInitType } from "../../constants/Player";
import { AllianceDataType } from "../../types";

const PacketMap = {
    CLIENT_TO_SERVER: {
        SELECT_TO_BUILD: "z",
        AUTO_GATHER: "K",
        MOVE: "9",
        RESET_MOVEMENT_DIR: "e",
        JOIN_CLAN: "b",
        CREATE_CLAN: "L",
        LEAVE_CLAN: "N",
        JOIN_GAME: "M",
        PING_SOCKET: "0",
        JOIN_REQUEST: "P",
        KICK_FROM_CLAN: "Q",
        SEND_CHAT: "6",
        SEND_HIT: "F",
        SEND_AIM: "D",
        SEND_UPGRADE: "H",
        PING_MAP: "S",
        STORE: "c"
    },
    SERVER_TO_CLIENT: {
        SET_UP_GAME: "C",
        ADD_PLAYER: "D",
        REMOVE_PLAYER: "E",
        UPDATE_PLAYERS: "a",
        UPDATE_LEADERBOARD: "G",
        UPDATE_ITEMS: "V",
        PING_RESPONSE: "0",
        UPDATE_AGE: "T",
        KILL_PLAYER: "P",
        UPDATE_UPGRADES: "U",
        RECEIVE_CHAT: "6",
        SET_PLAYER_TEAM: "3",
        SET_INIT_DATA: "A",
        LOAD_GAME_OBJECT: "H",
        LOAD_AI: "I",
        ANIMATE_AI: "J",
        GATHER_ANIMATION: "K",
        WIGGLE_GAME_OBJECT: "L",
        SHOOT_TURRET: "M",
        UPDATE_PLAYER_VALUE: "N",
        UPDATE_HEALTH: "O",
        KILL_OBJECT: "Q",
        KILL_OBJECTS: "R",
        UPDATE_ITEM_COUNTS: "S",
        ADD_PROJECTILE: "X",
        REMOVE_PROJECTILE: "Y",
        ADD_ALLIANCE: "g",
        DELETE_ALLIANCE: "1",
        ALLIANCE_NOTIFICATION: "2",
        SET_ALLIANCE_PLAYERS: "4",
        UPDATE_STORE_ITEMS: "5",
        UPDATE_MINIMAP: "7",
        SHOW_TEXT: "8",
        PING_MAP: "9"
    }
} as const;

export interface ClientToServerPacketMap {
    "z": [id: number, isWeapon: boolean];
    "K": [id: 1];
    "e": [];
    "6": [msg: string];
    "M": [data: { name: string, moofoll: number, skin: number }];
    "9": [angle: number | null];
    "0": [];
    "S": [];
    "D": [angle: number];
    "F": [autoGatherToggle: number, dir: number];
    "H": [id: number];
    "P": [sid: number, accepted: boolean];
    "Q": [sid: number];
    "b": [sid: string];
    "N": [];
    "L": [name: string];
    "c": [buy: boolean, id: number, index: boolean];
};

export interface ServerToClientPacketMap {
    "A": [data: { teams: AllianceDataType[] }];
    "C": [yourSID: number];
    "D": [
        /** provides data to initialize a player object */ data: PlayerInitType,
        isYou: boolean
    ];
    "I": [data: number[]];
    "E": [id: string];
    "Q": [sid: number];
    "R": [ownerSID: number];
    "a": [data: (string | number)[]];
    "O": [sid: number, health: number];
    "9": [x: number, y: number];
    "g": [data: AllianceDataType];
    "1": [
        /** sid of the alliance that should be removed */ sid: string
    ];
    "2": [sid: number, name: string];
    "3": [team: string, isOwner: boolean];
    "5": [type: boolean, id: number, index: number];
    "4": [data: (number | string)[]];
    "8": [x: number, y: number, value: number, type: number];
    "S": [index: number, value: number];
    "J": [sid: number];
    "H": [data: number[]];
    "G": [data: (number | string)[]];
    "N": [index: "stone" | "wood" | "food" | "kills" | "points", value: number, updateView: boolean];
    "T": [xp: number | undefined, mxp: number | undefined, age: number | undefined];
    "V": [data: number[] | null, wpn: boolean];
    "0": [];
    "P": [];
    "6": [sid: number, message: string];
    "K": [sid: number, didHit: boolean, index: number];
    "L": [dir: number, sid: number];
    "M": [sid: number, dir: number];
    "U": [points: number, age: number];
    "X": [x: number, y: number, dir: number, range: number, speed: number, indx: number, layer: number, sid: number];
    "Y": [sid: number, range: number];
}

export default PacketMap;