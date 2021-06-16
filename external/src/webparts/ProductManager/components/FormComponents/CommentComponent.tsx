import { Label } from '@fluentui/react';
import * as React from 'react';
import { CommentsModel } from '../../../../models/CommentsModel';

import * as styles from '../ProductManager.module.scss';

export interface ICommentComponentProps {
    comments: Array<CommentsModel>;
}

export const CommentComponent: React.FunctionComponent<ICommentComponentProps> = (props) => {
    return (
        <div className={styles.grid}>
            <div className={styles.gridRow}>
                <div className={styles.gridCol12}>
                    <Label>Comments</Label>
                </div>
            </div>
            {
                props.comments.map(d => {
                    return (
                        <div className={styles.gridRow} key={d.commentGuid}>
                            <div className={styles.gridCol12}>{d.commentValue}</div>
                        </div>
                    );
                })
            }
        </div>
    );
};
