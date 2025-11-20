interface Entity {
    id: string | number;
    sid: number;
}

export default class EntityManager<T extends Entity> {
    entities: T[] = [];

    private id: number = 0;
    private link: Map<number | string, number> = new Map();
    private freeIndices: number[] = [];

    private numberOfEntries = 0;

    add(entity: T) {
        if (this.link.has(entity.sid) || (typeof entity.id === "string" && this.link.has(entity.id))) return;
        const id = this.freeIndices.length ? this.freeIndices.pop()! : this.id++;

        this.numberOfEntries++;
        this.entities[id] = entity;
        this.link.set(entity.sid, id);
        if (typeof entity.id === "string") this.link.set(entity.id, id); // only allow string ids for lookup
    }

    remove(entity: T) {
        const id = this.link.get(entity.sid);
        const lastIndex = this.entities.length - 1;

        if (typeof id !== "number") return;

        if (id !== lastIndex) {
            const lastEntity = this.entities[lastIndex]!;
            this.entities[id] = lastEntity;

            this.link.set(lastEntity.sid, id);
            if (typeof lastEntity.id === "string") this.link.set(lastEntity.id, id);
        }

        this.numberOfEntries--;
        this.entities.pop();
        this.freeIndices.push(lastIndex);
        this.link.delete(entity.sid);
        if (typeof entity.id === "string") this.link.delete(entity.id);
    }

    get(identifier: string | number) {
        const id = this.link.get(identifier);
        if (typeof id !== "number") return;
        return this.entities[id];
    }

    size() {
        return this.numberOfEntries;
    }

    has(identifier: string | number) {
        return this.link.has(identifier);
    }

    clear() {
        this.entities.length = 0;
        this.freeIndices.length = 0;
        this.link.clear();
        this.id = 0;
        this.numberOfEntries = 0;
    }
}