import { v4 as uuidv4 } from 'uuid';
export class ClassificationModel {
    public constructor(init?: Partial<ClassificationModel>) {
        this.classificationId = uuidv4();
        Object.assign(this, init);
    }

    active: boolean;
    classificationId: string;
    classificationTitle: string;
    classificationCaveats: string;
}
