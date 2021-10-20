import { SPAuthor, SpListAttachment, SpProductItem } from '../models/SpListItem';
import { ISPService } from './ISPService';
import AppService from './AppService';
import { FileService } from './FileService';
import { IAppSettings } from '../webparts/ProductManager/ProductManagerWebPart';

export class SPService implements ISPService {
    private get currentSiteUrl(): string { return AppService.AppContext.pageContext.site.absoluteUrl.replace(window.location.origin, ''); }
    private get productListTitle(): string { return AppService.AppSettings.miscSettings.productListTitle; }

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
            return this.getDigestValue(this.currentSiteUrl)
            .then(digestVal => {
                // If the listRecord has an Id, then it is existing...otherwise, it's new
                const urlSfx = listRecord.Id ? `(${listRecord.Id})` : '';
                const postUrl = `${this.currentSiteUrl}/_api/web/lists/GetByTitle('${listTitle}')/items${urlSfx}`;
                /* const record = JSON.stringify(Object.assign(listRecord, { __metaData: { type: enityType } })); */
                const record = JSON.stringify(listRecord);
                const headers = Object.assign({
                    /* 'accept': 'application/json;odata=verbose', */
                    /* 'content-type': 'application/json;odata=verbose', */
                    'accept': 'application/json;odata=nometadata',
                    'content-type': 'application/json;odata=nometadata',
                    'content-length': record.length.toString(),
                    'X-RequestDigest': digestVal,
                    'IF-MATCH': '*'
                }, listRecord.Id ? { 'X-Http-Method': 'MERGE' } : {});
                return fetch(postUrl, {
                    method: 'POST',
                    headers: headers,
                    body: record
                })
                .then(result => {
                    // Record Created
                    if (result.status === 201) {
                        return result.json()
                        .then(d => Promise.resolve(d));
                    }
                    // Record updated
                    if (result.status === 204) {
                        return fetch(postUrl, { headers: { accept: 'application/json;odata=verbose' } })
                        .then(d => d.json())
                        .then(d => d.d)
                        .catch(e => Promise.reject(e));
                    } else {
                        return Promise.reject(result);
                    }
                })
                .then(d => Promise.resolve(d))
                .catch(e => Promise.reject(e));
            })
            .catch(e => Promise.reject(e));
        })
        .catch(e => Promise.reject(e));
    }

    SaveAppSettings(listTitle: string, listRecord: IAppSettings, dataFieldName: string): Promise<IAppSettings> {
        return this.saveListItem(listTitle, { Title: `Update_${new Date().getTime()}`, [dataFieldName]: JSON.stringify(listRecord) })
        /* .then(d => (JSON.parse(d.d.Data) as IAppSettings)) */
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

    GetAttachmentItems(listTitle: string): Promise<Array<SpListAttachment>> {
        return fetch(`${this.currentSiteUrl}/_api/web/lists/GetByTitle('${listTitle}')/items?$select=*,File&$expand=File,File/Author`, { headers: { 'accept': 'application/json;odata=verbose' } })
        .then(d => d.json())
        .then(d => d.d.results)
        .then(d => d.map(m => new SpListAttachment({
            Id: m.Id,
            Title: m.Title,
            DocName: m.File.Name,
            Updated: new Date(m.Modified),
            Author: m.File.Author && m.File.Author.Title ? new SPAuthor({ Name: m.File.Author.Title, Email: m.File.Author.Email }) : null,
            EditUrl: m.File.LinkingUrl,
            Url: m.File.ServerRelativeUrl,
            Version: m.File.MajorVersion,
            LinkedProductGuid: m.LinkedProductGuid
        })))
        .then(d => Promise.resolve(d))
        .catch(e => Promise.reject(e));
    }

    GetAttachmentsForGuid(listTitle: string, spGuid: string): Promise<Array<SpListAttachment>> {
        return this.GetAttachmentItems(listTitle)
        .then(d => d.filter(f => f.LinkedProductGuid === spGuid))
        .then(d => Promise.resolve(d))
        .catch(e => Promise.reject(e));
    }

    AddAttachment(listUrl: string, productSpGuid: string, fileList: FileList): Promise<Array<SpListAttachment>> {
        return this.GetAttachmentsForGuid(listUrl, productSpGuid)
        .then(attachments => {
            return Promise.all(
                Array.from(fileList).map(d => {
                    const matchFileName = attachments.reduce((t: string, n: SpListAttachment) => n.Title === d.name ? n.DocName : t, null);
                    const uploadFileName = matchFileName ? matchFileName : (new Date().getTime().toString() + d.name);

                    return FileService.GetFileBuffer(d)
                    .then(buff => {
                        return this.executeUpload(listUrl, productSpGuid, uploadFileName, d.name, buff)
                        .then(d => Promise.resolve(d))
                        .catch(e => Promise.reject(e));
                     })
                    .then(d => Promise.resolve(d))
                    .catch(e => Promise.reject(e));
                })
            )
            .catch(e => Promise.reject(e));
        })
        .catch(e => Promise.reject(e));
    }

    AddListItem(listTitle: string, item: SpProductItem): Promise<SpProductItem> {
        return this.saveListItem(listTitle, { Title: item.Title, ProdData: item.ProdData, Active: item.Active })
        .then(d => d.d ? d.d : d)
        .then(d => new SpProductItem({
            Id: d.Id,
            GUID: d.GUID,
            Title: d.Title,
            ProdData: d.ProdData,
            Active: d.Active,
            Created: new Date(d.Created),
            Modified: new Date(d.Modified),
            __metadata: d.__metadata
        }))
        .then(d => Promise.resolve(d))
        .catch(e => Promise.reject(e));
    }

    UpdateListItem(listTitle: string, item: SpProductItem): Promise<SpProductItem> {
        return this.saveListItem(listTitle, { Id: item.Id, GUID: item.GUID, Title: item.Title, ProdData: item.ProdData, Active: item.Active })
        .then(d => new SpProductItem({
            Id: d.Id,
            GUID: d.GUID,
            Title: d.Title,
            ProdData: d.ProdData,
            Active: d.Active,
            Created: new Date(d.Created),
            Modified: new Date(d.Modified),
            __metadata: d.__metadata
        }))
        .then(d => Promise.resolve(d))
        .catch(e => Promise.reject(e));
    }

    RemoveListItem(listTitle: string, item: SpProductItem): Promise<void> {
        return this.saveListItem(listTitle, { Id: item.Id, GUID: item.GUID, Title: item.Title, ProdData: item.ProdData, Active: false })
        .then(d => new SpProductItem({
            Id: d.Id,
            GUID: d.GUID,
            Title: d.Title,
            ProdData: d.ProdData,
            Active: d.Active,
            Created: new Date(d.Created),
            Modified: new Date(d.Modified)
        }))
        .then(d => Promise.resolve())
        .catch(e => Promise.reject(e));
    }

    GetListItemByGuid(listTitle: string, guid: string): Promise<SpProductItem> {
        return this.GetListItems(listTitle)
        .then(d => d.reduce((t,n) => n.GUID === guid ? n : t, null))
        .then(d => Promise.resolve(d))
        .catch(e => Promise.reject(e));
    }

    GetListItems(listTitle: string): Promise<Array<SpProductItem>> {
        return fetch(`${this.currentSiteUrl}/_api/web/lists/GetByTitle('${listTitle}')/items`, { headers: { accept: 'application/json;odata=verbose' } })
        .then(d => d.json())
        .then(d => d.d.results)
        .then(d => d.map(m => new SpProductItem({
            Id: m.Id,
            GUID: m.GUID,
            Title: m.Title,
            ProdData: m.ProdData,
            Active: m.Active,
            Created: new Date(m.Created),
            Modified: new Date(m.Modified),
            __metadata: m.__metadata
        })))
        .then(d => Promise.resolve(d))
        .catch(e => Promise.reject(e));
    }

    /** Copies a file from one document library to another in the same site-collection */
    CopyTemplateDocToProdDocs(srcUrl: string, destName: string, linkedProductGuid: string): Promise<boolean> {
        return this.getDigestValue(srcUrl)
        .then(digestVal => {
            const fetchParams = {
                method: 'POST',
                headers: {
                    'accept': 'application/json;odata=verbose',
                    'content-type': 'application/json;odata=verbose',
                    'X-RequestDigest': digestVal
                }
            };
            const site: string = (window as any).SP.PageContextInfo.get_siteServerRelativeUrl();
            const newName = destName.split('.')
                .reduce((t,n,i,e) => i === (e.length - 1) ? [].concat.apply(t, [new Date().getTime(), n]) : [].concat.apply(t, [n]), [])
                .join('.');
            const dest = `${this.currentSiteUrl}/${AppService.AppSettings.miscSettings.documentLibraryName}/${newName}`;
            const urlStr = `${site}/_api/web/getfilebyserverrelativeurl('${srcUrl}')/copyto(strnewurl='${dest}',boverwrite=false)`;
            return fetch(urlStr, fetchParams)
            .then(() => {
                return fetch(`${site}/_api/web/lists/getbytitle('${AppService.AppSettings.miscSettings.documentLibraryName}')/items?select=Id,File&$expand=File&$orderby=Modified desc`, {
                    headers: { accept: 'application/json;odata=verbose;' }
                })
                .then(d => d.json())
                .then(d => d.d.results.reduce((t, n) => n.File.Name === newName ? n.ID : t))
                .then(id => {
                    return this.getDigestValue(this.currentSiteUrl)
                    .then(digestVal => {
                        const payload = JSON.stringify({ Title: destName, LinkedProductGuid: linkedProductGuid });
                        return fetch(`${site}/_api/web/lists/getbytitle('${AppService.AppSettings.miscSettings.documentLibraryName}')/items(${id})`, {
                            method: 'POST',
                            headers: {
                                'accept': 'application/json;odata=nometadata',
                                'content-type': 'application/json;odata=nometadata',
                                'content-length': payload.length.toString(),
                                'X-RequestDigest': digestVal,
                                'X-Http-Method': 'MERGE',
                                'IF-Match': '*'
                            },
                            body: payload
                        })
                        .then(d => d.status === 204 ? Promise.resolve(true) : Promise.resolve(false))
                        .catch(e => Promise.reject(e));
                    })
                    .catch(e => Promise.reject(e));
                })
                .catch(e => Promise.reject(e));
            })
            .catch(e => Promise.reject(e));
        })
        .catch(e => Promise.reject(e));
    }

    private executeUpload(listUrl: string, productSpGuid: string, fileName: string, fileTitle: string, arrayBuffer: ArrayBuffer): Promise<SpListAttachment> {
        /*
            We dont want to overwrite files with the same names from different products so we add a timestamp to the beginning of the filename
            But we also dont want every upload to be unique  ie: we do want to overwrite files with the same name when they belong to the same product
        */
        return this.getDigestValue(this.currentSiteUrl)
        .then(digestVal => {
            // const destLoc = `${this.currentSiteUrl}/${AppService.AppSettings.miscSettings.documentLibraryName}/${fileName}`
            return fetch(`${this.currentSiteUrl}/_api/Web/GetFolderByServerRelativeUrl(@target)/Files/add(overwrite=true, url='${fileName}')?@target='${listUrl}'&$expand=ListItemAllFields,Author`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json;odata=verbose',
                    'X-RequestDigest': digestVal
                },
                body: arrayBuffer
            })
            .then(result => result.json())
            .then(uploadResult => {
                // Because the productlist is a library with some list fields, we have to update the fields
                //  seperately from the upload process
                return this.saveListItem(AppService.AppSettings.miscSettings.productListTitle, {
                    Id: uploadResult.d.ListItemAllFields.Id,
                    Title: fileTitle,
                    LinkedProductGuid: productSpGuid
                })
                .then(saveResult => {
                    return Promise.resolve(new SpListAttachment({
                        Id: uploadResult.d.ListItemAllFields.GUID,
                        Author: new SPAuthor({
                            Name: AppService.CurrentSpUser.displayName,
                            Email: AppService.CurrentSpUser.email
                        }),
                        LinkedProductGuid: productSpGuid,
                        Title: uploadResult.d.Name,
                        Url: uploadResult.d.ServerRelativeUrl,
                        Version: uploadResult.d.MajorVersion,
                        Updated: uploadResult.d.Modified
                    }));
                })
                .catch(e => Promise.reject(e));
            })
            .catch(e => Promise.reject(e));
        })
        .catch(e => Promise.reject(e));
    }
}
