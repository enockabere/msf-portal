export interface Approval {
    documentType: string;
    documentNo: string;
    senderID: string;
    approverID: string;
    currencyCode: string;
    status: "Open" | "Pending Approval" | "Released";
    sendByName: string;
    approveForName: string;
    recordToApprove: string;
    approveForType: number;
    dateTimeSentForApproval: string;
    dueDate: string;
    entryNo: number
}

export interface ApprovalDocs {
    [key: string]: any
}