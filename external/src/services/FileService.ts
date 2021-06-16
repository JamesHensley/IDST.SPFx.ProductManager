export class FileService {
    public static GetFileBuffer(file: File): Promise<ArrayBuffer> {
        return new Promise<ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader();

            //reader.onloadend = (e: ProgressEvent<FileReader>) => resolve(e.target.result);
            reader.onloadend = (e: any) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsArrayBuffer(file);
        });
    }

    public static BufferToString(buff: ArrayBuffer): string {
        return '';
    }
}
/*

*/