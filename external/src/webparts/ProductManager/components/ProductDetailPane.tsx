import * as React from 'react';
import { Panel, PanelType, Separator, Stack, DefaultButton, ICommandBarItemProps, Label, Dialog, TextField, DialogFooter } from '@fluentui/react';

import * as styles from './ProductManager.module.scss';

import { format } from 'date-fns';
import { ProductModel, ProductStatus } from '../../../models/ProductModel';
import { RecordService } from '../../../services/RecordService';

import { FormInputDate } from './FormComponents/FormInputDate';
import { FormInputText } from './FormComponents/FormInputText';
import { FormInputUrl } from './FormComponents/FormInputUrl';
import AppService, { ICmdBarListenerProps } from '../../../services/AppService';
import { TaskComponent } from './FormComponents/TaskComponent';
import { AttachmentComponent } from './FormComponents/AttachmentComponent';
import { TaskModel } from '../../../models/TaskModel';
import { MailService } from '../../../services/MailService';
import { FormInputDropDown } from './FormComponents/FormInputDropDown';
import { KeyValPair } from './FormComponents/IFormInputProps';
import { FormInputComboBox } from './FormComponents/FormInputComboBox';
import { FormInputDialog } from './FormComponents/FormInputDialog';
import { CommentsModel } from '../../../models/CommentsModel';
import { v4 as uuidv4 } from 'uuid';
import { CommentComponent } from './FormComponents/CommentComponent';
import { tr } from 'date-fns/locale';

export interface IProductDetailPaneProps {
    isVisible: boolean;
    isEditing: boolean;
    // currentProductId: string;
    currentProduct: ProductModel;
    /** used to notify the parent that the pane should be destroyed */
    paneCloseCallBack: () => void;
    /** used to notify the parent that the item was updated */
    // productUpdatedCallBack: (newPanelEditValue: boolean) => void;
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
        return (
            <Panel
                className={styles.productDetailPane}
                isLightDismiss={!this.state.isEditing}
                isHiddenOnDismiss={false}
                headerText={this.state.draftProduct ? `${this.state.draftProduct.title} [${this.state.draftProduct.status}]` : ''}
                isOpen={this.props.isVisible}
                onDismiss={this.closePane.bind(this)}
                closeButtonAriaLabel='Close'
                type={PanelType.medium}
            >
                { this.state.draftProduct &&
                <div className={styles.grid + ' ' + styles.formStyles}>
                    <div className={styles.gridRow}>
                        <div className={styles.gridCol12}>
                            <Stack horizontal tokens={{ childrenGap: 10 }}>
                                <DefaultButton onClick={this.showCommentDialog.bind(this)}>Add Comment</DefaultButton>
                                <DefaultButton onClick={this.toggleEditMode.bind(this)} disabled={this.state.isEditing}>Edit</DefaultButton>
                                {this.state.isEditing && <DefaultButton onClick={this.saveRFI.bind(this)} disabled={!this.state.isEditing}>Save</DefaultButton>}
                                {this.state.isEditing && <DefaultButton onClick={this.cancelRFIChanges.bind(this)} disabled={!this.state.isEditing}>Cancel</DefaultButton>}
                            </Stack>
                        </div>
                    </div>
                    <div className={styles.gridRow}>
                        <div className={styles.gridCol12}>
                            <FormInputText
                                labelValue={'Title'} editing={this.state.isEditing}
                                fieldValue={this.state.draftProduct.title}
                                fieldRef={'title'}
                                onUpdated={this.fieldUpdated.bind(this)}
                            />
                        </div>
                    </div>
                    <div className={styles.gridRow}>
                        <div className={styles.gridCol6}>
                            <FormInputComboBox
                                labelValue={'Customer'}
                                fieldValue={this.state.draftProduct.customer}
                                fieldRef={'customer'}
                                onUpdated={this.fieldUpdated.bind(this)}
                                editing={this.state.isEditing}
                            />
                        </div>
                        <div className={styles.gridCol6}>
                            <FormInputDropDown
                                labelValue={'Classification'}
                                fieldValue={this.state.draftProduct.classificationId}
                                fieldRef={'classificationId'}
                                onUpdated={this.fieldUpdated.bind(this)}
                                editing={this.state.isEditing}
                                options={AppService.AppSettings.classificationModels.map(d => { return { key: d.classificationId, value: d.classificationTitle } as KeyValPair; })}
                            />
                        </div>
                    </div>
                    <div className={styles.gridRow}>
                        <div className={styles.gridCol12}>
                            <FormInputText
                                labelValue={'Description'} editing={this.state.isEditing}
                                fieldValue={this.state.draftProduct.description} editLines={8}
                                fieldRef={'description'}
                                onUpdated={this.fieldUpdated.bind(this)}
                            />
                        </div>
                    </div>
                    <div className={styles.gridRow}>
                        <div className={styles.gridCol12}>
                            <FormInputUrl
                                labelValue={'Request URL'} editing={this.state.isEditing}
                                fieldValue={this.state.draftProduct.requestUrl}
                                fieldRef={'requestUrl'}
                                onUpdated={this.fieldUpdated.bind(this)}
                            />
                        </div>
                    </div>
                    <div className={styles.gridRow}>
                        <div className={styles.gridCol4}>
                            <FormInputDropDown
                                labelValue={'Product Type'}
                                fieldValue={this.state.draftProduct.productType}
                                fieldRef={'productType'}
                                onUpdated={this.fieldUpdated.bind(this)}
                                editing={this.state.isEditing}
                                options={AppService.AppSettings.productTypes.map(d => { return { key: d.typeId, value: d.typeName } as KeyValPair; })}
                            />
                        </div>
                        <div className={styles.gridCol4}>
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
                        </div>
                        <div className={styles.gridCol4}>
                            <FormInputDropDown
                                labelValue={'Event Type'}
                                fieldValue={this.state.draftProduct.eventType}
                                fieldRef={'eventType'}
                                onUpdated={this.fieldUpdated.bind(this)}
                                editing={this.state.isEditing}
                                options={AppService.AppSettings.eventTypes.map(d => { return { key: d.eventTypeId, value: d.eventTitle } as KeyValPair; })}
                            />
                        </div>
                    </div>
                    <div className={styles.gridRow}>
                        <div className={styles.gridCol4}>
                            <FormInputDate
                                labelValue={'Start Date'} editing={this.state.isEditing}
                                fieldValue={this.state.draftProduct.requestDate}
                                fieldRef={'requestDate'}
                                onUpdated={this.fieldUpdated.bind(this)}
                            />
                        </div>
                        <div className={styles.gridCol4}>
                            <FormInputDate
                                labelValue={'Suspense Date'} editing={this.state.isEditing}
                                fieldValue={this.state.draftProduct.returnDateExpected}
                                fieldRef={'returnDateExpected'}
                                onUpdated={this.fieldUpdated.bind(this)}
                            />
                        </div>
                        <div className={styles.gridCol4}>
                            <FormInputDate
                                labelValue={'Event Date'} editing={this.state.isEditing}
                                fieldValue={this.state.draftProduct.eventDate}
                                fieldRef={'eventDate'}
                                onUpdated={this.fieldUpdated.bind(this)}
                            />
                        </div>
                    </div>
                    <Separator />
                    <AttachmentComponent
                        AttachmentItems={this.state.draftProduct.attachedDocuments}
                        AddAttachmentCallback={this.addAttachment.bind(this)}
                        canAddAttachments={this.state.draftProduct.guid ? true : false}
                    />
                    <Separator />
                    <TaskComponent
                        TaskItems={this.state.draftProduct.tasks}
                        onTaskAdded={this.taskAdded.bind(this)}
                        onUpdated={this.fieldUpdated.bind(this)}
                        isEditing={this.state.isEditing}
                    />
                    <Separator />
                    <CommentComponent comments={this.state.draftProduct.comments || []} />
                </div>
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

        // We're seperating these out in case someone adds a comment to a new product and then decides
        // to cancel the action.  If we processed the comment before the initial save, the product would
        // get saved
        if (this.state.isEditing) {
            const newDraft = new ProductModel();
            Object.assign(newDraft, this.state.draftProduct);
            newDraft.comments.push(comment);
            this.setState({ draftProduct: newDraft, showCommentDialog: false });
        } else {
            RecordService.SaveProduct(this.state.draftProduct, false)
            .then(result => this.setState({ draftProduct: result.productModel, showCommentDialog: false }))
            .catch(e => console.log('Update failed for: ', this.state.draftProduct));
        }
    }

    private saveRFI(): void {
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

    private taskAdded(newTask: TaskModel): void {
        const newDraft = new ProductModel();
        Object.assign(newDraft, this.state.draftProduct);
        newDraft.tasks = [].concat.apply(this.state.draftProduct.tasks, [newTask]);
        this.setState({ draftProduct: newDraft });
    }

    private addAttachment(files: FileList): void {
        if (this.state.draftProduct.guid) {
            RecordService.AddAttachmentsForItem(this.state.draftProduct, files)
            .then(results => console.log('Uploaded: ', results));
        }
    }
}
