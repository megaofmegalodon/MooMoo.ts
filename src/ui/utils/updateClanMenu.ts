import Client from "../../core/Client";
import PacketMap from "../../core/utils/PacketMap";
import getElem from "../../utils/getElem";
import { chatBox, chatHolder } from "../Hook";

const storeMenu = getElem<"div">("storeMenu");
export const allianceMenu = getElem<"div">("allianceMenu");
const allianceHolder = getElem<"div">("allianceHolder");
const allianceManager = getElem<"div">("allianceManager");

function kickFromClan(sid: number) {
    Client.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.KICK_FROM_CLAN, sid);
}

export default function updateClanMenu() {
    if (Client.player) {
        chatHolder.style.display = "none";
        chatBox.blur();

        storeMenu.style.display = "none";
        allianceMenu.style.display = "block";

        allianceHolder.innerHTML = "";

        if (Client.player.team) {
            for (let i = 0; i < Client.alliancePlayers.length; i += 2) {
                const allianceItem = document.createElement("div");
                allianceItem.className = "allianceItem";
                allianceItem.style = `color: ${Client.alliancePlayers[i] == Client.mySID ? "#fff" : "rgba(255,255,255,0.6)"};`;
                allianceItem.innerText = `${Client.alliancePlayers[i + 1]}`;
                allianceHolder.appendChild(allianceItem);

                if (Client.player.isOwner && Client.alliancePlayers[i] != Client.mySID) {
                    const joinAlBtn = document.createElement("div");
                    joinAlBtn.className = "joinAlBtn";
                    joinAlBtn.innerText = "Kick";
                    joinAlBtn.onclick = () => kickFromClan(Client.alliancePlayers[i] as number);
                    allianceItem.appendChild(joinAlBtn);
                }
            }
        } else {
            if (Client.alliances.length) {
                for (const team of Client.alliances) {
                    const allianceItem = document.createElement("div");
                    allianceItem.className = "allianceItem";
                    allianceItem.style = `color: ${team.sid == Client.player.team ? "#fff" : "rgba(255,255,255,0.6)"};`;
                    allianceItem.innerText = `${team.sid}`;
                    allianceHolder.appendChild(allianceItem);

                    const joinAlBtn = document.createElement("div");
                    joinAlBtn.className = "joinAlBtn";
                    joinAlBtn.innerText = "Join";
                    joinAlBtn.onclick = () => Client.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.JOIN_CLAN, team.sid);
                    allianceItem.appendChild(joinAlBtn);
                }
            } else {
                const allianceItem = document.createElement("div");
                allianceItem.className = "allianceItem";
                allianceItem.innerText = "No Tribes Yet";
                allianceHolder.appendChild(allianceItem);
            }
        }

        allianceManager.innerHTML = "";

        if (Client.player.team) {
            const allianceButtonM = document.createElement("div");
            allianceButtonM.className = "allianceButtonM";
            allianceButtonM.style.width = "360px";
            allianceButtonM.innerText = Client.player.isOwner ? "Delete Tribe" : "Leave Tribe";
            allianceButtonM.onclick = () => Client.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.LEAVE_CLAN);
            allianceManager.appendChild(allianceButtonM);
        } else {
            const allianceInput = document.createElement("input");
            allianceInput.id = "allianceInput";
            allianceInput.maxLength = 7;
            allianceInput.placeholder = "unique name";
            allianceInput.type = "text";
            allianceManager.appendChild(allianceInput);

            const allianceButtonM = document.createElement("div");
            allianceButtonM.className = "allianceButtonM";
            allianceButtonM.style.width = "140px";
            allianceButtonM.innerText = "Create";
            allianceButtonM.onclick = () => Client.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.CREATE_CLAN, allianceInput.value.slice(0, 7));
            allianceManager.appendChild(allianceButtonM);
        }
    }
}