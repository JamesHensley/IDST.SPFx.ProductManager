export interface kvp {
    key: string;
    value: any;
    data?: any;
    selected: boolean;
}
export interface IFormInputProps {
    labelValue: string;
    fieldValue: string;
    fieldRef: string;
    editing: boolean;
    editLines?: number;
    options?: Array<kvp>;
    onUpdated: (newVal: string, fieldRef: string) => void;
}
