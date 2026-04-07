export interface Entity {
    id: string | number;
    sid: number;
    listHandlerIndex: number;
}

export default class EntityHandler<T extends Entity> {
    private entitiesMap: Map<number, T> = new Map();
    private entitiesList: T[] = [];

    add(entity: T) {
        entity.listHandlerIndex = this.entitiesList.length;
        this.entitiesMap.set(entity.sid, entity);
        this.entitiesList.push(entity);
    }

    get(sid: number) {
        return this.entitiesMap.get(sid);
    }

    has(sid: number) {
        return this.entitiesMap.has(sid);
    }

    remove(sid: number) {
        const entity = this.get(sid);
        if (!entity) return;

        this.entitiesMap.delete(sid);

        const index = entity.listHandlerIndex;
        const lastEntity = this.entitiesList[this.entitiesList.length - 1];

        this.entitiesList[index] = lastEntity;
        lastEntity.listHandlerIndex = index;
        this.entitiesList.pop();
    }

    get all() { return this.entitiesList };
}