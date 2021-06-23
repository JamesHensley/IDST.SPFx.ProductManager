import { SPAuthor, SpListAttachment, SpProductItem } from '../models/SpListItem';
import { ISPService } from './ISPService';

import { SPHttpClient, SPHttpClientConfiguration } from '@microsoft/sp-http';
import { IODataList, IODataListItem, IODataWeb } from '@microsoft/sp-odata-types';
import AppService from './AppService';
import { FileService } from './FileService';

export class SPService implements ISPService {
    GetSingleFieldValues(listUrl: string, fieldName: string): Promise<string[]> {
        throw new Error('Method not implemented.');
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

    AddListItem(listUrl: string, item: SpProductItem): Promise<SpProductItem> {
        throw new Error('Method not implemented.');
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
