export class CategoryModel {
    public constructor(init?: Partial<CategoryModel>) {
        Object.assign(this, init);
    }

    categoryId: string;
    categoryText: string;
}
