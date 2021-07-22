import * as React from 'react';
import * as styles from '../ProductManager.module.scss';

import AppService from '../../../../services/AppService';
import RecordService from '../../../../services/RecordService';
import { NotificationService, NotificationType } from '../../../../services/NotificationService';
import { v4 as uuidv4 } from 'uuid';

import { Panel, PanelType, Separator, Stack, DefaultButton, Label, IStackItemStyles, IPanelHeaderRenderer } from '@fluentui/react';
import { FormInputText } from '../FormComponents/FormInputText';
import { FormInputUrl } from '../FormComponents/FormInputUrl';
import { FormInputDate } from '../FormComponents/FormInputDate';
import { FormInputDropDown, KeyValPair } from '../FormComponents/FormInputDropDown';
import { FormInputComboBox } from '../FormComponents/FormInputComboBox';
import { FormInputDialog } from '../FormComponents/FormInputDialog';
import { CommentComponent } from '../FormComponents/CommentComponent';
import { TaskComponent } from '../FormComponents/TaskComponent';
import { AttachmentComponent } from '../FormComponents/AttachmentComponent';

import { ProductModel, ProductStatus } from '../../../../models/ProductModel';
import { TaskModel } from '../../../../models/TaskModel';
import { CommentsModel } from '../../../../models/CommentsModel';
import { debug } from 'interactjs';
import { addDays } from 'date-fns';

export interface IProductDetailPaneProps {
    currentProduct: ProductModel;
    isVisible: boolean;
    isEditing: boolean;
    readOnly: boolean;
    saveProduct: (newProd: ProductModel, keepPaneOpen?: boolean) => void;
    closePane: () => void;
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
        this.state = {
            isEditing: this.props.isEditing,
            draftProduct: Object.assign(new ProductModel(), props.currentProduct),
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
                onDismiss={this.closeProduct.bind(this)}
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
                        <Stack horizontal styles={{ root: { display: 'flex' } }} tokens={{ childrenGap: 10 }}>
                            <Stack.Item grow={1}>
                                <FormInputComboBox
                                    labelValue={'Customer'}
                                    fieldValue={this.state.draftProduct.customer}
                                    fieldRef={'customer'}
                                    onUpdated={this.fieldUpdated.bind(this)}
                                    editing={this.state.isEditing}
                                />
                            </Stack.Item>
                            <Stack.Item grow={1}>
                            <FormInputDropDown
                                    labelValue={'PIR'}
                                    fieldValue={this.state.draftProduct.categoryId}
                                    fieldRef={'categoryId'}
                                    onUpdated={this.fieldUpdated.bind(this)}
                                    editing={this.state.isEditing}
                                    options={AppService.AppSettings.categories.map(d => { return { key: d.categoryId, value: d.categoryText, selected: d.categoryId === this.state.draftProduct.categoryId } as KeyValPair; })}
                                    allowNull={true}
                                    disabledKeys={[]}
                                />
                            </Stack.Item>
                            <Stack.Item grow={1}>
                                <FormInputDropDown
                                    labelValue={'Classification'}
                                    fieldValue={this.state.draftProduct.classificationId}
                                    fieldRef={'classificationId'}
                                    onUpdated={this.fieldUpdated.bind(this)}
                                    editing={this.state.isEditing}
                                    options={AppService.AppSettings.classificationModels.map(d => { return { key: d.classificationId, value: d.classificationTitle, selected: d.classificationId === this.state.draftProduct.classificationId } as KeyValPair; })}
                                    allowNull={true}
                                    disabledKeys={[]}
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
                        <Stack horizontal styles={{ root: { display: 'flex' } }} tokens={{ childrenGap: 10 }}>
                            <Stack.Item grow styles={stackItemStyles}>
                                <FormInputDropDown
                                    labelValue={'Product Type'}
                                    fieldValue={this.state.draftProduct.productType}
                                    fieldRef={'productType'}
                                    onUpdated={this.fieldUpdated.bind(this)}
                                    editing={this.state.isEditing}
                                    options={AppService.AppSettings.productTypes.map(d => { return { key: d.typeId, value: d.typeName, selected: d.typeId === this.state.draftProduct.productType } as KeyValPair; })}
                                    allowNull={true}
                                    disabledKeys={AppService.AppSettings.productTypes.filter(f => !f.active).map(d => d.typeId)}
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
                                        { key: ProductStatus.open, value: 'Open', selected: this.state.draftProduct.status === ProductStatus.open } as KeyValPair,
                                        { key: ProductStatus.closed, value: 'Closed', selected: this.state.draftProduct.status === ProductStatus.closed } as KeyValPair,
                                        { key: ProductStatus.canceled, value: 'Canceled', selected: this.state.draftProduct.status === ProductStatus.canceled } as KeyValPair
                                    ]}
                                    allowNull={true}
                                    disabledKeys={[]}
                                />
                            </Stack.Item>
                        </Stack>
                        <Stack horizontal styles={{ root: { display: 'flex' } }} tokens={{ childrenGap: 10 }}>
                            <Stack.Item grow styles={stackItemStyles}>
                                <FormInputDropDown
                                    labelValue={'Event Type'}
                                    fieldValue={this.state.draftProduct.eventType}
                                    fieldRef={'eventType'}
                                    onUpdated={this.fieldUpdated.bind(this)}
                                    editing={this.state.isEditing}
                                    options={AppService.AppSettings.eventTypes.map(d => { return { key: d.eventTypeId, value: d.eventTitle, selected: d.eventTypeId === this.state.draftProduct.eventType } as KeyValPair; })}
                                    allowNull={true}
                                    disabledKeys={AppService.AppSettings.eventTypes.filter(f => !f.active).map(d => d.eventTypeId)}
                                />
                            </Stack.Item>
                            {this.state.draftProduct.eventType &&
                                <>
                                    <Stack.Item grow styles={stackItemStyles}>
                                        <FormInputDate
                                            key={new Date().getTime()}
                                            labelValue={'Event Start'}
                                            fieldValue={(this.state.draftProduct.eventDateStart || new Date()).toJSON()}
                                            fieldRef={'eventDateStart'}
                                            onUpdated={this.dateFieldUpdated.bind(this)}
                                            editing={this.state.isEditing}
                                        />
                                    </Stack.Item>
                                    <Stack.Item grow styles={stackItemStyles}>
                                        <FormInputDate
                                            key={new Date().getTime()}
                                            labelValue={'Event End'}
                                            fieldValue={(this.state.draftProduct.eventDateEnd || new Date()).toJSON()}
                                            fieldRef={'eventDateEnd'}
                                            onUpdated={this.dateFieldUpdated.bind(this)}
                                            editing={this.state.isEditing}
                                        />
                                    </Stack.Item>
                                </>
                            }
                        </Stack>
                        <Separator />
                        <TaskComponent
                            TaskItems={this.state.draftProduct.tasks}
                            onUpdated={this.tasksUpdated.bind(this)}
                            isEditing={this.state.isEditing}
                        />
                        <Separator />
                        <AttachmentComponent
                            canAddAttachments={this.state.draftProduct.spGuid ? true : false}
                            readOnly={this.props.readOnly}
                            parentModel={this.state.draftProduct}
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

    private toggleEditMode(): void {
        this.setState({ isEditing: !this.state.isEditing });
    }

    private showCommentDialog(): void { this.setState({ showCommentDialog: true }); }
    private cancelAddComment(): void { this.setState({ showCommentDialog: false }); }
    private updateComment(commentStr: string): void {
        const newDraft = Object.assign(new ProductModel(), this.state.draftProduct);
        newDraft.comments.push(new CommentsModel({
            commentGuid: uuidv4(),
            commentAuthor: AppService.CurrentUser,
            commentDate: new Date().toJSON(),
            commentValue: commentStr
        }));

        this.setState({ draftProduct: newDraft, showCommentDialog: false });
        if (!this.state.isEditing) {
            this.props.saveProduct(newDraft, true);
        }
    }

    private saveProduct(): void {
       this.props.saveProduct(this.state.draftProduct);
    }

    private closeProduct(): void {
        this.props.closePane();
    }

    private fieldUpdated(newVal: any, fieldRef: string): void {
        const newDraft = new ProductModel();
        Object.assign(newDraft, this.state.draftProduct);
        newDraft[fieldRef] = newVal;

        if (fieldRef === 'eventType') { this.handleEventType(newDraft, newVal); }
        this.setState({ draftProduct: newDraft });
    }

    private handleEventType(draft: ProductModel, newVal: any): void {
        if (newVal) {
            draft.eventDateStart = addDays(new Date(Math.max(...(draft.tasks || []).map(d => new Date(d.taskSuspense).getTime()) || [new Date().getTime()])), 2);
            draft.eventDateEnd = addDays(draft.eventDateStart, AppService.AppSettings.eventTypes.reduce((t,n) => n.eventTypeId === newVal ? n.defaultEventLength : t, 2));
        } else {
            draft.eventDateStart = null;
            draft.eventDateEnd = null;
        }
    }

    private dateFieldUpdated(newVal: any, fieldRef: string): void {
        const newDraft = new ProductModel();
        Object.assign(newDraft, this.state.draftProduct);
        newDraft[fieldRef] = new Date(newVal);
        this.setState({ draftProduct: newDraft });
    }

    private tasksUpdated(newVal: Array<TaskModel>): void {
        const newDraft = new ProductModel();
        Object.assign(newDraft, this.state.draftProduct);
        newDraft.tasks = newVal;
        this.setState({ draftProduct: newDraft });
    }

    /** Called when a user clicks the ADD TASK button from this PANE */
    private taskAdded(newTask: TaskModel): void {
        const newDraft = new ProductModel();
        Object.assign(newDraft, this.state.draftProduct);
        newDraft.tasks = [].concat.apply(this.state.draftProduct.tasks, [newTask]);
        this.setState({ draftProduct: newDraft });
    }

    /** Returns a header for the detail pane with or without edit/save buttons */
    private getPaneHeader(props: IPanelHeaderRenderer, renderer: IPanelHeaderRenderer): JSX.Element {
        return (
            <div className={styles.panelHead}>
                <Stack grow styles={{ root: { display: 'flex' } }}>
                    <Label style={{ fontSize: '1.5rem' }}>
                        {this.state.draftProduct ? `${this.state.draftProduct.title} [${this.state.draftProduct.status}]` : ''}
                    </Label>
                    {!this.props.readOnly &&
                    <Stack horizontal>
                        <Stack.Item grow>
                            <Stack horizontal>
                                <DefaultButton onClick={this.toggleEditMode.bind(this)} disabled={this.state.isEditing}>Edit</DefaultButton>
                                {this.state.isEditing && <DefaultButton onClick={this.saveProduct.bind(this)} disabled={!this.state.isEditing}>Save</DefaultButton>}
                                {this.state.isEditing && <DefaultButton onClick={this.closeProduct.bind(this)} disabled={!this.state.isEditing}>Cancel</DefaultButton>}
                            </Stack>
                        </Stack.Item>
                        <Stack.Item>
                            <DefaultButton onClick={this.showCommentDialog.bind(this)}>Add Comment</DefaultButton>
                        </Stack.Item>
                    </Stack>
                    }
                </Stack>
            </div>
        );
    }
}
