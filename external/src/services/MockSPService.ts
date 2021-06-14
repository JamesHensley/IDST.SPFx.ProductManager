import { SpListAttachment, SpProductItem } from '../models/SpListItem';
import { Faker } from './FakerService';
import { ISPService } from './ISPService';

export class MockSPService implements ISPService {
    private _mockedProductItems: Array<SpProductItem> = [];
    private _mockedAttachmentItems: Array<SpListAttachment> = [];
    private get mockedProductItems(): Array<SpProductItem> {
        if (this._mockedProductItems.length < 125) {
            for (let x = this._mockedProductItems.length; x < 125; x++) {
                this._mockedProductItems.push(Faker.CreateFakeItem());
            }
        }
        return this._mockedProductItems;
    }
    private set mockedProductItems(val: Array<SpProductItem>) {
        this._mockedProductItems = val;
    }
    private get mockedAttachmentItems(): Array<SpListAttachment> {
        if (this._mockedAttachmentItems.length === 0) {
            this._mockedProductItems.forEach(mP => {
                for (let x = 0; x < Math.round(Math.random() * 3); x++) {
                    this._mockedAttachmentItems.push(Faker.CreateFakeAttachment(mP.Guid));
                }
            });
        }

        return this._mockedAttachmentItems;
    }
    private set mockedAttachmentItems(val: Array<SpListAttachment>) {
        this._mockedAttachmentItems = val;
    }

    GetSingleFieldValues(listUrl: string, fieldName: string): Promise<Array<string>> {
        const retVal = this._mockedProductItems.map(d => d[fieldName]).filter((f, i, e) => e.indexOf(f) === i).sort();
        return Promise.resolve(retVal);
    }

    GetAttachmentsForGuid(listUrl: string, guid: string): Promise<Array<SpListAttachment>> {
        return Promise.resolve(this.mockedAttachmentItems.filter(f => f.LinkedProductGuid === guid));
    }

    AddListItem(listUrl: string, item: SpProductItem): Promise<SpProductItem> {
        this.mockedProductItems = this.mockedProductItems.concat([item]);
        return Promise.resolve(item);
    }

    AddAttachment(listUrl: string, item: SpListAttachment): Promise<SpListAttachment> {
        this.mockedAttachmentItems = this.mockedAttachmentItems.concat([item]);
        return Promise.resolve(item);
    }

    UpdateListItemByGuid(listUrl: string, guid: string, item: SpProductItem): Promise<SpProductItem> {
        this.mockedProductItems = this.mockedProductItems.reduce((t, n) => n.Guid === guid ? t.concat([item]) : t.concat([n]), []);
        return Promise.resolve(item);
    }

    GetListItems(listUrl: string): Promise<Array<SpProductItem>> {
        return new Promise<Array<SpProductItem>>((resolve, reject) => {
            fetch(listUrl)
            .then(data => data.json())
            .then((data: Array<SpProductItem>) => {
                this.mockedProductItems = [].concat.apply(this.mockedProductItems, data)
                .filter((f, i, e) => e.map(m => m.GUID).indexOf(f.GUID) === i);

                resolve(this.mockedProductItems);
            })
            .catch(e => reject(e));
        });
    }

    GetAttachmentItems(listUrl: string): Promise<Array<SpListAttachment>> {
        return new Promise<Array<SpListAttachment>>((resolve, reject) => {
            fetch(listUrl)
            .then(data => data.json())
            .then((data: Array<SpListAttachment>) => {
                this.mockedAttachmentItems = [].concat.apply(this.mockedAttachmentItems, data)
                .filter((f: SpListAttachment, i, e: Array<SpListAttachment>) => e.map((m: SpListAttachment) => m.Id).indexOf(f.Id) === i);

                resolve(this.mockedAttachmentItems);
            })
            .catch(e => reject(e));
        });
    }

    GetListItemByGuid(listUrl: string, guid: string): Promise<SpProductItem> {
        return new Promise<SpProductItem>((resolve, reject) => {
            const prod = this.mockedProductItems.reduce((t,n) => n.Guid === guid ? n : t, null);
            resolve(prod);
        });
    }
}
