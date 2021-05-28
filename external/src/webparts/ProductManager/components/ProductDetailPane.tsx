import * as React from 'react';
import { Panel, PanelType, Separator, FocusTrapZone, Stack, DirectionalHint, IconButton, DefaultButton, ICommandBarItemProps } from '@fluentui/react';
import { Label } from '@fluentui/react';

import * as styles from './ProductManager.module.scss';

import { format } from 'date-fns';
import { ProductModel } from '../../../models/ProductModel';
import { RecordService } from '../../../services/RecordService';
import { AttachmentsMgr } from './AttachmentsMgr';
import { FormInputDate } from './FormComponents/FormInputDate';
import { FormInputText } from './FormComponents/FormInputText';
import AppService, { ICmdBarListenerProps } from '../../../services/AppService';


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
    private receiver: any;

    constructor(props: IProductDetailPaneProps) {
        super(props);
        const stateObj: IProductDetailPaneState = {
            isVisible: false,
            isEditing: false,
            draftProduct: null
        };
        this.state = stateObj;

        this.receiver = this.cmdBarItemClicked.bind(this);

        if (this.props.currentProductId) {
            RecordService.GetProductByGUID(this.props.currentProductId)
            .then((prod: ProductModel) => {
                this.committedProduct = prod;
                this.setState({ isEditing: false, isVisible: this.props.isVisible, draftProduct: prod });
            })
            .catch(e => console.log('ProductDetailPane.constructor: Could not get product model', this.props));
        }
    }

    public componentDidMount(): void {
        AppService.RegisterCmdBarListener({ callback: this.receiver, btnKeys: ['newProduct'] } as ICmdBarListenerProps)
    }

    public componentWillUnmount(): void {
        AppService.UnRegisterCmdBarListener(this.receiver);
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
                                labelValue={'Title'} editing={this.state.isEditing}
                                fieldValue={this.state.draftProduct.title}
                                fieldRef={'title'}
                                onUpdated={this.fieldUpdated.bind(this)}
                            />                            
                            <FormInputText
                                labelValue={'Description'} editing={this.state.isEditing}
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
        RecordService.UpdateProductByGuid(this.state.draftProduct.guid, this.state.draftProduct)
        .then(() => {
            console.log('Updated: ', this.state.draftProduct.guid);
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

    private async cmdBarItemClicked(item: ICommandBarItemProps): Promise<void> {
        console.log(item, this.props, this.state);

        this.setState({
            isEditing: true,
            isVisible: true,
            draftProduct: RecordService.GetNewProductModel()
        })
    }
}
