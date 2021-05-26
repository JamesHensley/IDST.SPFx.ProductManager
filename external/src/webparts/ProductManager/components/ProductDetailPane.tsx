import * as React from 'react';
import { Panel, PanelType, Separator, FocusTrapZone, Stack, DirectionalHint, IconButton, DefaultButton } from '@fluentui/react';
import { Text, Label, TextField } from '@fluentui/react';
import { Calendar, Callout } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';

import * as styles from './ProductManager.module.scss';

import { format } from 'date-fns';
import { ProductModel } from '../../../models/ProductModel';
import { RecordService } from '../../../services/RecordService';
import { AttachmentsMgr } from './AttachmentsMgr';
import { fieldValue } from './ProductManager.module.scss';
import { FormInputDate } from './FormComponents/FormInputDate';
import { FormInputText } from './FormComponents/FormInputText';


export interface IProductDetailPaneProps {
    isVisible: boolean;
    currentProductId: string;
    paneCloseCallBack: () => void;
}

export interface IProductDetailPaneState {
    isVisible: boolean;
    isEditing: boolean;
    draftProduct: ProductModel;
}

// This needs a lot of work... especially the editing portion
export default class ProductDetailPane extends React.Component<IProductDetailPaneProps, IProductDetailPaneState> {
    private committedProduct: ProductModel;

    constructor(props: IProductDetailPaneProps) {
        super(props);
        const stateObj: IProductDetailPaneState = {
            isVisible: false,
            isEditing: false,
            draftProduct: null
        };
        this.state = stateObj;

        RecordService.GetProductByGUID(this.props.currentProductId)
        .then((prod: ProductModel) => {
            this.committedProduct = prod;

            this.setState({
                isVisible: this.props.isVisible,
                isEditing: false,
                draftProduct: prod
            })
        })
        .catch(e => console.log('ProductDetailPane.constructor: Could not get product model', this.props));
    }

    public render(): React.ReactElement<IProductDetailPaneProps> {
        return (
            <Panel
                className={styles.productDetailPane}
                isLightDismiss
                isHiddenOnDismiss={false}
                headerText={this.state.draftProduct ? `${this.state.draftProduct.title} [${this.state.draftProduct.status}]` : ''}
                isOpen={this.state.isVisible}
                onDismiss={this.togglePanelVisibility.bind(this)}
                closeButtonAriaLabel='Close'
                type={PanelType.medium}
            >
                {
                    this.state.isVisible && this.state.draftProduct &&
                    <FocusTrapZone disabled={!this.state.isEditing}>
                        <div className={styles.grid + ' ' + styles.formStyles}>
                            <Stack horizontal tokens={{childrenGap: 10}}>
                                <DefaultButton onClick={this.toggleEditMode.bind(this)} disabled={this.state.isEditing}>Edit</DefaultButton>
                                {this.state.isEditing && <DefaultButton onClick={this.saveRFI.bind(this)} disabled={!this.state.isEditing}>Save</DefaultButton>}
                                {this.state.isEditing && <DefaultButton onClick={this.cancelRFIChanges.bind(this)} disabled={!this.state.isEditing}>Cancel Changes</DefaultButton>}
                            </Stack>
                            <FormInputText
                                labelValue={'Body'} editing={this.state.isEditing}
                                fieldValue={this.state.draftProduct.description} editLines={4}
                                fieldRef={'description'}
                                onUpdated={this.fieldUpdated.bind(this)}
                            />
                            <FormInputText
                                labelValue={'Assigned Teams'} editing={this.state.isEditing}
                                fieldValue={'// Todo //'}
                                fieldRef={''}
                                onUpdated={this.fieldUpdated.bind(this)}
                            />
                            <FormInputDate
                                labelValue={'Request Start'} editing={this.state.isEditing}
                                fieldValue={this.state.draftProduct.requestDate}
                                fieldRef={'requestDate'}
                                onUpdated={this.fieldUpdated.bind(this)}
                            />
                            <FormInputDate
                                labelValue={'Expected Close'} editing={this.state.isEditing}
                                fieldValue={this.state.draftProduct.returnDateExpected}
                                fieldRef={'returnDateExpected'}
                                onUpdated={this.fieldUpdated.bind(this)}
                            />
                            <Separator></Separator>
                            <div className={styles.gridRow}>
                                <Label>Attachments</Label>
                                <div className={styles.gridCol12}>
                                    <AttachmentsMgr
                                        currentAttachments={this.state.draftProduct.attachedDocuments}
                                    />
                                </div>
                            </div>
                        </div>
                    </FocusTrapZone>
                }
            </Panel>
        );
    }

    private togglePanelVisibility(): void {
        this.props.paneCloseCallBack();
    }

    private toggleEditMode(): void {
        this.setState({ isEditing: !this.state.isEditing });
    }

    private saveRFI(): void {
        // Do work here to save the model being edited
        console.log('Saving draft data: ', this.committedProduct, this.state.draftProduct);
        RecordService.UpdateProductByGuid(this.props.currentProductId, this.state.draftProduct)
        .then(data => {
            console.log('Updated: ', data);
            this.toggleEditMode();
        })
        .catch(e => console.log('Update failed for: ', this.state.draftProduct))
    }

    private cancelRFIChanges(): void {
        this.toggleEditMode();
    }

    private fieldUpdated(newVal: any, fieldRef: string): void {
        const temp = JSON.parse(JSON.stringify(this.state.draftProduct));
        temp[fieldRef] = newVal;
        this.setState({ draftProduct: temp});
    }
}
