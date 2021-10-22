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
    private receiverEmailSending: any;
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

        this.receiverEmailSending = this.toastEmailSending.bind(this);
        this.receiverEmailSent = this.toastEmailSent.bind(this);
        this.receiverEmailFailed = this.toastEmailFailed.bind(this);

        this.receivers = [
            this.receiverProdCreated, this.receiverProdUpdated, this.receiverProdSaveFailed,
            this.receiverDocUploading, this.receiverDocUploaded, this.receiverDocUploadFailed,
            this.receiverEmailSending, this.receiverEmailSent, this.receiverEmailFailed
        ];
    }

    private toastProdCreated([prod]): void { this.toastSuccess('Product Created', prod.title); }
    private toastProdUpdated([prod]): void { this.toastSuccess('Product Updated', prod.title); }
    private toastProdSaveFailed(): void { this.toastFailed('Failed to save product'); }

    private toastDocUploading([prod, files]): void { this.toastPending('Document(s) Uploading...'); }
    private toastDocUploaded([prod, files]): void { this.toastSuccess('...document(s) Uploaded', prod.title, files); }
    private toastDocUploadFailed(): void { this.toastFailed('Failed to upload document(s)'); }

    private toastEmailSending([]): void { this.toastPending('Sending Email Notifications'); }
    private toastEmailSent(): void { this.toastSuccess('Email Notifications Sent'); }
    private toastEmailFailed(): void { this.toastFailed('Failed to send email notifications'); }

    private toastFailed(msg: string): void {
        toast.error(<div>{msg}</div>);
    }

    private toastPending(msg: string): void {
        toast.info(<div>{msg}</div>);
    }

    private toastSuccess(title: string, msg?: string, extraMsg?: string): void {
        const toastMsg = (
            <>
                <div>{title}</div>
                {msg && <div>{msg}</div>}
                {extraMsg && <div>{extraMsg}</div>}
            </>
        );
        toast.success(toastMsg);
    }

    componentDidMount(): void {
        AppService.RegisterGlobalListener({ msg: GlobalMsg.ProductCreated, callback: this.receiverProdCreated } as IGlobalListenerProps);
        AppService.RegisterGlobalListener({ msg: GlobalMsg.ProductUpdated, callback: this.receiverProdUpdated } as IGlobalListenerProps);
        AppService.RegisterGlobalListener({ msg: GlobalMsg.ProductSaveFailed, callback: this.receiverProdSaveFailed } as IGlobalListenerProps);

        AppService.RegisterGlobalListener({ msg: GlobalMsg.DocumentUploading, callback: this.receiverDocUploading } as IGlobalListenerProps);
        AppService.RegisterGlobalListener({ msg: GlobalMsg.DocumentUploaded, callback: this.receiverDocUploaded } as IGlobalListenerProps);
        AppService.RegisterGlobalListener({ msg: GlobalMsg.DocumentUploadFailed, callback: this.receiverDocUploadFailed } as IGlobalListenerProps);

        AppService.RegisterGlobalListener({ msg: GlobalMsg.EmailSending, callback: this.receiverEmailSending } as IGlobalListenerProps);
        AppService.RegisterGlobalListener({ msg: GlobalMsg.EmailSent, callback: this.receiverEmailSent } as IGlobalListenerProps);
        AppService.RegisterGlobalListener({ msg: GlobalMsg.EmailFailed, callback: this.receiverEmailFailed } as IGlobalListenerProps);
    }

    componentWillUnmount(): void {
        this.receivers.forEach(x => AppService.UnRegisterGlobalListener(x));
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
