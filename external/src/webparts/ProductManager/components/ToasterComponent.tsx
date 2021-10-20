import * as React from 'react';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ProductModel } from '../../../models/ProductModel';
import AppService, { GlobalMsg, IGlobalListenerProps } from '../../../services/AppService';

export default class ToasterComponent extends React.Component<{}, {}> {
    private receiverProdCreated: any;
    private receiverProdUpdated: any;
    private receiverProdSaveFailed: any;
    private receiverDocUploading: any;
    private receiverDocUploaded: any;
    private receiverDocUploadFailed: any;
    private receiverEmailSent: any;
    private receiverEmailFailed: any;
    private receivers: Array<any>;

    constructor(props: {}) {
        super(props);
        this.receiverProdCreated = this.toastProdCreated.bind(this);
        this.receiverProdUpdated = this.toastProdUpdated.bind(this);
        this.receiverProdSaveFailed = this.toastProdSaveFailed.bind(this);

        this.receiverDocUploading = this.toastDocUploading.bind(this);
        this.receiverDocUploaded = this.toastDocUploaded.bind(this);
        this.receiverDocUploadFailed = this.toastDocUploadFailed.bind(this);

        this.receiverEmailSent = this.toastEmailSent.bind(this);
        this.receiverEmailFailed = this.toastEmailFailed.bind(this);

        this.receivers = [
            this.receiverProdCreated, this.receiverProdUpdated, this.receiverProdSaveFailed,
            this.receiverDocUploading, this.receiverDocUploaded, this.receiverDocUploadFailed,
            this.receiverEmailSent, this.receiverEmailFailed
        ];
    }

    componentDidMount(): void {
        AppService.RegisterGlobalListener({ msg: GlobalMsg.ProductCreated, callback: this.receiverProdCreated } as IGlobalListenerProps);
        AppService.RegisterGlobalListener({ msg: GlobalMsg.ProductUpdated, callback: this.receiverProdUpdated } as IGlobalListenerProps);
        AppService.RegisterGlobalListener({ msg: GlobalMsg.ProductSaveFailed, callback: this.receiverProdSaveFailed } as IGlobalListenerProps);

        AppService.RegisterGlobalListener({ msg: GlobalMsg.DocumentUploading, callback: this.receiverDocUploading } as IGlobalListenerProps);
        AppService.RegisterGlobalListener({ msg: GlobalMsg.DocumentUploaded, callback: this.receiverDocUploaded } as IGlobalListenerProps);
        AppService.RegisterGlobalListener({ msg: GlobalMsg.DocumentUploadFailed, callback: this.receiverDocUploadFailed } as IGlobalListenerProps);

        AppService.RegisterGlobalListener({ msg: GlobalMsg.EmailSent, callback: this.toastEmailSent } as IGlobalListenerProps);
        AppService.RegisterGlobalListener({ msg: GlobalMsg.EmailFailed, callback: this.toastEmailFailed } as IGlobalListenerProps);
    }

    componentWillUnmount(): void {
        this.receivers.forEach(x => AppService.UnRegisterGlobalListener(x));
    }

    private toastProdCreated([prod]): void { this.toast('Product Created', prod.title); }
    private toastProdUpdated([prod]): void { this.toast('Product Updated', prod.title); }
    private toastProdSaveFailed(): void { this.toastFailed('Failed to save product'); }

    private toastDocUploading([prod, files]): void { this.toastPending('Document(s) Uploading...'); }
    private toastDocUploaded([prod, files]): void { this.toast('...document(s) Uploaded', prod.title, files); }
    private toastDocUploadFailed(): void { this.toastFailed('Failed to upload document(s)'); }

    private toastEmailSent(): void { this.toast('Email Notifications Sent'); }
    private toastEmailFailed(): void { this.toastFailed('Failed to send email notifications'); }

    private toastFailed(msg: string): void {
        const toastMsg = (
            <div>{msg}</div>
        );
        toast.error(toastMsg);
    }

    private toastPending(msg: string): void {
        const toastMsg = (
            <div>{msg}</div>
        );
        toast.info(toastMsg);
    }

    private toast(title: string, msg?: string, extraMsg?: string): void {
        const toastMsg = (
            <>
                <div>{title}</div>
                {msg && <div>{msg}</div>}
                {extraMsg && <div>{extraMsg}</div>}
            </>
        );
        toast.success(toastMsg);
    }

    render(): JSX.Element {
        return <ToastContainer
            position={'top-left'}
            autoClose={7000}
            hideProgressBar={false}
            newestOnTop={false}
            style={{ zIndex: 1000001 }}
        />;
    }
}
