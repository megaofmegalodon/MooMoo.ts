import PacketMap from "./PacketMap";

export default class PacketManager {
    private static data: Record<string, any> = {};
    private static aimDirection: number;

    static manage(type: string, data: any[]) {
        if (type === PacketMap.CLIENT_TO_SERVER.MOVE) {
            if (typeof this.data[type] == "undefined") this.data[type] = Infinity;

            if (this.data[type] !== data[0]) {
                this.data[type] = data[0];
            } else {
                return false;
            }
        } else if (type === PacketMap.CLIENT_TO_SERVER.SEND_AIM) {
            if (typeof this.aimDirection == "undefined") this.aimDirection = Infinity;

            if (this.aimDirection !== data[0]) {
                this.aimDirection = data[0];
            } else {
                return false;
            }
        } else if (type === PacketMap.CLIENT_TO_SERVER.SEND_HIT) {
            if (typeof this.aimDirection == "undefined") this.aimDirection = Infinity;

            if (this.aimDirection !== data[1]) {
                this.aimDirection = data[1];
            }
        }

        return true;
    }
}