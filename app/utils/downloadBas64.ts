import { fileTypeFromBuffer } from "file-type";

// Define a type for our MIME type to extension mapping
type MimeTypeMap = {
    [mimeType: string]: string;
};

const MIME_TYPE_MAP: MimeTypeMap = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'text/plain': 'txt',
    'text/csv': 'csv',
};

const DEFAULT_MIME_TYPE = 'application/octet-stream';
const DEFAULT_EXTENSION = 'bin';

export const downloadFileFromBase64 = async (
  base64: string,
  fileNameWithoutExt: string = "download"
): Promise<void> => {
    try {
        // Validate input
        if (!base64 || typeof base64 !== 'string') {
            throw new Error('Invalid base64 input');
        }

        const buffer = Buffer.from(base64, 'base64');

        // Detect file type
        const type = await fileTypeFromBuffer(buffer);
        const mimeType = type?.mime || DEFAULT_MIME_TYPE;

        // Get appropriate file extension
        const extension = MIME_TYPE_MAP[mimeType] || DEFAULT_EXTENSION;
        const fileName = `${fileNameWithoutExt}.${extension}`;

        // Create and trigger download
        const blob = new Blob([buffer], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error('Error downloading file:', error);
        throw error; // Re-throw to allow caller to handle
    }
};