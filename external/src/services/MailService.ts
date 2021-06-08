import AppService from './AppService';
import { SPHttpClient, SPHttpClientConfiguration } from '@microsoft/sp-http';

export class MailService {
    private static get spHttpClient(): SPHttpClient {
        return AppService.AppContext.spHttpClient;
    }

    private static get mailUrl(): string {
        const baseUrl: string = AppService.AppContext.pageContext.web.absoluteUrl;
        return `${baseUrl}/_api/SP.Utilities.Utility.SendEmail`;
    }

    private static get emailHeaders(): any {
        const digestVal: string = document.querySelector('#__REQUESTDIGEST') ? (document.querySelector('#__REQUESTDIGEST') as HTMLInputElement).value : 'NoDigestValue';
        return {
            method: 'POST',
            headers: {
                'accept': 'application/json;odata=nometadata',
                'content-type': 'application/json;odata=nometadata',
                'X-RequestDigest': digestVal
            },
            body: ''
        };
    }

    public static async SendEmail(subject: string, toList: Array<string>, msgBody: string): Promise<string> {
        const payload = {
            __metadata: { type: 'SP.Utilities.EmailProperties' },
            From: AppService.AppSettings.emailSenderName,
            To: toList,
            Subject: subject,
            Body: msgBody
        };
        const headers = this.emailHeaders;
        headers.body = JSON.stringify(payload);

        if (AppService.AppSettings.isDebugging) {
            console.log('EmailService.SendEmail: ', this.mailUrl);
            console.log('EmailService.SendEmail: ', JSON.stringify(headers, null, '  '));
            return Promise.resolve('');
        } else {
            return new Promise<string>((resolve, reject) => {
                // this.spHttpClient.post(this.mailUrl, headers, SPHttpClient.configurations.v1)
                fetch(this.mailUrl, headers)
                .then(response => {
                    response.json()
                    .then((responseJSON: any) => responseJSON.value)
                    .then((responseJSON: any) => resolve(responseJSON))
                    .catch(e => Promise.reject(e));
                })
                .catch(e => {
                    console.log('Error occured in "MailService.SendEmail":', e);
                    reject(e);
                });
            });
        }
    }
}
