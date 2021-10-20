import AppService, { GlobalMsg } from './AppService';
import { SPHttpClient, SPHttpClientConfiguration } from '@microsoft/sp-http';

export class MailService {
    private static get spHttpClient(): SPHttpClient {
        return AppService.AppContext.spHttpClient;
    }

    private static get mailUrl(): string {
        const baseUrl: string = AppService.AppContext.pageContext.web.absoluteUrl;
        return `${baseUrl}/_api/SP.Utilities.Utility.SendEmail`;
    }

    public static async SendEmail(subject: string, toList: Array<string>, msgBody: string): Promise<string> {
        if (toList.length === 0) {
            return Promise.reject(`No Email Recipients For Notification: ${msgBody}`);
        }

        const headers = {
            'accept': 'application/json;odata=verbose',
            'content-type': 'application/json;odata=verbose',
            'X-RequestDigest': document.querySelector('#__REQUESTDIGEST') ? (document.querySelector('#__REQUESTDIGEST') as HTMLInputElement).value : 'NoDigestValue'
        };

        const payload = JSON.stringify({
            properties: {
                __metadata: { type: 'SP.Utilities.EmailProperties' },
                From: AppService.AppSettings.miscSettings.emailSenderName,
                To: { results: toList },
                Body: msgBody,
                Subject: subject
            }
        });

        if (AppService.AppSettings.isDebugging) {
            AppService.TriggerGlobalMessage(GlobalMsg.EmailSent);
            return Promise.resolve('');
        } else {
            AppService.TriggerGlobalMessage(GlobalMsg.EmailSending);
            return new Promise<string>(() => {
                fetch(this.mailUrl, { method: 'POST', headers: headers, body: payload })
                .then(response => response.json().then(d => Promise.resolve(d.value).catch(e => Promise.reject(e))))
                .catch(e => Promise.reject(e));
            })
            .then(d => {
                AppService.TriggerGlobalMessage(GlobalMsg.EmailSent);
                return Promise.resolve(d);
            })
            .catch(e => {
                console.log('Error occured in "MailService.SendEmail":', e);
                AppService.TriggerGlobalMessage(GlobalMsg.EmailFailed);
                return Promise.reject(e);
            });
        }
    }
}
