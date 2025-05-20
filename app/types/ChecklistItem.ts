export interface ChecklistItem {
    id: string;
    documentNo: string;
    lineNo: string;
    checklistItem: string;
    travellerName: string;
    expiryDate: string;
    checklistType: string;
    checklistItemDescription: string;
    documentType: string;
    has: boolean;
    requiresAttachment: boolean;
    renewable: boolean;
    verified: boolean;
}
