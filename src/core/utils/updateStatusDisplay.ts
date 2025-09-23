import getElem from "../../utils/getElem";
import Client from "../Client";

const scoreDisplay = getElem<"div">("scoreDisplay");
const foodDisplay = getElem<"div">("foodDisplay");
const woodDisplay = getElem<"div">("woodDisplay");
const stoneDisplay = getElem<"div">("stoneDisplay");
const killCounter = getElem<"div">("killCounter");

export default function updateStatusDisplay() {
    const player = Client.player;

    scoreDisplay.innerText = `${player.points}`;
    foodDisplay.innerText = `${player.food}`;
    woodDisplay.innerText = `${player.wood}`;
    stoneDisplay.innerText = `${player.stone}`;
    killCounter.innerText = `${player.kills}`;
}