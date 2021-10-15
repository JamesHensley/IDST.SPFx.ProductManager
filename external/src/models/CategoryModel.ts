export class CategoryModel {
    public constructor(init?: Partial<CategoryModel>) {
        Object.assign(this, init);
    }

    active: boolean;
    categoryId: string;
    categoryText: string;
    categoryShortName: string;
    categoryDescription: string;
}
