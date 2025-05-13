import CustomModal from "@/app/components/modals/CustomModal";
import { ReactNode } from "react";
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
    onActionCompleted,
    children
}: {
    showModal: boolean,
    setShowModal: (value: boolean) => void,
    allApprovalDocuments: ApprovalDocs[],
    loading: boolean,
    currentDocument: number,
    documentNavigationHandler: (value: number) => void,
    onActionCompleted: () => void,
    children: ReactNode
}) => {
    const approvalDocument = allApprovalDocuments?.[0];

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
        // Close the modal first
        setShowModal(false);

        setTimeout(async () => {
            const result = await Swal.fire({
                title: "Do you want to Reject this Request?",
                input: "text",
                inputLabel: "Comment on the reason of rejecting this request",
                inputPlaceholder: "Enter your comment here...",
                showCancelButton: true,
                confirmButtonText: "Reject",
                cancelButtonText: "Cancel",
                preConfirm: (value) => {
                    if (!value || value.trim() === "") {
                        Swal.showValidationMessage("You need to write something!");
                        return false;
                    }
                    return value;
                },
            });

            if (result.isConfirmed && result.value) {
                const res = await codeUnit("rejectApprovalDocument", {
                    data: {
                        docNo: approvalDocument?.documentNo,
                        employeeNo: approvalDocument?.approverID,
                        rejectReason: result.value,
                    },
                });

                if (res.error || res.success === false) {
                    Swal.fire("Error", "Reject approval request failed!", "error");
                    return;
                }

                Swal.fire("Success", "Document rejected successfully!", "success");
            }

            onActionCompleted();
        }, 300); // Give time for modal to unmount
    };




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
