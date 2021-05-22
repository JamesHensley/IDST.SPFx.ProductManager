import { SpListItem } from '../models/SpListItem';
export interface ISPService {
    GetListItems(listUrl: string): Promise<Array<SpListItem>>;
    GetListItemByGuid(listUrl: string, guid: string): Promise<SpListItem>;
}
