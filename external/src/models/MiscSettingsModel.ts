export class MiscSettingsModel {
    emailSenderName: string;

    /** The name of the list/table where our serialized product data is stored */
    productListTitle: string;

    /** The location for the document-library where our attachments are saved */
    documentLibraryName: string;

    /** The name of the document library holding template documents */
    documentTemplateLibraryName: string;

    /** The location for the document-library where our final products are published to */
    publishingLibraryUrl: string;

    /** The location for the FluentUI assets */
    fluentUiCDN: string;
}
