import Client from "../../core/Client";
import getElem from "../../utils/getElem";

const itemInfoHolder = getElem<"div">("itemInfoHolder");

export interface ItemInfoItem {
    name: string;
    desc: string;
    type?: number;
    req?: (string | number)[];
    group?: { id: number, limit: number, sandboxLimit?: number };
}

export default function showItemInfo(item?: ItemInfoItem, isWeapon?: boolean, isStoreItem?: boolean) {
    const player = Client.player;

    if (player && item) {
        itemInfoHolder.innerHTML = "";
        itemInfoHolder.classList.add("visible");

        const itemInfoName = document.createElement("div");
        itemInfoName.id = "itemInfoName";
        itemInfoName.innerText = `${item.name.slice(0, 1).toUpperCase() + item.name.slice(1)}`;
        itemInfoHolder.appendChild(itemInfoName);

        const itemInfoDesc = document.createElement("div");
        itemInfoDesc.id = "itemInfoDesc";
        itemInfoDesc.innerText = item.desc;
        itemInfoHolder.appendChild(itemInfoDesc);

        if (isStoreItem) {
        } else if (isWeapon) {
            const itemInfoReq = document.createElement("div");
            itemInfoReq.className = "itemInfoReq";
            itemInfoReq.innerText = !item.type ? "primary" : "secondary";
            itemInfoHolder.appendChild(itemInfoReq);
        } else if (item.req) {
            for (let i = 0; i < item.req.length; i += 2) {
                const itemInfoReq = document.createElement("div");
                itemInfoReq.className = "itemInfoReq";
                itemInfoReq.innerText = `${item.req[i]} <span class="itemInfoReqVal"> x${item.req[i + 1]}</span>`;
            }

            if (item.group && item.group.limit) {
                const itemInfoLmt = document.createElement("div");
                itemInfoLmt.className = "itemInfoLmt";
                itemInfoLmt.innerText = `${(player.itemCounts[item.group.id] || 0)}/${(location.href.includes("sandbox") ? item.group.sandboxLimit ?? item.group.limit : item.group.limit)}`;
                itemInfoHolder.appendChild(itemInfoLmt);
            }
        }
    } else {
        itemInfoHolder.classList.remove("visible");
    }
}