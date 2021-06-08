import { SpListAttachment, SpProductItem } from '../models/SpListItem';
import { ISPService } from './ISPService';

import { SPHttpClient, SPHttpClientConfiguration } from '@microsoft/sp-http';
import { IODataList, IODataListItem, IODataWeb } from '@microsoft/sp-odata-types';

export class SPService implements ISPService {
    GetAttachmentItems(listUrl: string): Promise<SpListAttachment[]> {
        throw new Error('Method not implemented.');
    }

    GetAttachmentsForGuid(listUrl: string, guid: string): Promise<Array<SpListAttachment>> {
        throw new Error('Method not implemented.');
    }

    AddAttachment(listUrl: string, item: SpListAttachment): Promise<SpListAttachment> {
        throw new Error('Method not implemented.');
    }

    AddListItem(listUrl: string, item: SpProductItem): Promise<SpProductItem> {
        throw new Error('Method not implemented.');
    }

    UpdateListItemByGuid(listUrl: string, guid: string, item: SpProductItem): Promise<SpProductItem> {
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
}
