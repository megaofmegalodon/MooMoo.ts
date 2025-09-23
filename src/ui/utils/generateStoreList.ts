import store, { Hat } from "../../constants/store";
import Client from "../../core/Client";
import PacketMap from "../../core/utils/PacketMap";
import getElem from "../../utils/getElem";
import showItemInfo from "./showItemInfo";

export const storeMenu = getElem<"div">("storeMenu");
const storeHolder = getElem<"div">("storeHolder");

let storeIndex = 0;

window.changeStoreIndex = (index: number) => {
    storeIndex = index;
    generateStoreList();
}

export default function generateStoreList() {
    const player = Client.player;

    if (player) {
        storeHolder.innerHTML = "";

        const storeItems = storeIndex ? store.accessories : store.hats;

        for (let i = 0; i < storeItems.length; i++) {
            const item = storeItems[i];

            const storeDisplay = document.createElement("div");
            storeDisplay.className = "storeItem";
            storeDisplay.onmouseout = () => showItemInfo();
            storeDisplay.onmouseover = () => showItemInfo(item, false, true);
            storeHolder.appendChild(storeDisplay);

            const img = document.createElement("img");
            img.className = "hatPreview";
            img.src = `https://sandbox.moomoo.io/img/${storeIndex ? "accessories/access_" : "hats/hat_"}${item.id + ((item as Hat).topSprite ? "_p" : "")}.png`;
            storeDisplay.appendChild(img);

            const itemName = document.createElement("span");
            itemName.innerText = item.name;
            storeDisplay.appendChild(itemName);

            if (storeIndex ? !player.tails[item.id] : !player.skins[item.id]) {
                const joinAlBtn = document.createElement("div");
                joinAlBtn.className = "joinAlBtn";
                joinAlBtn.style.marginTop = "5px";
                joinAlBtn.innerText = "Buy";
                joinAlBtn.onclick = () => Client.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.STORE, true, item.id, !!storeIndex);
                storeDisplay.appendChild(joinAlBtn);

                const itemPrice = document.createElement("span");
                itemPrice.className = "itemPrice";
                itemPrice.innerText = `${item.price}`;
                storeDisplay.appendChild(itemPrice);
            } else if ((storeIndex ? player.tailIndex : player.skinIndex) == item.id) {
                const joinAlBtn = document.createElement("div");
                joinAlBtn.className = "joinAlBtn";
                joinAlBtn.style.marginTop = "5px";
                joinAlBtn.innerText = "Unequip";
                joinAlBtn.onclick = () => Client.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.STORE, false, 0, !!storeIndex);
                storeDisplay.appendChild(joinAlBtn);
            } else {
                const joinAlBtn = document.createElement("div");
                joinAlBtn.className = "joinAlBtn";
                joinAlBtn.style.marginTop = "5px";
                joinAlBtn.innerText = "Equip";
                joinAlBtn.onclick = () => Client.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.STORE, false, item.id, !!storeIndex);
                storeDisplay.appendChild(joinAlBtn);
            }
        }
    }
}