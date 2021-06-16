import * as React from 'react';
import { Label, Icon, DefaultButton } from '@fluentui/react';
import { getFileTypeIconProps } from '@fluentui/react-file-type-icons';

import * as styles from '../ProductManager.module.scss';

import { AttachmentModel } from '../../../../models/AttachmentModel';
import { RecordService } from '../../../../services/RecordService';
import { ProductModel } from '../../../../models/ProductModel';

export interface IAttachmentComponentProps {
    Product: ProductModel;
    AttachmentItems: Array<AttachmentModel>;
}

export class AttachmentComponent extends React.Component<IAttachmentComponentProps, {}> {
    private grid = `${styles.grid} ${styles.attachmentManager}`;
    private row = `${styles.gridRow} ${styles.attachmentItem} ${styles.bordered}`;

    public render(): React.ReactElement<IAttachmentComponentProps> {
        return (
            <div className={`${this.grid} ${styles.padTop3}`}>
                <div className={styles.gridRow}><Label className={styles.gridCol12}>Attachments</Label></div>
                <div className={styles.gridRow}>
                    <div className={styles.gridCol12}>
                        <input id='attachment' type='file' multiple accept=".*" />
                        <DefaultButton onClick={this.uploadFiles.bind(this)}>Upload</DefaultButton>
                    </div>
                </div>
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

    private uploadFiles(): void {
        const files = (document.querySelector('#attachment') as HTMLInputElement).files;
        if (files.length > 0 && this.props.Product.guid) {
            RecordService.AddAttachmentsForItem(this.props.Product.guid, files)
            .then(results => console.log('Uploaded: ', results));
        }
    }
}
