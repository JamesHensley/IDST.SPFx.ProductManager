import { SpListItem } from '../models/SpListItem';
export interface ISPService {
    GetListItems(listUrl: string): Promise<Array<SpListItem>>;
    GetListItemByGuid(listUrl: string, guid: string): Promise<SpListItem>;
    UpdateListItemByGuid(listUrl: string, guid: string, item: SpListItem): Promise<SpListItem>;
    AddListItem(listUrl: string, item: SpListItem): Promise<SpListItem>;
}
