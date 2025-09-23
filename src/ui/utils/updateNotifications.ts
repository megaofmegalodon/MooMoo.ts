import Client from "../../core/Client";
import PacketMap from "../../core/utils/PacketMap";
import { AllianceNotifi } from "../../types";
import getElem from "../../utils/getElem";

const noticationDisplay = getElem<"div">("noticationDisplay");

function sendRequestResponse(tmp: AllianceNotifi, accepted: boolean) {
    Client.socket.sendMsg(PacketMap.CLIENT_TO_SERVER.JOIN_REQUEST, tmp.sid, accepted);
    Client.allianceNotifications.splice(0, 1);
    updateNotifications();
}

export default function updateNotifications() {
    if (Client.allianceNotifications[0]) {
        const tmp = Client.allianceNotifications[0];

        noticationDisplay.innerHTML = "";
        noticationDisplay.style.display = "block";

        const notificationText = document.createElement("div");
        notificationText.className = "notificationText";
        notificationText.innerText = tmp.name;
        noticationDisplay.appendChild(notificationText);

        const notifButton_a = document.createElement("div");
        notifButton_a.className = "notifButton";
        notifButton_a.innerHTML = `<i class="material-icons" style="font-size: 28px; color: #cc5151;">&#xE14C;</i>`;
        notifButton_a.onclick = () => sendRequestResponse(tmp, false);
        noticationDisplay.appendChild(notifButton_a);

        const notifButton_b = document.createElement("div");
        notifButton_b.className = "notifButton";
        notifButton_b.innerHTML = `<i class="material-icons" style="font-size: 28px; color: #8ecc51;">&#xE876;</i>`;
        notifButton_b.onclick = () => sendRequestResponse(tmp, true);
        noticationDisplay.appendChild(notifButton_b);
    } else {
        noticationDisplay.style.display = "none";
    }
}