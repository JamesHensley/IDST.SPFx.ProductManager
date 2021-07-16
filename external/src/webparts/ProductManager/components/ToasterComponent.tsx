import * as React from 'react';

import { NotificationService, NotificationType } from '../../../services/NotificationService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default class ToasterComponent extends React.Component<{}, {}> {
    private receiver: any;

    constructor(props: {}) {
        super(props);
        this.receiver = this.notificationFired.bind(this);
    }

    componentDidMount(): void { NotificationService.RegisterProductListener(this.receiver); }

    componentWillUnmount(): void { NotificationService.UnRegisterProductListener(this.receiver); }

    private notificationFired(notType: NotificationType, msg?: string, extraMsg?: string): void {
        const title = notType.toString();
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
