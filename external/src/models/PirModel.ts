export class PirModel {
    public constructor(init?: Partial<PirModel>) {
        Object.assign(this, init);
    }

    active: boolean;
    pirId: string;
    pirText: string;
    pirDescription: string;
}
