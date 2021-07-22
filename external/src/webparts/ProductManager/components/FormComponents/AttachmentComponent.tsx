import * as React from 'react';
import { Label, Icon, DefaultButton, Stack } from '@fluentui/react';
import { getFileTypeIconProps } from '@fluentui/react-file-type-icons';

import * as styles from '../ProductManager.module.scss';

import { AttachmentModel } from '../../../../models/AttachmentModel';
import RecordService from '../../../../services/RecordService';
import { ProductModel } from '../../../../models/ProductModel';

export interface IAttachmentComponentProps {
    canAddAttachments: boolean;
    readOnly: boolean;
    parentModel: ProductModel;
}

export interface IAttachmentComponentState {
    attachments: Array<AttachmentModel>;
}

export class AttachmentComponent extends React.Component<IAttachmentComponentProps, IAttachmentComponentState> {
    constructor(props: IAttachmentComponentProps) {
        super(props);
        this.state = { attachments: [] };
    }

    public render(): React.ReactElement<IAttachmentComponentProps> {
        const stackItemStyles = { root: { display: 'flex', minWidth: '50%', cursor: 'pointer' } };
        return (
            <Stack>
                <Label>
                    Attachments
                    { !this.props.canAddAttachments && !this.props.readOnly &&
                        <span style={{ fontSize: '0.7rem', fontWeight: 'normal', paddingLeft: '10px' }}>Attachments can only be added after the first save</span>
                    }
                </Label>
                { this.props.canAddAttachments && !this.props.readOnly &&
                    <Stack horizontal>
                        <Stack.Item grow styles={{ root: { display: 'flex' } }}>
                            <input id='attachment' type='file' multiple accept='.*' key={new Date().getTime()} />
                        </Stack.Item>
                        <Stack.Item styles={{ root: { display: 'flex' } }}>
                            <DefaultButton onClick={this.uploadFiles.bind(this)}>Upload</DefaultButton>
                        </Stack.Item>
                    </Stack>
                }
                <Stack horizontal>
                    <Stack.Item grow styles={stackItemStyles}><Label style={{ fontSize: '.9rem', paddingLeft: '25px' }}>Title</Label></Stack.Item>
                    <Stack.Item grow styles={stackItemStyles}><Label style={{ fontSize: '.9rem' }}>Author</Label></Stack.Item>
                </Stack>
                <Stack.Item styles={{ root: { paddingLeft: '20px' } }}>
                    {(this.state.attachments || []).map(a => {
                        const docIcon = getFileTypeIconProps({ extension: (a.Url.split('.').reverse()[0]), size: 16, imageFileType: 'png' });
                        return (
                            <Stack horizontal key={a.Id} onClick={this.attachmentClicked.bind(this, a)} className={styles.clickableItem}>
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

    public componentDidMount(): void {
        if (this.props.parentModel.spGuid) {
            RecordService.GetAttachmentsForItem(this.props.parentModel.spGuid)
            .then(d => this.setState({ attachments: d }))
            .catch(e => Promise.reject(e));
        }
    }

    private attachmentClicked(attachment: AttachmentModel): void {
        window.open(attachment.EditUrl, '_blank');
    }

    private uploadFiles(): void {
        const files = (document.querySelector('#attachment') as HTMLInputElement).files;
        if (files.length > 0) {
            RecordService.AddAttachmentsForItem(this.props.parentModel, files)
            .then(results => {
                return RecordService.GetAttachmentsForItem(this.props.parentModel.guid)
                .then(allDocs => this.setState({ attachments: allDocs }))
                .catch(e => Promise.reject(e));
            })
            .catch(e => Promise.reject(e));
        }
    }
}
