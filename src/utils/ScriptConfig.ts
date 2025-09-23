export interface WeaponVariant {
    id: number;
    src: string;
    xp: number;
    val: number;
}

const ScriptConfig = {
    IN_DEVELOPMENT: true,
    MAP_SIZE: 14400,
    SNOW_BIOME_TOP: 2400,
    WEAPON_VARIANTS: [{
        id: 0,
        src: "",
        xp: 0,
        val: 1
    }, {
        id: 1,
        src: "_g",
        xp: 3000,
        val: 1.1
    }, {
        id: 2,
        src: "_d",
        xp: 7000,
        val: 1.18
    }, {
        id: 3,
        src: "_r",
        poison: true,
        xp: 12000,
        val: 1.18
    }] as WeaponVariant[],
    HIT_ANGLE: Math.PI / 2,
    GATHER_WIGGLE: 10,
    SERVER_UPDATE_SPEED: (1e3 / 9),
    GATHER_ANGLE: Math.PI / 2.6
};

export default ScriptConfig;