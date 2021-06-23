import { IColumn } from '@fluentui/react';

export class FilterService {
    /** Field definitions for the table */
    private static displayedFields: Array<IColumn> = [];

    private static filterText = '';
    public static get FilterText(): string { return this.filterText; }
    public static set FilterText(val: string) { this.filterText = val; }

    private static sortField = 'openDate';
    public static get SortField(): string { return this.sortField; }
    public static set SortField(val: string) { this.sortField = val; }

    private static sortDir = 1;
    public static set SortDir(val: number) { this.sortDir = val; }
    public static get SortDir(): number { return this.sortDir; }

    /** Used to register an array of columns with the service.  Will only be executed once no matter how many times it's called */
    public static RegisterListFields(columns: Array<IColumn>): void {
        if (!this.displayedFields || this.displayedFields.length === 0) {
            this.displayedFields = columns;
        }
    }

    public static set DisplayedFields(val: Array<IColumn>) {
      this.displayedFields = this.displayedFields
      .map(d => { d.data.displayed = (val.map(d => d.fieldName)).indexOf(d.fieldName) >= 0; return d; });
    }

    public static get DisplayedFields(): Array<IColumn> {
      return this.displayedFields
      .map(d => {
        // Handle the sorting icons... actual data/list sorting is handled by the onClick handler for the columns
        d.isSorted = this.SortField === d.fieldName;
        d.isSortedDescending = d.isSorted && this.SortDir === -1;
        return d;
      })
      .filter(f => f.data.displayed);
    }
}
