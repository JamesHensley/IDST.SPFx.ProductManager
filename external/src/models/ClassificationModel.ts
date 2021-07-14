export class ClassificationModel {
    public constructor(init?: Partial<ClassificationModel>) {
        Object.assign(this, init);
    }

    classificationId: string;
    classificationTitle: string;
    classificationCaveats: string;
}
