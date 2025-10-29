export default class EntityManager<T> {
    entities: (T | undefined)[] = [];
    private recentlyRemoved: number[] = [];

    /**
     * Maps out entities to their indexes.
     */

    private entitiesMap: Map<number | string, number> = new Map();

    add(sid: number, id: string, item: T) {
        if (this.entitiesMap.has(sid)) return;
        if (this.entitiesMap.has(id)) return;

        const recent = this.recentlyRemoved.shift();

        this.entitiesMap.set(sid, recent ?? this.entities.length);
        if (id !== "no") this.entitiesMap.set(id, recent ?? this.entities.length);

        if (typeof recent === "number") {
            this.entities[recent] = item;
        } else this.entities.push(item);
    }

    has(id: number | string) {
        const index = this.entitiesMap.get(id);

        if (typeof index !== "number")
            return false;

        const entity = this.entities[index];

        if (!entity)
            return false;

        return true;
    }

    get(id: number | string): T | undefined {
        const index = this.entitiesMap.get(id);
        if (typeof index !== "number") return undefined;

        const entity = this.entities[index];
        if (!entity) return undefined;

        return entity;
    }

    remove(sid: number, id: string) {
        const index = this.entitiesMap.get(sid);

        if (typeof index !== "number") return;

        this.entities[index] = undefined;
        this.recentlyRemoved.push(index);
        this.entitiesMap.delete(sid);
        if (id !== "no") this.entitiesMap.delete(id);
    }

    clear() {
        this.entities.length = 0;
        this.entitiesMap.clear();
    }
}