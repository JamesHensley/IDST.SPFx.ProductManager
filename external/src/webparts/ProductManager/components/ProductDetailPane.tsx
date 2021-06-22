import * as React from 'react';
import { Panel, PanelType, Separator, Stack, DefaultButton, ICommandBarItemProps, Label, Dialog, TextField, DialogFooter, IStackItemStyles, IPanelHeaderRenderer } from '@fluentui/react';

import * as styles from './ProductManager.module.scss';
import { FontSizes } from '@fluentui/theme';

import { ProductModel, ProductStatus } from '../../../models/ProductModel';
import { RecordService } from '../../../services/RecordService';

import { FormInputText } from './FormComponents/FormInputText';
import { FormInputUrl } from './FormComponents/FormInputUrl';
import AppService from '../../../services/AppService';
import { TaskComponent } from './FormComponents/TaskComponent';
import { AttachmentComponent } from './FormComponents/AttachmentComponent';
import { TaskModel } from '../../../models/TaskModel';
import { FormInputDropDown } from './FormComponents/FormInputDropDown';
import { KeyValPair } from './FormComponents/IFormInputProps';
import { FormInputComboBox } from './FormComponents/FormInputComboBox';
import { FormInputDialog } from './FormComponents/FormInputDialog';
import { CommentsModel } from '../../../models/CommentsModel';
import { v4 as uuidv4 } from 'uuid';
import { CommentComponent } from './FormComponents/CommentComponent';
import { NotificationService, NotificationType } from '../../../services/NotificationService';

export interface IProductDetailPaneProps {
    isVisible: boolean;
    isEditing: boolean;
    // currentProductId: string;
    currentProduct: ProductModel;
    /** used to notify the parent that the pane should be destroyed */
    paneCloseCallBack: () => void;
    /** used to notify the parent that the item was updated */
    // productUpdatedCallBack: (newPanelEditValue: boolean) => void;
    readOnly: boolean;
}

export interface IProductDetailPaneState {
    isEditing: boolean;
    draftProduct: ProductModel;
    showCommentDialog: boolean;
}

// This needs a lot of work... especially the editing portion
export default class ProductDetailPane extends React.Component<IProductDetailPaneProps, IProductDetailPaneState> {
    constructor(props: IProductDetailPaneProps) {
        super(props);
        const draftProduct: ProductModel = new ProductModel();
        Object.assign(draftProduct, this.props.currentProduct);

        this.state = {
            isEditing: this.props.isEditing,
            draftProduct: draftProduct,
            showCommentDialog: false
        };
    }

    public render(): React.ReactElement<IProductDetailPaneProps> {
        const stackItemStyles: IStackItemStyles = { root: { display: 'flex' } };
        return (
            <Panel
                className={styles.productDetailPane}
                isLightDismiss={!this.state.isEditing}
                isHiddenOnDismiss={false}
                isOpen={this.props.isVisible}
                onDismiss={this.closePane.bind(this)}
                closeButtonAriaLabel='Close'
                type={PanelType.medium}
                onRenderHeader={this.getPaneHeader.bind(this)}
            >
                <div id='panelHeader' />
                { this.state.draftProduct &&
                    <Stack>
                        <FormInputText
                            labelValue={'Title'} editing={this.state.isEditing}
                            fieldValue={this.state.draftProduct.title}
                            fieldRef={'title'}
                            onUpdated={this.fieldUpdated.bind(this)}
                        />
                        <Stack horizontal>
                            <Stack.Item grow styles={stackItemStyles}>
                                <FormInputComboBox
                                    labelValue={'Customer'}
                                    fieldValue={this.state.draftProduct.customer}
                                    fieldRef={'customer'}
                                    onUpdated={this.fieldUpdated.bind(this)}
                                    editing={this.state.isEditing}
                                />
                            </Stack.Item>
                            <Stack.Item grow styles={stackItemStyles}>
                                <FormInputDropDown
                                    labelValue={'Classification'}
                                    fieldValue={this.state.draftProduct.classificationId}
                                    fieldRef={'classificationId'}
                                    onUpdated={this.fieldUpdated.bind(this)}
                                    editing={this.state.isEditing}
                                    options={AppService.AppSettings.classificationModels.map(d => { return { key: d.classificationId, value: d.classificationTitle } as KeyValPair; })}
                                />
                            </Stack.Item>
                        </Stack>
                        <FormInputText
                            labelValue={'Description'} editing={this.state.isEditing}
                            fieldValue={this.state.draftProduct.description} editLines={8}
                            fieldRef={'description'}
                            onUpdated={this.fieldUpdated.bind(this)}
                        />
                        <FormInputUrl
                            labelValue={'Request URL'} editing={this.state.isEditing}
                            fieldValue={this.state.draftProduct.requestUrl}
                            fieldRef={'requestUrl'}
                            onUpdated={this.fieldUpdated.bind(this)}
                        />
                        <Stack horizontal>
                        <Stack.Item grow styles={stackItemStyles}>
                                <FormInputDropDown
                                    labelValue={'Product Type'}
                                    fieldValue={this.state.draftProduct.productType}
                                    fieldRef={'productType'}
                                    onUpdated={this.fieldUpdated.bind(this)}
                                    editing={this.state.isEditing}
                                    options={AppService.AppSettings.productTypes.map(d => { return { key: d.typeId, value: d.typeName } as KeyValPair; })}
                                />
                            </Stack.Item>
                            <Stack.Item grow styles={stackItemStyles}>
                                <FormInputDropDown
                                    labelValue={'Product Status'}
                                    fieldValue={this.state.draftProduct.status}
                                    fieldRef={'status'}
                                    onUpdated={this.fieldUpdated.bind(this)}
                                    editing={this.state.isEditing}
                                    options={[
                                        { key: ProductStatus.open, value: 'Open' } as KeyValPair,
                                        { key: ProductStatus.closed, value: 'Closed' } as KeyValPair,
                                        { key: ProductStatus.canceled, value: 'Canceled' } as KeyValPair
                                    ]}
                                />
                            </Stack.Item>
                            <Stack.Item grow styles={stackItemStyles}>
                                <FormInputDropDown
                                    labelValue={'Event Type'}
                                    fieldValue={this.state.draftProduct.eventType}
                                    fieldRef={'eventType'}
                                    onUpdated={this.fieldUpdated.bind(this)}
                                    editing={this.state.isEditing}
                                    options={AppService.AppSettings.eventTypes.map(d => { return { key: d.eventTypeId, value: d.eventTitle } as KeyValPair; })}
                                />
                            </Stack.Item>
                        </Stack>
                        <Separator />
                        <AttachmentComponent
                            AttachmentItems={this.state.draftProduct.attachedDocuments}
                            AddAttachmentCallback={this.addAttachment.bind(this)}
                            canAddAttachments={this.state.draftProduct.guid ? true : false}
                            readOnly={this.props.readOnly}
                        />
                        <Separator />
                        <TaskComponent
                            TaskItems={this.state.draftProduct.tasks}
                            onUpdated={this.tasksUpdated.bind(this)}
                            isEditing={this.state.isEditing}
                        />
                        <Separator />
                        <CommentComponent comments={this.state.draftProduct.comments || []} />
                    </Stack>
                }
                { this.state.showCommentDialog &&
                    <FormInputDialog
                        saveCallBack={this.updateComment.bind(this)}
                        cancelCallBack={this.cancelAddComment.bind(this)}
                        editMode={true}
                        titleStr={'New Comment'}
                        defaultValue='New Comment Here'
                    />
                }
            </Panel>
        );
    }

    private closePane(): void {
        this.props.paneCloseCallBack();
    }

    private toggleEditMode(): void {
        this.setState({ isEditing: !this.state.isEditing });
    }

    private showCommentDialog(): void { this.setState({ showCommentDialog: true }); }

    private cancelAddComment(): void { this.setState({ showCommentDialog: false }); }

    private updateComment(commentStr: string): void {
        const comment: CommentsModel = {
            commentGuid: uuidv4(),
            commentAuthor: AppService.CurrentUser,
            commentDate: new Date().toJSON(),
            commentValue: commentStr
        };
        const newDraft = new ProductModel();
        Object.assign(newDraft, this.state.draftProduct);
        newDraft.comments.push(comment);

        // We're seperating these out in case someone adds a comment to a new product and then decides
        // to cancel the action.  If we processed the comment before the initial save, the product would
        // get saved
        if (this.state.isEditing) {
            this.setState({ draftProduct: newDraft, showCommentDialog: false });
        } else {
            RecordService.SaveProduct(newDraft, false)
            .then(result => {
                NotificationService.Notify(NotificationType.AttachAdd, newDraft.title);
                this.setState({ draftProduct: result.productModel, showCommentDialog: false });
            })
            .catch(e => console.log('Update failed for: ', this.state.draftProduct));
        }
    }

    private saveRFI(): void {
        console.log('Saving record: ', this.state.draftProduct);
        // We let the parent component close this pane.
        RecordService.SaveProduct(this.state.draftProduct, true)
        .catch(e => console.log('Update failed for: ', this.state.draftProduct));
    }

    private cancelRFIChanges(): void {
        if (!this.state.draftProduct.guid) {
            // Canceled creating a new product
            this.props.paneCloseCallBack();
        } else {
            // Canceled updating an existing product
            this.setState({ isEditing: false, draftProduct: this.props.currentProduct });
        }
    }

    private fieldUpdated(newVal: any, fieldRef: string): void {
        const newDraft = new ProductModel();
        Object.assign(newDraft, this.state.draftProduct);
        newDraft[fieldRef] = newVal;
        this.setState({ draftProduct: newDraft });
    }

    private tasksUpdated(newVal: Array<TaskModel>) {
        const newDraft = new ProductModel();
        Object.assign(newDraft, this.state.draftProduct);
        newDraft.tasks = newVal;
        this.setState({ draftProduct: newDraft });
        console.log('Updated Tasks for: ', newDraft);
    }

    /** Called when a user clicks the ADD TASK button from this PANE */
    private taskAdded(newTask: TaskModel): void {
        const newDraft = new ProductModel();
        Object.assign(newDraft, this.state.draftProduct);
        newDraft.tasks = [].concat.apply(this.state.draftProduct.tasks, [newTask]);
        this.setState({ draftProduct: newDraft });
    }

    /**  */
    private async addAttachment(files: FileList): Promise<void> {
        if (this.state.draftProduct.guid) {
            return RecordService.AddAttachmentsForItem(this.state.draftProduct, files)
            .then(results => {
                return RecordService.GetAttachmentsForItem(this.state.draftProduct.guid)
                .then(allDocs => {
                    const draftProduct: ProductModel = new ProductModel();
                    Object.assign(draftProduct, this.props.currentProduct);
                    draftProduct.attachedDocuments = allDocs;
                    this.setState({ draftProduct: draftProduct });
    
                    NotificationService.Notify(NotificationType.AttachAdd, this.state.draftProduct.title, results.map(d => d.Title).join(','));
                    return Promise.resolve()
                })
                .catch(e => Promise.reject(e));
            })
            .catch(e => Promise.reject(e));
        }
        else {
            return Promise.reject('No Files Selected')
        }
    }

    private getPaneHeader(props: IPanelHeaderRenderer, renderer: IPanelHeaderRenderer): JSX.Element {
        // console.log('getPaneHeader: ', arguments);
        return (<div className={styles.panelHead}>
            <Stack grow styles={{ root: { display: 'flex' }}}>
                <Label style={{ fontSize: '1.5rem' }}>
                    {this.state.draftProduct ? `${this.state.draftProduct.title} [${this.state.draftProduct.status}]` : ''}
                </Label>
                {!this.props.readOnly &&
                <Stack horizontal>
                    <Stack.Item grow>
                        <Stack horizontal tokens={{ childrenGap: 10 }}>
                            <DefaultButton onClick={this.toggleEditMode.bind(this)} disabled={this.state.isEditing}>Edit</DefaultButton>
                            {this.state.isEditing && <DefaultButton onClick={this.saveRFI.bind(this)} disabled={!this.state.isEditing}>Save</DefaultButton>}
                            {this.state.isEditing && <DefaultButton onClick={this.cancelRFIChanges.bind(this)} disabled={!this.state.isEditing}>Cancel</DefaultButton>}
                        </Stack>
                    </Stack.Item>
                    <Stack.Item>
                        <DefaultButton onClick={this.showCommentDialog.bind(this)}>Add Comment</DefaultButton>
                    </Stack.Item>
                </Stack>
                }
            </Stack>
        </div>);
    }
}
