export interface IFormInputProps {
    labelValue: string;
    fieldValue: string;
    fieldRef: string;
    editing: boolean;
    editLines?: number;
    onUpdated: (newVal: string, fieldRef: string) => void;
    toolTip?: string;
    onGetErrorMessage?: (val: string) => string;
}
