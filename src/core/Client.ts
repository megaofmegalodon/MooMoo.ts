import Ai, { ais, aiTypes } from "../constants/Ai";
import items from "../constants/items";
import Player, { ChatMessage, players } from "../constants/Player";
import { STORE_HAT_ID, STORE_HAT_MAP } from "../constants/store";
import RendererSystem, { diedText } from "../rendering/RendererSystem";
import RendererUtils from "../rendering/RendererUtils";
import { AllianceDataType, AllianceNotifi, Point } from "../types";
import { isOnWindow } from "../ui/Hook";
import Loader from "../ui/Loader";
import generateStoreList, { storeMenu } from "../ui/utils/generateStoreList";
import updateClanMenu from "../ui/utils/updateClanMenu";
import updateNotifications from "../ui/utils/updateNotifications";
import getDir from "../utils/getDir";
import getDist from "../utils/getDist";
import getElem from "../utils/getElem";
import kFormat from "../utils/kFormat";
import ScriptConfig from "../utils/ScriptConfig";
import updateItems from "./events/updateItems";
import updateUpgrades from "./events/updateUpgrades";
import ObjectManager from "./logic/ObjectManager";
import ProjectileManager from "./logic/ProjectileManager";
import TextManager from "./logic/TextManager";
import Socket from "./Socket";
import TokenGenerator from "./TokenGenerator";
import PacketMap from "./utils/PacketMap";
import updateStatusDisplay from "./utils/updateStatusDisplay";
import GameObject from "../constants/GameObject";

export const mainMenu = getElem<"div">("mainMenu");
const loadingText = getElem<"div">("loadingText");
export const menuCardHolder = getElem<"div">("menuCardHolder");

export const gameUI = getElem<"div">("gameUI");
const leaderboardData = getElem<"div">("leaderboardData");

const ageText = getElem<"div">("ageText");
const ageBarBody = getElem<"div">("ageBarBody");

const pingDisplay = getElem<"div">("pingDisplay");
const allianceMenu = getElem<"div">("allianceMenu");

getElem("bottomContainer").style.bottom = "20px";

/**
 * This class represents the current state of the Client.
 * It contains (or will contain) references to many of the important variables for the client.
 */

export default class Client {
    static socket: Socket;
    static player: Player;

    static mySID: number = -1;

    static lastDeath: Point;
    static lastMoveDir: number | null;

    static alliancePlayers: (string | number)[] = [];
    static alliances: AllianceDataType[] = [];
    static allianceNotifications: AllianceNotifi[] = [];

    static packets = 0;

    static weaponIndex = 0;
    static buildingsHit: GameObject[] = [];

    static wsAddress: string = "";

    static async connect() {
        if (Loader.PRIVATE_SERVER) {
            this.socket = new Socket("ws://localhost:1234");
        } else {
            const token = await TokenGenerator.default();
            this.wsAddress = `wss://${Loader.currentServer.key}.${Loader.currentServer.region}.moomoo.io/?token=`;
            const url = `${this.wsAddress}${token}`;

            this.socket = new Socket(url);
        }

        this.hookEvents();
    }

    private static lastPingSocket = Date.now();

    private static pingSocket() {
        this.lastPingSocket = Date.now();
        this.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.PING_SOCKET);
    }

    static isFriendly(sid: number) {
        return this.mySID == sid || this.alliancePlayers.includes(sid);
    }

    static pingTime: number = 0;

    static hookEvents() {
        this.pingSocket();
        setInterval(() => this.pingSocket(), 2e3);

        gameUI.appendChild(pingDisplay);

        this.socket.on(PacketMap.SERVER_TO_CLIENT.SET_INIT_DATA, (data) => {
            this.alliances = data.teams;
            if (allianceMenu.style.display == "block") updateClanMenu();
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.SET_ALLIANCE_PLAYERS, (data) => {
            this.alliancePlayers = data;
            if (allianceMenu.style.display == "block") updateClanMenu();
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.SET_PLAYER_TEAM, (team, isOwner) => {
            if (this.player) {
                this.player.team = team;
                this.player.isOwner = isOwner;

                if (allianceMenu.style.display == "block") updateClanMenu();
            }
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.ALLIANCE_NOTIFICATION, (sid, name) => {
            this.allianceNotifications.push({ sid, name });
            updateNotifications();
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.ADD_ALLIANCE, (data) => {
            this.alliances.push(data);
            if (allianceMenu.style.display == "block") updateClanMenu();
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.UPDATE_STORE_ITEMS, (type, id, index) => {
            const player = this.player;

            if (index) {
                if (!type) {
                    player.tails[id] = true;
                } else {
                    player.tailIndex = id;
                }
            } else {
                if (!type) {
                    player.skins[id] = true;
                } else {
                    player.skinIndex = id;
                }
            }

            if (storeMenu.style.display == "block")
                generateStoreList();
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.UPDATE_UPGRADES, (points, age) => {
            updateUpgrades(points, age)
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.UPDATE_ITEM_COUNTS, (index, value) => {
            this.player.itemCounts[index] = value;

            const itemMapping = {
                1: [19, 20, 21],
                2: [22, 23, 24, 25],
                3: [26, 27, 28],
                4: [29],
                5: [31],
                6: [32],
                7: [33],
                8: [34],
                9: [35],
                10: [36],
                11: [30],
                12: [37],
                13: [38]
            };

            let itemRanges = itemMapping[index as keyof typeof itemMapping];

            if (itemRanges) {
                itemRanges.forEach(itemId => {
                    getElem(`itemCounts${itemId}`).innerHTML = `${value}`;
                });
            }
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.DELETE_ALLIANCE, (sid) => {
            for (let i = 0; i < this.alliances.length; i++) {
                const team = this.alliances[i];

                if (team && team.sid == sid) {
                    this.alliances.splice(i, 1);
                    break;
                }
            }

            if (allianceMenu.style.display == "block") updateClanMenu();
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.PING_RESPONSE, () => {
            const ping = Date.now() - this.lastPingSocket;

            this.pingTime = ping;
            pingDisplay.hidden = false;
            pingDisplay.innerText = `Ping: ${ping} ms`;
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.SET_UP_GAME, (yourSID) => {
            this.mySID = yourSID;

            mainMenu.style.display = "none";
            loadingText.style.display = "none";
            menuCardHolder.style.display = "block";
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.ADD_PLAYER, (data, isYou) => {
            let tmpPlayer = players.idMap.get(data[0]);

            if (!tmpPlayer) {
                tmpPlayer = new Player(data[0], data[1]);
                Player.addPlayer(tmpPlayer);
            }

            tmpPlayer.spawn();
            tmpPlayer.setData(data);
            tmpPlayer.visible = false;

            if (isYou) {
                RendererSystem.camX = tmpPlayer.x;
                RendererSystem.camY = tmpPlayer.y;
                this.player = tmpPlayer;

                Client.weaponIndex = 0;

                updateStatusDisplay();
                updateItems(null, false);

                ageText.innerHTML = "AGE 1";
                ageBarBody.style.width = "0%";

                gameUI.style.display = "block";
            }
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.UPDATE_PLAYER_VALUE, (index, value, updateView) => {
            if (this.player) this.player[index] = value;
            if (updateView) updateStatusDisplay();
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.WIGGLE_GAME_OBJECT, (dir, sid) => {
            const gameObject = ObjectManager.getObject(sid);

            if (gameObject) {
                gameObject.xWiggle += Math.cos(dir) * ScriptConfig.GATHER_WIGGLE;
                gameObject.yWiggle += Math.sin(dir) * ScriptConfig.GATHER_WIGGLE;

                if (gameObject.maxHealth) this.buildingsHit.push(gameObject);
            }
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.SHOOT_TURRET, (sid, dir) => {
            const gameObject = ObjectManager.getObject(sid);

            if (gameObject) {
                gameObject.dir = dir;
                gameObject.xWiggle += Math.cos(dir + Math.PI) * ScriptConfig.GATHER_WIGGLE;
                gameObject.yWiggle += Math.sin(dir + Math.PI) * ScriptConfig.GATHER_WIGGLE;
            }
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.REMOVE_PLAYER, (id) => {
            const player = players.idMap.get(id);

            if (player) Player.removePlayer(player);
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.UPDATE_HEALTH, (sid, health) => {
            const player = players.sidMap.get(sid);

            if (player) {
                const delta = health - player.health;

                if (delta >= 0) {
                    if (player.hitTime) {
                        const timeSinceHit = Date.now() - player.hitTime;
                        player.hitTime = 0;

                        if (timeSinceHit <= ScriptConfig.SERVER_UPDATE_SPEED) {
                            player.shameCount++;
                        } else {
                            player.shameCount = Math.max(0, player.shameCount - 2);
                        }
                    }
                } else {
                    player.hitTime = Date.now();
                }

                player.health = health;
            }
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.LOAD_AI, (data) => {
            for (const ai of ais.values()) {
                ai.forcePos = !ai.visible;
                ai.visible = false;
            }

            data = data ?? [];

            for (let i = 0; i < data.length; i += 7) {
                let ai = ais.get(data[i]);

                if (ai) {
                    ai.x1 = ai.x;
                    ai.y1 = ai.y;

                    ai.x2 = data[i + 2];
                    ai.y2 = data[i + 3];

                    ai.d1 = ai.d2;
                    ai.d2 = data[i + 4];
                    ai.deltaTime = 0;

                    ai.health = data[i + 5];

                    ai.visible = true;
                } else {
                    ai = new Ai(data[i + 2], data[i + 3], data[i + 4], data[i + 1]);
                    ai.health = data[i + 5];

                    if (!aiTypes[data[i + 1]].name) ai.name = RendererUtils.cowNames[data[i + 6]];

                    ai.forcePos = true;
                    ai.sid = data[i];
                    ai.visible = true;

                    ais.set(data[i], ai);
                }
            }
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.KILL_OBJECT, (sid) => {
            ObjectManager.remove(sid);
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.KILL_OBJECTS, (ownerSID) => {
            ObjectManager.removeAll(ownerSID);
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.KILL_PLAYER, () => {
            gameUI.style.display = "none";

            Client.lastDeath = {
                x: this.player.x,
                y: this.player.y
            };

            loadingText.style.display = "none";
            diedText.style.display = "block";
            diedText.style.fontSize = "0px";

            RendererSystem.deathTextScale = 0;

            setTimeout(() => {
                menuCardHolder.style.display = "block";
                mainMenu.style.display = "block";
                diedText.style.display = "none";
            }, 3e3);
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.RECEIVE_CHAT, (sid, msg) => {
            const player = players.sidMap.get(sid);

            if (player) {
                player.chatMessages.unshift(new ChatMessage(msg));

                if (player.chatMessages.length > 3) player.chatMessages.length = 3;
            }
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.GATHER_ANIMATION, (sid, didHit, index) => {
            const player = players.sidMap.get(sid);

            if (player) {
                player.updateWeaponData(index, undefined, true);

                player.reloads[index] = player.animTime = player.animSpeed = items.weapons[index].speed;
                player.targetAngle = (didHit ? -ScriptConfig.HIT_ANGLE : -Math.PI);
                player.tmpRatio = 0;
                player.animIndex = 0;
            }
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.UPDATE_ITEMS, (data, wpn) => {
            updateItems(data, wpn);
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.ADD_PROJECTILE, (x, y, dir, range, speed, indx, layer, sid) => {
            ProjectileManager.add(x, y, dir, range, speed, indx, layer, sid);
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.REMOVE_PROJECTILE, (sid, range) => ProjectileManager.remove(sid, range));

        this.socket.on(PacketMap.SERVER_TO_CLIENT.UPDATE_LEADERBOARD, (data) => {
            leaderboardData.innerHTML = "";

            let placementCounter = 1;

            for (let i = 0; i < data.length; i += 3) {
                const leaderHolder = document.createElement("div");
                leaderHolder.classList.add("leaderHolder");

                const nameDisplay = document.createElement("div");
                nameDisplay.classList.add("leaderboardItem");
                nameDisplay.style.color = data[i] == this.mySID ? "#ffffff" : "rgba(255, 255, 255, .6)";
                nameDisplay.innerText = `${placementCounter}. ${data[i + 1] || "unknown"}`;

                const leaderScore = document.createElement("leaderScore");
                leaderScore.classList.add("leaderScore");
                leaderScore.innerText = `${kFormat(data[i + 2] as number)}`;

                leaderHolder.appendChild(nameDisplay);
                leaderHolder.appendChild(leaderScore);

                leaderboardData.appendChild(leaderHolder);

                placementCounter++;
            }
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.LOAD_GAME_OBJECT, (data) => {
            for (let i = 0; i < data.length; i += 8) {
                ObjectManager.add(data[i], data[i + 1], data[i + 2], data[i + 3], data[i + 4], data[i + 5], data[i + 6], true, data[i + 7]);
            }
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.UPDATE_AGE, (xp, mxp, age) => {
            const player = this.player;

            if (xp != undefined) player.XP = xp;
            if (mxp != undefined) player.maxXP = mxp;
            if (age != undefined) player.age = age;

            ageText.innerHTML = "AGE " + player.age;
            ageBarBody.style.width = ((player.XP / player.maxXP) * 100) + "%";
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.SHOW_TEXT, (x, y, value, type) => {
            TextManager.add(x, y, value, type);
        });

        this.socket.on(PacketMap.SERVER_TO_CLIENT.UPDATE_PLAYERS, (data) => {
            for (const player of players.idMap.values()) {
                player.forcePos = !player.visible;
                player.visible = false;
            }

            for (let i = 0; i < data.length; i += 13) {
                const player = players.sidMap.get(data[i] as number);

                if (player) {
                    player.x1 = player.x;
                    player.y1 = player.y;

                    player.x2 = data[i + 1] as number;
                    player.y2 = data[i + 2] as number;

                    if (!isOnWindow()) player.update(player.deltaTime);

                    player.d1 = player.d2;
                    player.d2 = data[i + 3] as number;
                    player.deltaTime = 0;

                    player.buildIndex = data[i + 4] as number;
                    player.weaponIndex = data[i + 5] as number;
                    player.weaponVariant = data[i + 6] as number;
                    player.team = data[i + 7] as string;
                    player.isLeader = data[i + 8] as number;
                    player.skinIndex = data[i + 9] as number;
                    player.tailIndex = data[i + 10] as number;
                    player.iconIndex = data[i + 11] as number;
                    player.zIndex = data[i + 12] as number;
                    player.visible = true;
                }
            }
        });
    }
}