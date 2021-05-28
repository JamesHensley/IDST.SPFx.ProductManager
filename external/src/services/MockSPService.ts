import { SpListItem } from '../models/SpListItem';
import { Faker } from './FakerService';
import { ISPService } from './ISPService';

export class MockSPService implements ISPService {
    private _mockedProductItems: Array<SpListItem> = [];

    AddListItem(listUrl: string, item: SpListItem): Promise<SpListItem> {
        this._mockedProductItems = this._mockedProductItems.concat([item]);
        return Promise.resolve(item);
    }

    UpdateListItemByGuid(listUrl: string, guid: string, item: SpListItem): Promise<SpListItem> {
        this._mockedProductItems = this._mockedProductItems.reduce((t,n) => n.GUID===guid ? t.concat([item]) : t.concat([n]), []);
        return Promise.resolve(item);
    }

    GetListItems(listUrl: string): Promise<Array<SpListItem>> {
        return new Promise<Array<SpListItem>>((resolve, reject) => {
            fetch(listUrl)
            .then(data => data.json())
            .then((data: Array<SpListItem>) => {
                this._mockedProductItems = [].concat.apply(this._mockedProductItems, data)
                .filter((f, i, e) => e.map(m => m.GUID).indexOf(f.GUID) === i);

                if(this._mockedProductItems.length == 0) {
                    for(let x = 0; x<125; x++) {
                        this._mockedProductItems.push(Faker.CreateFakeItem())
                    }
                    //console.log(JSON.stringify(this._mockedProductItems, null, '    '));
                }
                resolve(this._mockedProductItems);
            })
            .catch(e => reject(e));
        });
    }

    GetListItemByGuid(listUrl: string, guid: string): Promise<SpListItem> {
        return new Promise<SpListItem>((resolve, reject) => {
            const prod = this._mockedProductItems.reduce((t,n) => n.GUID === guid ? n : t, null);
            resolve(prod);
        });
    }
}
