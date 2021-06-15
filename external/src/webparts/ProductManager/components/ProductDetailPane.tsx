import * as React from 'react';
import { Panel, PanelType, Separator, Stack, DefaultButton, ICommandBarItemProps, Label } from '@fluentui/react';

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

export interface IProductDetailPaneProps {
    isVisible: boolean;
    isEditing: boolean;
    currentProductId: string;
    currentProduct: ProductModel;
    /** used to notify the parent that the pane should be destroyed */
    paneCloseCallBack: () => void;
    /** used to notify the parent that the item was updated */
    productUpdatedCallBack: () => void;
}

export interface IProductDetailPaneState {
    isEditing: boolean;
    draftProduct: ProductModel;
    originalProduct: ProductModel;
}

// This needs a lot of work... especially the editing portion
export default class ProductDetailPane extends React.Component<IProductDetailPaneProps, IProductDetailPaneState> {
    constructor(props: IProductDetailPaneProps) {
        super(props);

        this.state = {
            isEditing: this.props.isEditing,
            draftProduct: this.props.currentProduct,
            originalProduct: this.props.currentProduct
        };
    }

    public render(): React.ReactElement<IProductDetailPaneProps> {
        console.log('ProductDetailPane.render: ', this.props, this.state);
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
                {
                    this.state.draftProduct &&
                    <div className={styles.grid + ' ' + styles.formStyles}>
                    <Stack horizontal tokens={{ childrenGap: 10 }}>
                        <DefaultButton onClick={this.toggleEditMode.bind(this)} disabled={this.state.isEditing}>Edit</DefaultButton>
                        {this.state.isEditing && <DefaultButton onClick={this.saveRFI.bind(this)} disabled={!this.state.isEditing}>Save</DefaultButton>}
                        {this.state.isEditing && <DefaultButton onClick={this.cancelRFIChanges.bind(this)} disabled={!this.state.isEditing}>Cancel</DefaultButton>}
                    </Stack>

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
                    <AttachmentComponent AttachmentItems={this.state.draftProduct.attachedDocuments} />
                    <Separator />
                    <TaskComponent
                        TaskItems={this.state.draftProduct.tasks}
                        onTaskAdded={this.taskAdded.bind(this)}
                        onUpdated={this.fieldUpdated.bind(this)}
                        isEditing={this.state.isEditing}
                    />
                </div>
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

    private saveRFI(): void {
        RecordService.UpdateProductByGuid(this.state.draftProduct.guid, this.state.draftProduct)
        .then(result => {
            const teamIds = (this.state.draftProduct.tasks || []).map(d => d.taskedTeamId);
            const teamEmails = (AppService.AppSettings.teams || []).reduce((t,n) => teamIds.indexOf(n.id) >= 0 ? t.concat(n.members.map(m => m.email)) : t, []);
            MailService.SendEmail('Update', teamEmails, 'A product has been ' + result.resultStr)
            .catch(e => Promise.reject(e));
            // this.setState({ isEditing: false, draftProduct: result.productModel, originalProduct: result.productModel });
            this.props.productUpdatedCallBack();
        })
        .catch(e => console.log('Update failed for: ', this.state.draftProduct));
    }

    private cancelRFIChanges(): void {
        if (this.state.draftProduct.newProduct) {
            this.props.paneCloseCallBack();
        } else {
            this.setState({ isEditing: false, draftProduct: this.state.originalProduct });
        }
    }

    private fieldUpdated(newVal: any, fieldRef: string): void {
        let newDraft = new ProductModel();
        Object.assign(newDraft, this.state.draftProduct);
        newDraft[fieldRef] = newVal;
        this.setState({ draftProduct: newDraft });
    }

    private taskAdded(newTask: TaskModel): void {
        let newDraft = new ProductModel();
        Object.assign(newDraft, this.state.draftProduct);
        newDraft.tasks = [].concat.apply(this.state.draftProduct.tasks, [newTask]);
        this.setState({ draftProduct: newDraft });
    }
}
