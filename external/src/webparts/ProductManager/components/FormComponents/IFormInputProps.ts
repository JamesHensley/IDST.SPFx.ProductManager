export interface KeyValPair {
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
    options?: Array<KeyValPair>;
    onUpdated: (newVal: string, fieldRef: string) => void;
}
