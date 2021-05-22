import { SpListItem } from '../models/SpListItem';
import { Faker } from './FakerService';
import { ISPService } from './ISPService';

export class MockSPService implements ISPService {
    private _mockedProductItems: Array<SpListItem> = [];

    GetListItems(listUrl: string): Promise<Array<SpListItem>> {
        return new Promise<Array<SpListItem>>((resolve, reject) => {
            fetch(listUrl)
            .then(data => data.json())
            .then((data: Array<SpListItem>) => {
                this._mockedProductItems.push(Faker.CreateFakeItem());
                this._mockedProductItems = [].concat.apply(this._mockedProductItems, data)
                .filter((f, i, e) => e.map(m => m.GUID).indexOf(f.GUID) === i);

                console.log('Faked SPListItem: ', JSON.stringify(this._mockedProductItems, null, '  '));

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
