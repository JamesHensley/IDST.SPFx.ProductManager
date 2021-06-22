import * as React from 'react';
import { Label, Icon, DefaultButton, Stack } from '@fluentui/react';
import { getFileTypeIconProps } from '@fluentui/react-file-type-icons';

import * as styles from '../ProductManager.module.scss';

import { AttachmentModel } from '../../../../models/AttachmentModel';

export interface IAttachmentComponentProps {
    canAddAttachments: boolean;
    readOnly: boolean;
    AttachmentItems: Array<AttachmentModel>;
    AddAttachmentCallback: (files: FileList) => Promise<void>;
}

export interface IAttachmentComponentState {
    lastUpdate: number;
}

export class AttachmentComponent extends React.Component<IAttachmentComponentProps, IAttachmentComponentState> {
    private grid = `${styles.grid} ${styles.attachmentManager}`;
    private row = `${styles.gridRow} ${styles.attachmentItem} ${styles.bordered}`;

    public render(): React.ReactElement<IAttachmentComponentProps> {
        const stackItemStyles = { root: { display: 'flex', minWidth: '50%', cursor: 'pointer' } };
        return (
            <Stack key={new Date().getTime()}>
                <Label>
                    Attachments
                    { !this.props.canAddAttachments && !this.props.readOnly &&
                        <span style={{ fontSize: '0.7rem', fontWeight: 'normal', paddingLeft: '10px' }}>Attachments can only be added after the first save</span>
                    }
                </Label>
                { this.props.canAddAttachments && !this.props.readOnly &&
                    <Stack horizontal>
                        <Stack.Item grow styles={{ root: { display: 'flex' } }}><input id='attachment' type='file' multiple accept=".*" /></Stack.Item>
                        <Stack.Item styles={{ root: { display: 'flex' } }}><DefaultButton onClick={this.uploadFiles.bind(this)}>Upload</DefaultButton></Stack.Item>
                    </Stack>
                }
                <Stack horizontal>
                    <Stack.Item grow styles={stackItemStyles}><Label style={{ fontSize: '.9rem', paddingLeft: '25px' }}>Title</Label></Stack.Item>
                    <Stack.Item grow styles={stackItemStyles}><Label style={{ fontSize: '.9rem' }}>Author</Label></Stack.Item>
                </Stack>
                <Stack.Item styles={{ root: { paddingLeft: '20px'}}}>
                    {(this.props.AttachmentItems || []).map(a => {
                        const docIcon = getFileTypeIconProps({ extension: (a.Url.split('.').reverse()[0]), size: 16, imageFileType: 'png' });
                        return (
                            <Stack horizontal key={a.Id} onClick={this.attachmentClicked.bind(this, a)} className={styles.attachmentItem}>
                                <Stack.Item grow styles={stackItemStyles}>
                                    <span style={{ minWidth: '25px' }}><Icon {...docIcon}/></span>
                                    {a.Title}
                                </Stack.Item>
                                <Stack.Item grow styles={stackItemStyles}>{a.Author}</Stack.Item>
                            </Stack>
                        );
                    })}
                </Stack.Item>
            </Stack>
        );
    }

    private attachmentClicked(attachment: AttachmentModel): void {
        console.log('Attachment Clicked: ', attachment);
        
    }

    private uploadFiles(): void {
        const files = (document.querySelector('#attachment') as HTMLInputElement).files;
        if (files.length > 0) {
            this.props.AddAttachmentCallback(files)
            .then(() => {
                console.log('Uploaded: ', files);
                this.setState({ lastUpdate: new Date().getTime() })
            })
            .catch(e => Promise.reject(e));
        }
    }
}
