import CustomModal from "@/app/components/modals/CustomModal";
import { ReactNode, useRef } from "react";
import { PlusCircle } from "lucide-react";
import { codeUnit } from "@/app/lib/api/http";
import Swal from "sweetalert2";
import { ApprovalDocs } from "@/app/types/approval";

const ApprovalDetailsModal = ({
    showModal,
    setShowModal,
    allApprovalDocuments,
    loading,
    currentDocument,
    documentNavigationHandler,
    children
}: {
    showModal: boolean,
    setShowModal: (value: boolean) => void,
    allApprovalDocuments: ApprovalDocs[],
    loading: boolean,
    currentDocument: number,
    documentNavigationHandler: (value: number) => void,
    children: ReactNode
}) => {
    const approvalDocument = allApprovalDocuments?.[0];
    const comment = useRef<HTMLElement | null>(null);

    const delegateApproval = async () => {
        const res = await codeUnit('delegateApproval', {
            data: {
                docNo: approvalDocument?.documentNo,
                employeeNo: approvalDocument?.approverID,
            }
        })


        if (res.error || res.success === false) {
            const rawMsg =
                res?.rawResponse?.error?.message ||
                res?.error?.message ||
                res?.error?.details?.[0]?.message;

            console.error("🔴 API returned error:", res);
            Swal.fire("Error", rawMsg || "Delegate approval request failed!", "error");
            return;
        }

        Swal.fire(
            "Success",
            `Approval Document #${approvalDocument?.documentNo} delegated successfully!`,
            "success"
        );
    }

    const rejectApproval = async () => {
        const { value: text } = await Swal.fire({
            title: "Do you want to Reject this Request?",
            showCancelButton: true,
            confirmButtonText: "Reject",
            input: "text",
            inputLabel: "Comment on the reason of rejecting this request",
            inputPlaceholder: "Enter your comment here...",

            inputValidator: (value) => {
                if (!value) {
                    return "You need to write something!";
                }
            }
        });

        console.log('input value', text)

        if (text) {
            try {
                const res = await codeUnit('rejectApprovalDocument', {
                    data: {
                        docNo: approvalDocument?.documentNo,
                        employeeNo: approvalDocument?.approverID,
                        rejectReason: comment.current, // use input value
                    }
                });

                console.log('reject res', res)

                if (res.error || res.success === false) {
                    const rawMsg =
                        res?.rawResponse?.error?.message ||
                        res?.error?.message ||
                        res?.error?.details?.[0]?.message;

                    console.error("🔴 API returned error:", res);
                    Swal.fire("Error", rawMsg || "Reject approval request failed!", "error");
                    return;
                }

                Swal.fire(
                    "Success",
                    `Approval Document #${approvalDocument?.documentNo} rejected successfully!`,
                    "success"
                );
            } catch (err) {
                console.error("❌ Exception:", err);
                Swal.fire("Error", "An unexpected error occurred.", "error");
            }
        } else if (text.isDenied) {
            Swal.fire("Changes are not saved", "", "info");
        }
    }

    const approveRequest = async () => {
        const res = await codeUnit('approveDocument', {
            data: {
                docNo: approvalDocument?.documentNo,
                employeeNo: approvalDocument?.approverID,
            }
        })

        console.log('approve res', res)

        if (res.error || res.success === false) {
            const rawMsg =
                res?.rawResponse?.error?.message ||
                res?.error?.message ||
                res?.error?.details?.[0]?.message;

            console.error("🔴 API returned error:", res);
            Swal.fire("Error", rawMsg || "Approval request failed!", "error");
            return;
        }

        Swal.fire(
            "Success",
            `Approval Document #${approvalDocument?.documentNo} approved successfully!`,
            "success"
        );
    }


    return (
        <CustomModal
            show={showModal}
            size={"xl"}
            onClose={() => setShowModal(false)}
            title={'Approval Details'}
            titleIcon={<PlusCircle size={18} className="text-white" />}
        >
            <div className="mb-2 gap-x-2 d-flex justify-content-end">
                <button className="btn btn-warning" disabled={ !allApprovalDocuments.length } onClick={delegateApproval}>Delegate</button>
                <button className="btn btn-primary ms-2" disabled={ !allApprovalDocuments.length } onClick={rejectApproval}>Reject</button>
                <button className="btn btn-success ms-2" disabled={ !allApprovalDocuments.length } onClick={approveRequest}>Approve</button>
            </div>

            <div className="">
                {loading && (<div>
                    <p className="">Loading approval documents.......</p>
                </div>)}
                {!loading && (
                    <>
                        <iframe
                            loading="eager"
                            src={`data:application/pdf;base64,${allApprovalDocuments.at(currentDocument)?.pdfAttachment}`}
                            width="100%"
                            height="600px">
                        </iframe>
                    </>

                )}

            </div>
            {children}

            <div className="mb-2 gap-x-2 d-flex justify-content-end">
                <button className="btn btn-warning" disabled={currentDocument === 0} onClick={() => documentNavigationHandler(-1)}>Prev</button>
                <button className="btn btn-primary ms-2" disabled={currentDocument === (allApprovalDocuments.length - 1)} onClick={() => documentNavigationHandler(+1)}>Next</button>
            </div>

        </CustomModal>
    )
}

export default ApprovalDetailsModal;
