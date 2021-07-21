import { SpListAttachment, SpProductItem } from '../models/SpListItem';
import { IAppSettings } from '../webparts/ProductManager/ProductManagerWebPart';

export interface ISPService {
    /** Gets all the products in the system */
    GetListItems(listTitle: string): Promise<Array<SpProductItem>>;

    /** Gets a single product by it's GUID */
    GetListItemByGuid(listTitle: string, guid: string): Promise<SpProductItem>;

    /** Creates a new product in SharePoint */
    AddListItem(listTitle: string, item: SpProductItem): Promise<SpProductItem>;

    /** Updates an existing product in SharePoint */
    UpdateListItem(listTitle: string, item: SpProductItem): Promise<SpProductItem>;

    /** Marks the product as inactive so it wont show on lists or affect metrics */
    RemoveListItem(listTitle: string, item: SpProductItem): Promise<void>;

    /** Adds an attachment to the document library */
    AddAttachment(listTitle: string, productGuid: string, fileList: FileList): Promise<Array<SpListAttachment>>;

    /** Gets an array of the attachments for a single product */
    GetAttachmentsForGuid(listTitle: string, guid: string): Promise<Array<SpListAttachment>>;

    /** Gets all the attachments in the document library */
    GetAttachmentItems(listTitle: string): Promise<Array<SpListAttachment>>;

    /** Returns a single field for all the products in SharePoint */
    GetSingleFieldValues(listTitle: string, fieldName: string): Promise<Array<string>>;

    CopyFile(srcUrl: string, destUrl: string, suffix: string): Promise<boolean>;

    SaveAppSettings(listTitle: string, listRecord: IAppSettings): Promise<IAppSettings>;
}
