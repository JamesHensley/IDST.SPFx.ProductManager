import * as React from 'react';
import { Label, Icon } from '@fluentui/react';
import { getFileTypeIconProps } from '@fluentui/react-file-type-icons';

import * as styles from '../ProductManager.module.scss';

import { AttachmentModel } from '../../../../models/AttachmentModel';

export interface IAttachmentComponentProps {
    AttachmentItems: Array<AttachmentModel>;
}

export class AttachmentComponent extends React.Component<IAttachmentComponentProps, {}> {
    private grid = `${styles.grid} ${styles.attachmentManager}`;
    private row = `${styles.gridRow} ${styles.attachmentItem} ${styles.bordered}`;

    public render(): React.ReactElement<IAttachmentComponentProps> {
        return (
            <div className={`${this.grid} ${styles.padTop3}`}>
                <Label>Attachments</Label>
                <div className={styles.gridRow}>
                    <Label className={styles.gridCol1} style={{ fontSize: '.9rem' }}></Label>
                    <Label className={styles.gridCol6} style={{ fontSize: '.9rem' }}>Title</Label>
                    <Label className={styles.gridCol5} style={{ fontSize: '.9rem' }}>Author</Label>
                </div>
                {(this.props.AttachmentItems || []).map(a => {
                    const docIcon = getFileTypeIconProps({
                        extension: (a.Url.split('.').reverse()[0]),
                        size: 16, imageFileType: 'png'
                    });
                    return (
                        <div key={a.Id} className={this.row} onClick={this.attachmentClicked.bind(this, a)}>
                            <div className={styles.gridCol1}>
                                <Icon {...docIcon}/>
                            </div>
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
