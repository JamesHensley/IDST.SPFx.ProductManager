import { v4 as uuidv4 } from 'uuid';
export class CommentsModel {
    public constructor(init?: Partial<CommentsModel>) {
        this.commentGuid = uuidv4();
        Object.assign(this, init);
    }

    commentGuid: string;
    commentAuthor: string;
    commentDate: string;
    commentValue: string;
}
