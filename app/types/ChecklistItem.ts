export interface ChecklistItem {
    id: string;
    documentNo: string;
    lineNo: number;
    checklistItem: string;
    travellerName: string;
    expiryDate?: string;
    checklistType: string;
    checklistItemDescription: string;
    documentType: string;
    has: boolean;
    requiresAttachment: boolean;
    renewable: boolean;
    verified: boolean;
    relatedDocumentCode: string;
    attachments: Array<Record<string, any> | []>;
    [key: string]: any;
}
