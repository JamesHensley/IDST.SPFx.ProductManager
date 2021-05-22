import * as React from 'react';
import * as styles from './ProductManager.module.scss';

import { AttachmentModel } from '../../../models/AttachmentModel';

export interface IAttachmentsMgrProps {
    currentAttachments: Array<AttachmentModel>;
}

export class AttachmentsMgr extends React.Component<IAttachmentsMgrProps, {}> {
    public render(): React.ReactElement<IAttachmentsMgrProps> {
        const grid = `${styles.grid} ${styles.attachmentManager}`;
        const row = `${styles.gridRow} ${styles.attachmentItem} ${styles.bordered}`;

        return (
            <div className={grid}>
                {this.props.currentAttachments && this.props.currentAttachments.map(a => {
                    return (
                        <div key={a.Id} className={row} onClick={this.attachmentClicked.bind(this, a)}>
                            <div className={styles.gridCol1}>.</div>
                            <div className={styles.gridCol6}>{a.Title}</div>
                            <div className={styles.gridCol5}>{a.Author}</div>
                        </div>
                    );
                })}
            </div>
        );
    }

    private attachmentClicked(attachment: AttachmentModel): void {
        console.log('Attachment Clicked: ', attachment);
    }
}
