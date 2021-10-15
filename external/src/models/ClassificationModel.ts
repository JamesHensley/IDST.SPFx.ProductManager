export class ClassificationModel {
    public constructor(init?: Partial<ClassificationModel>) {
        Object.assign(this, init);
    }

    active: boolean;
    classificationId: string;
    classificationTitle: string;
    classificationCaveats: string;
}
