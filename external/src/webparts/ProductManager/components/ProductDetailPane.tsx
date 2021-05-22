import * as React from 'react';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';

import * as styles from './ProductManager.module.scss';

import { format } from 'date-fns';
import { ProductModel } from '../../../models/ProductModel';
import { RecordService } from '../../../services/RecordService';
import { AttachmentsMgr } from './AttachmentsMgr';

export interface IProductDetailPaneProps {
    isVisible: boolean;
    currentProductId: string;
    paneCloseCallBack: () => void;
}

export interface IProductDetailPaneState {
    isVisible: boolean;
    currentProduct: ProductModel;
}

export default class ProductDetailPane extends React.Component<IProductDetailPaneProps, IProductDetailPaneState> {
    private dateFormatStr = "dd-LLL-yyyy HH:mm:ss'Z'";

    constructor(props: IProductDetailPaneProps) {
        super(props);
        const stateObj: IProductDetailPaneState = {
            isVisible: this.props.isVisible,
            currentProduct: null
        };

        this.state = stateObj;
    }

    public render(): React.ReactElement<IProductDetailPaneProps> {
        const formHeading = `${styles.gridCol4} ${styles.fieldHead}`;
        const formValue = `${styles.gridCol8} ${styles.fieldValue}`;

        return (
            <Panel
                className={styles.productDetailPane}
                isLightDismiss
                isHiddenOnDismiss={true}
                headerText={this.state.currentProduct ? this.state.currentProduct.id : ''}
                isOpen={this.state.isVisible}
                onDismiss={this.togglePanelState.bind(this)}
                closeButtonAriaLabel='Close'
                type={PanelType.medium}
            >
                {
                    this.state.currentProduct &&
                    <div className={styles.grid + ' ' + styles.formStyles}>
                        <ProductDetailField
                            fieldName={'Body'}
                            fieldValue={this.state.currentProduct.description}
                        />
                        <ProductDetailField
                            fieldName={'Assigned Teams'}
                            fieldValue={'// Todo //'}
                        />
                        <ProductDetailField
                            fieldName={'Request Start'}
                            fieldValue={format(this.state.currentProduct.requestDate, this.dateFormatStr)}
                        />
                        <ProductDetailField
                            fieldName={'Expected Close'}
                            fieldValue={format(this.state.currentProduct.returnDateExpected, this.dateFormatStr)}
                        />
                        <ProductDetailField
                            fieldName={'Actual Close'}
                            fieldValue={''}
                        />
                        <div className={styles.gridRow}>
                            <div className={`${styles.gridCol12} ${styles.fieldHead}`}>Attachments</div>
                            <div className={styles.gridCol12}>
                                <AttachmentsMgr
                                    currentAttachments={this.state.currentProduct.attachedDocuments}
                                />
                            </div>
                        </div>
                    </div>
                }
            </Panel>
        );
    }

    public componentWillReceiveProps(newProps: IProductDetailPaneProps): void {
        if (newProps.isVisible) {
            RecordService.GetProductByGUID(newProps.currentProductId)
            .then(d => {
                const stateObj: IProductDetailPaneState = {
                    isVisible: newProps.isVisible,
                    currentProduct: d
                };
                this.setState(stateObj);
            })
            .catch(e => console.log(e));
        } else {
            const stateObj: IProductDetailPaneState = {
                isVisible: newProps.isVisible,
                currentProduct: null
            };
            this.setState(stateObj);
        }
    }

    private togglePanelState(): void {
        this.props.paneCloseCallBack();
    }
}

export interface IProductDetailFieldProps {
    fieldName: string;
    fieldValue: string;
}

export class ProductDetailField extends React.Component<IProductDetailFieldProps, {}> {
    render(): React.ReactElement<IProductDetailFieldProps> {
        return(
            <div className={`${styles.gridRow} ${styles.padTop2}`}>
                <div className={`${styles.gridCol12} ${styles.fieldHead}`}>
                    {this.props.fieldName}
                </div>
                <div className={`${styles.gridCol11} ${styles.fieldValue} ${styles.padLeft4}`}>
                    {this.props.fieldValue}
                </div>
            </div>
        );
    }
}
