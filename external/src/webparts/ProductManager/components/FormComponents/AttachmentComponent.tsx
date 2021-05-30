import * as React from 'react';
import { Panel, PanelType, Separator, FocusTrapZone, Stack, DirectionalHint, IconButton, DefaultButton, ICommandBarItemProps } from '@fluentui/react';
import { Label } from '@fluentui/react';

import * as styles from '../ProductManager.module.scss';

import { AttachmentModel } from '../../../../models/AttachmentModel';

export interface IAttachmentComponentProps {
    AttachmentItems: Array<AttachmentModel>
}

export class AttachmentComponent extends React.Component<IAttachmentComponentProps, {}> {
    private grid = `${styles.grid} ${styles.attachmentManager}`;
    private row = `${styles.gridRow} ${styles.attachmentItem} ${styles.bordered}`;

    public render(): React.ReactElement<IAttachmentComponentProps> {
        return (
            <div className={this.grid}>
                <div>Attachment Component</div>
                {(this.props.AttachmentItems || []).map(a => {
                    return (
                        <div key={a.Id} className={this.row} onClick={this.attachmentClicked.bind(this, a)}>
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