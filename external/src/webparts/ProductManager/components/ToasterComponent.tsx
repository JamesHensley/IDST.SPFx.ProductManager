import * as React from 'react';

import { NotificationService } from '../../../services/NotificationService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RGBA_REGEX } from '@fluentui/react';

export interface IToasterComponentProps {}

export interface IToasterComponentState {}

export default class ToasterComponent extends React.Component<IToasterComponentProps, IToasterComponentState> {
    private receiver: any;

    constructor(props: IToasterComponentProps) {
        super(props);
        this.receiver = this.notificationFired.bind(this);
    }

    componentDidMount(): void { NotificationService.RegisterProductListener(this.receiver); }

    componentWillUnmount(): void { NotificationService.UnRegisterProductListener(this.receiver); }

    private notificationFired(msg: string): void { toast.info(msg); }

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
