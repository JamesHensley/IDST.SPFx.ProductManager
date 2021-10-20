import * as React from 'react';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ProductModel } from '../../../models/ProductModel';
import AppService, { GlobalMsg, IGlobalListenerProps } from '../../../services/AppService';

export default class ToasterComponent extends React.Component<{}, {}> {
    private receiverProdCreated: any;
    private receiverProdUpdated: any;
    private receiverDocUploading: any;
    private receiverDocUploaded: any;
    private receiverEmailSent: any;
    private receivers: Array<any>;

    constructor(props: {}) {
        super(props);
        this.receiverProdCreated = this.toastProdCreated.bind(this);
        this.receiverProdUpdated = this.toastProdUpdated.bind(this);
        this.receiverDocUploading = this.toastDocUploading.bind(this);
        this.receiverDocUploaded = this.toastDocUploaded.bind(this);
        this.receiverEmailSent = this.toastEmailSent.bind(this);

        this.receivers = [ this.receiverProdCreated, this.receiverProdUpdated, this.receiverDocUploading, this.receiverDocUploaded, this.receiverEmailSent ];
    }

    componentDidMount(): void {
        AppService.RegisterGlobalListener({ msg: GlobalMsg.ProductCreated, callback: this.receiverProdCreated } as IGlobalListenerProps);
        AppService.RegisterGlobalListener({ msg: GlobalMsg.ProductUpdated, callback: this.receiverProdUpdated } as IGlobalListenerProps);
        AppService.RegisterGlobalListener({ msg: GlobalMsg.DocumentUploaded, callback: this.receiverDocUploaded } as IGlobalListenerProps);
        AppService.RegisterGlobalListener({ msg: GlobalMsg.DocumentUploaded, callback: this.receiverDocUploaded } as IGlobalListenerProps);
    }

    componentWillUnmount(): void {
        this.receivers.forEach(x => AppService.UnRegisterGlobalListener(x));
    }

    private toastProdCreated([prod]): void { this.toast('Product Created', prod.title); }
    private toastProdUpdated([prod]): void { this.toast('Product Updated', prod.title); }
    private toastDocUploading([prod, files]): void { this.toast('Document(s) Uploading...', prod.title, files); }
    private toastDocUploaded([prod, files]): void { this.toast('...document(s) Uploaded', prod.title, files); }
    private toastEmailSent(): void { this.toast('Email Notifications Sent'); }
    private toast(title: string, msg?: string, extraMsg?: string): void {
        const toastMsg = (
            <>
                <div>{title}</div>
                {msg && <div>{msg}</div>}
                {extraMsg && <div>{extraMsg}</div>}
            </>
        );
        toast.info(toastMsg);
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
