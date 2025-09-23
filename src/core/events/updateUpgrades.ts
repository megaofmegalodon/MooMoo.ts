import items from "../../constants/items";
import showItemInfo, { ItemInfoItem } from "../../ui/utils/showItemInfo";
import getElem from "../../utils/getElem";
import Client from "../Client";
import PacketMap from "../utils/PacketMap";

const upgradeHolder = getElem<"div">("upgradeHolder");
const upgradeCounter = getElem<"div">("upgradeCounter");

upgradeHolder.style.top = "50px";
upgradeCounter.style.top = "135px";

export default function updateUpgrades(points: number, age: number) {
    Client.player.upgradePoints = points;
    Client.player.upgrAge = age;

    if (points > 0) {
        const tmpList: number[] = [];

        upgradeHolder.innerHTML = "";

        for (let i = 0; i < items.weapons.length; i++) {
            const wpn = items.weapons[i];

            if (wpn.age === age && (wpn.pre === undefined || Client.player.weapons.indexOf(wpn.pre) >= 0)) {
                const elem = document.createElement("div");
                elem.id = `upgradeItem${i}`;
                elem.className = "actionBarItem";
                elem.onmouseover = () => showItemInfo(wpn, true);
                elem.onmouseout = () => showItemInfo();

                elem.onclick = () => {
                    if (
                        (items.weapons[Client.weaponIndex].type === 0 && wpn.type === 0) ||
                        (items.weapons[Client.weaponIndex].type === 1 && wpn.type === 1)
                    ) {
                        Client.weaponIndex = i;
                    }

                    Client.player.updateWeaponData(i, 0);
                    Client.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.SEND_UPGRADE, i);
                };

                elem.style.backgroundImage = getElem<"div">(`actionBarItem${i}`).style.backgroundImage;
                upgradeHolder.appendChild(elem);

                tmpList.push(i);
            }
        }

        for (let i = 0; i < items.list.length; i++) {
            const item = items.list[i];

            if (item.age == age) {
                const tmpId = i + items.weapons.length;

                const elem = document.createElement("div");
                elem.id = `upgradeItem${tmpId}`;
                elem.className = "actionBarItem";
                elem.onmouseover = () => showItemInfo(item as ItemInfoItem);
                elem.onmouseout = () => showItemInfo();
                elem.onclick = () => Client.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.SEND_UPGRADE, tmpId);
                elem.style.backgroundImage = getElem<"div">(`actionBarItem${tmpId}`).style.backgroundImage;
                upgradeHolder.appendChild(elem);

                tmpList.push(tmpId);
            }
        }

        if (tmpList.length) {
            upgradeHolder.style.display = "block";
            upgradeCounter.style.display = "block";
            upgradeCounter.innerHTML = `SELECT ITEMS (${Math.min(9, points)})`;
        } else {
            upgradeHolder.style.display = "none";
            upgradeCounter.style.display = "none";
            showItemInfo();
        }
    } else {
        upgradeHolder.style.display = "none";
        upgradeCounter.style.display = "none";
        showItemInfo();
    }
}

/*
player.upgradePoints = points;
    player.upgrAge = age;
    if (points > 0) {
        tmpList.length = 0;
        UTILS.removeAllChildren(upgradeHolder);
        for (var i = 0; i < tmpList.length; i++) {
            (function(i) {
                var tmpItem = document.getElementById('upgradeItem' + i);
                tmpItem.onmouseover = function() {
                    if (items.weapons[i]) {
                        showItemInfo(items.weapons[i], true);
                    } else {
                        showItemInfo(items.list[i-items.weapons.length]);
                    }
                };
                tmpItem.onclick = UTILS.checkTrusted(function() {
                    io.send("6", i);
                });
                UTILS.hookTouchEvents(tmpItem);
            })(tmpList[i]);
        }
    } else {
        upgradeHolder.style.display = "none";
        upgradeCounter.style.display = "none";
        showItemInfo();
    }*/