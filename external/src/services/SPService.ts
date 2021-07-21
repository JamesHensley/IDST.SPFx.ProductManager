import { SPAuthor, SpListAttachment, SpProductItem } from '../models/SpListItem';
import { ISPService } from './ISPService';
import AppService from './AppService';
import { FileService } from './FileService';
import { MapperService } from './MapperService';
import { IAppSettings } from '../webparts/ProductManager/ProductManagerWebPart';

export class SPService implements ISPService {
    private get currentSiteUrl(): string { return AppService.AppContext.pageContext.site.absoluteUrl; }

    private getListEntityTypeName(listTitle: string): Promise<string> {
        return fetch(`${this.currentSiteUrl}/_api/web/lists/GetByTitle('${listTitle}')?$select=ListItemEntityTypeFullName`,
        { headers: { accept: 'application/json;odata=verbose' } })
        .then(d => d.json())
        .then(d => d.d.ListItemEntityTypeFullName);
    }

    private getDigestValue(url: string): Promise<string> {
        return fetch(`${url}/_api/contextinfo`, { method: 'POST', headers: { 'accept': 'application/json;odata=verbose' } })
        .then(ctx => ctx.json())
        .then(ctx => Promise.resolve(ctx.d.GetContextWebInformation.FormDigestValue))
        .catch(e => Promise.reject(e));
    }

    /** Shared method to save any list record to a list */
    private saveListItem(listTitle: string, listRecord: any): Promise<any> {
        return this.getListEntityTypeName(listTitle)
        .then(enityType => {
            return this.getDigestValue(this.currentSiteUrl + '/_api/contextinfo')
            .then(digestVal => {
                const record = JSON.stringify(Object.assign(listRecord, { __metaData: { type: enityType } }));
                return fetch(`${this.currentSiteUrl}/_api/web/lists/GetByTitle('${listTitle}')/items`, {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json;odata=verbose',
                        'content-type': 'application/json;odata=verbose',
                        'content-length': record.length.toString(),
                        'X-RequestDigest': digestVal,
                        'IF-MATCH': '*'
                    },
                    body: record
                })
                .then(d => d.json())
                .then(d => Promise.resolve(d))
                .catch(e => Promise.reject(e));
            })
            .catch(e => Promise.reject(e));
        })
        .catch(e => Promise.reject(e));
    }

    SaveAppSettings(listTitle: string, listRecord: IAppSettings): Promise<IAppSettings> {
        return this.saveListItem(listTitle, { Title: new Date().getTime(), Data: JSON.stringify(listRecord) })
        .then(d => (JSON.parse(d.Data) as IAppSettings))
        .then(d => Promise.resolve(d))
        .catch(e => Promise.reject(e));
    }

    GetSingleFieldValues(listTitle: string, fieldName: string): Promise<string[]> {
        return fetch(`${this.currentSiteUrl}/_api/web/lists/GetByTitle('${listTitle}')/items?$select=${fieldName}`, { headers: { 'accept': 'application/json;odata=verbose' } })
        .then(d => d.json())
        .then(d => d.d.results.map(m => m[fieldName]).filter((f, i, e) => e.indexOf(f) === i).sort())
        .then(d => Promise.resolve(d))
        .catch(e => Promise.reject(e));
    }

    GetAttachmentItems(listUrl: string): Promise<SpListAttachment[]> {
        throw new Error('Method not implemented.');
    }

    GetAttachmentsForGuid(listUrl: string, guid: string): Promise<Array<SpListAttachment>> {
        throw new Error('Method not implemented.');
    }

    AddAttachment(listUrl: string, productGuid: string, fileList: FileList): Promise<Array<SpListAttachment>> {
        return Promise.all(
            Array.from(fileList).map(d => {
                return FileService.GetFileBuffer(d)
                .then(buff => {
                    // Now that we have an arrayBuffer, we can upload this into SP
                    return this.executeUpload(listUrl, productGuid, d.name, buff);
                });
            })
        );
    }

    AddListItem(listTitle: string, item: SpProductItem): Promise<SpProductItem> {
        return this.saveListItem(listTitle, { Title: item.Title, ProdData: item.ProdData, Active: item.Active })
        .then(d => new SpProductItem({
            Id: d.Id,
            GUID: d.GUID,
            Title: d.Title,
            ProdData: d.ProdData,
            Active: d.Active,
            Created: d.Created,
            Modified: d.Modified
        }))
        .then(d => Promise.resolve(d))
        .catch(e => Promise.reject(e));
    }

    UpdateListItem(listUrl: string, item: SpProductItem): Promise<SpProductItem> {
        throw new Error('Method not implemented.');
    }

    RemoveListItem(listUrl: string, item: SpProductItem): Promise<void> {
        throw new Error('Method not implemented.');
    }

    GetListItemByGuid(listUrl: string, guid: string): Promise<SpProductItem> {
        throw new Error('Method not implemented.');
    }

    GetListItems(listUrl: string): Promise<Array<SpProductItem>> {
        return new Promise<Array<SpProductItem>>((resolve, reject) => {
            resolve([]);
        });
    }

    /** Copies a file from one document library to another in the same site-collection */
    CopyFile(srcUrl: string, destUrl: string, suffix: string): Promise<boolean> {
        return this.getDigestValue(srcUrl)
        .then(digestVal => {
            const fetchParams = {
                method: 'POST',
                headers: {
                    accept: 'application/json;odata=verbose',
                    'content-type': 'application/json;odata=verbose',
                    'X-RequestDigest': digestVal
                }
            };
            const site: string = (window as any).SP.PageContextInfo.get_siteServerRelativeUrl();
            const dest: string = destUrl.split('.').map((d, i, e) => (i === e.length - 2) ? d += suffix : d).join('.');
            const urlStr = `${site}/getfilebyserverrelativeurl('${srcUrl}')/copyto(strnewurl='${dest}',boverwrite=false)`;

            return fetch(urlStr, fetchParams)
            .then(data => data.json())
            .then(data => Promise.resolve(data.d['CopyTo'] === null))
            .catch(e => Promise.resolve(e));
        })
        .catch(e => Promise.reject(e));
    }

    private executeUpload(listUrl: string, productGuid: string, fileName: string, arrayBuffer: ArrayBuffer): Promise<SpListAttachment> {
        // const documentLibrary = '';
        const webUrl = AppService.AppContext.pageContext.web.absoluteUrl;
        // const targetUrl =  `${AppService.AppContext.pageContext.web.serverRelativeUrl}/${documentLibrary}`;
        const targetUrl = listUrl;
        const url = webUrl + "/_api/Web/GetFolderByServerRelativeUrl(@target)/Files/add(overwrite=true, url='" + fileName + "')?@target='" + targetUrl + "'&$expand=ListItemAllFields,Author";

        return fetch(url, {
            method: 'POST',
            headers: {
                'accept': 'application/json;odata=verbose',
                'X-RequestDigest': (document.querySelector('#__REQUESTDIGEST') as any).value
            },
            body: arrayBuffer
        })
        .then(result => result.json())
        .then(result => Promise.resolve(new SpListAttachment({
                Id: result.d.ListItemAllFields.GUID,
                Author: { Name: AppService.CurrentSpUser.displayName, Email: AppService.CurrentSpUser.email } as SPAuthor,
                LinkedProductGuid: productGuid,
                Title: result.d.Name,
                Url: result.d.ServerRelativeUrl,
                Version: result.d.MajorVersion,
                Updated: result.d.Modified
            })
        ))
        .catch(e => Promise.reject(e));
    }

    /// TODO: Remove all the below garbage once the service is completed...
    /*
        var bodyDiv = document.querySelector('div#s4-bodyContainer');
        var myDiv = document.createElement('div');

        var inp = document.createElement('input');
        inp.setAttribute('type', 'file');

        var btn = document.createElement('button');
        btn.setAttribute('onClick', 'javascript: btnClick()');

        myDiv.appendChild(inp);
        myDiv.appendChild(btn);

        bodyDiv.appendChild(myDiv);

        function btnClick() {
            var file = inp.files[0];

            event.preventDefault();
            event.stopPropagation();

            new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = (e) => resolve(e.target.result);
                reader.onerror = (e) => reject(e);
                reader.readAsArrayBuffer(inp.files[0]);
            })
            .then(arrayBuff => {
                var digestVal = document.querySelector('#__REQUESTDIGEST').value;

                var fileName = file.name;
                var webUrl = _spPageContextInfo.webAbsoluteUrl;
                var documentLibrary = "Documents";
                var targetUrl = _spPageContextInfo.webServerRelativeUrl + "/" + documentLibrary;
                var url = webUrl + "/_api/Web/GetFolderByServerRelativeUrl(@target)/Files/add(overwrite=true, url='" + fileName + "')?@target='" + targetUrl + "'&$expand=ListItemAllFields";

                uploadFileToFolder(file, url, arrayBuff, function(data) {
                    var file = data.d;
                    DocFileName = file.Name;
                    var updateObject = {
                        __metadata: {
                            type: file.ListItemAllFields.__metadata.type
                        },
                        FileLeafRef: DocFileName //FileLeafRef --> Internal Name for Name Column
                    };
                });
            });
        }

        function uploadFileToFolder(fileObj, url, buffData, success, failure) {
            fetch(url, {
                method: 'POST',
                headers: {
                    'accept': 'application/json;odata=verbose',
                    'X-RequestDigest': document.querySelector('#__REQUESTDIGEST').value
                },
                body: buffData
            })
            .then(d => console.log(d));
        }
    */
}
