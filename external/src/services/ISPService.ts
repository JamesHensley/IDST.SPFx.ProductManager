import { SpListAttachment, SpProductItem } from '../models/SpListItem';
export interface ISPService {
    /** Gets all the products in the system */
    GetListItems(listUrl: string): Promise<Array<SpProductItem>>;

    /** Gets a single product by it's GUID */
    GetListItemByGuid(listUrl: string, guid: string): Promise<SpProductItem>;

    /** Creates a new product in SharePoint */
    AddListItem(listUrl: string, item: SpProductItem): Promise<SpProductItem>;

    /** Updates an existing product in SharePoint */
    UpdateListItem(listUrl: string, item: SpProductItem): Promise<SpProductItem>;

    /** Marks the product as inactive so it wont show on lists or affect metrics */
    RemoveListItem(listUrl: string, item: SpProductItem): Promise<void>;

    /** Adds an attachment to the document library */
    AddAttachment(listUrl: string, productGuid: string, fileList: FileList): Promise<Array<SpListAttachment>>;

    /** Gets an array of the attachments for a single product */
    GetAttachmentsForGuid(listUrl: string, guid: string): Promise<Array<SpListAttachment>>;

    /** Gets all the attachments in the document library */
    GetAttachmentItems(listUrl: string): Promise<Array<SpListAttachment>>;

    /** Returns a single field for all the products in SharePoint */
    GetSingleFieldValues(listUrl: string, fieldName: string): Promise<Array<string>>;
}
