export class CommentsModel {
    public constructor(init?: Partial<CommentsModel>) {
        Object.assign(this, init);
    }

    commentGuid: string;
    commentAuthor: string;
    commentDate: string;
    commentValue: string;
}
