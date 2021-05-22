import { SpListItem } from '../models/SpListItem';
import { ISPService } from './ISPService';

export class SPService implements ISPService {
    GetListItemByGuid(listUrl: string, guid: string): Promise<SpListItem> {
        throw new Error('Method not implemented.');
    }

    GetListItems(listUrl: string): Promise<Array<SpListItem>> {
        return new Promise<Array<SpListItem>>((resolve, reject) => {
            resolve([]);
        });
    }
}
