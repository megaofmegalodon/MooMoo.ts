export type AllianceDataType = {

    /**
     * The string value that represents the "id" of the tribe/alliance/clan.
     * Use this to send a join request to a clan of choice.
     */

    sid: string;

    /**
     * Owner is a number. The number represents the sid value of the player.
     */

    owner: number;
}

export type AllianceNotifi = {
    sid: number;
    name: string;
}

export type Point = {
    x: number;
    y: number;
}

declare global {
    interface HTMLImageElement {
        isLoaded: boolean;
    }

    interface Window {
        changeStoreIndex: (index: number) => void;
    }
}