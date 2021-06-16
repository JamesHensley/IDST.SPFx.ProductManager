import { IClientSideWebPartStatusRenderer } from '@microsoft/sp-webpart-base';
import { SpListAttachment, SpProductItem } from '../models/SpListItem';
export interface ISPService {
    GetListItems(listUrl: string): Promise<Array<SpProductItem>>;
    GetListItemByGuid(listUrl: string, guid: string): Promise<SpProductItem>;
    UpdateListItemByGuid(listUrl: string, guid: string, item: SpProductItem): Promise<SpProductItem>;
    AddListItem(listUrl: string, item: SpProductItem): Promise<SpProductItem>;

    AddAttachment(listUrl: string, productGuid: string, fileList: FileList): Promise<Array<SpListAttachment>>;
    GetAttachmentsForGuid(listUrl: string, guid: string): Promise<Array<SpListAttachment>>;
    GetAttachmentItems(listUrl: string): Promise<Array<SpListAttachment>>;

    GetSingleFieldValues(listUrl: string, fieldName: string): Promise<Array<string>>;
}
