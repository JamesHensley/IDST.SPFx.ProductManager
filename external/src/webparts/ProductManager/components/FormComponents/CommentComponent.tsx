import { Label, Stack } from '@fluentui/react';
import * as React from 'react';
import { CommentsModel } from '../../../../models/CommentsModel';

export interface ICommentComponentProps {
    comments: Array<CommentsModel>;
}

export const CommentComponent: React.FunctionComponent<ICommentComponentProps> = (props) => {
    return (
        <Stack>
            <Label>Comments</Label>
            {
                props.comments.map(d => {
                    return (
                        <div key={d.commentGuid}>{d.commentAuthor} - {d.commentValue}</div>
                    );
                })
            }
        </Stack>
    );
};
