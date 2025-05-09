import CustomModal from "@/app/components/modals/CustomModal";
import { ReactNode, useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { codeUnit } from "@/app/lib/api/http";
import Swal from "sweetalert2";

export default ({showModal, setShowModal, selectedApprovalDocument, selectedApprovalAttachments, loading,children}: {showModal: boolean, setShowModal: (value: boolean) => void, selectedApprovalDocument: object, selectedApprovalAttachments: Array<Record<string, any>>, loading: boolean,children: ReactNode}) => {
    const approvalDocument = selectedApprovalDocument?.value[0];

    console.log('attachments', selectedApprovalAttachments)

    const delegateApproval = async () => {
        const res =  await codeUnit('delegateApproval', {
            data: {
                docNo: approvalDocument?.documentNo,
                employeeNo: approvalDocument?.approverID,
            }
        })

        if (!res.ok || res.error || res.success === false) {
            const rawMsg =
                res?.rawResponse?.error?.message ||
                res?.error?.message ||
                res?.error?.details?.[0]?.message;

            console.error("🔴 API returned error:", res);
            Swal.fire("Error", rawMsg || "Rejcet approval requst failed!", "error");
            return;
        }

        Swal.fire(
            "Success",
            `Approval Document #${approvalDocument?.documentNo} delegated successfully!`,
            "success"
        );
    }

    const rejectApproval = async () => {
        const ipAPI = "//api.ipify.org?format=json";
        const inputValue = ipAPI;
        const result = await Swal.fire({
            title: "Do you want to Reject this Request?",
            showCancelButton: true,
            confirmButtonText: "Reject",
            input: "text",
            inputValue,
            inputLabel: "Comment on the reason of rejecting this request",
            inputPlaceholder: "Enter your comment here...",

            inputValidator: (value) => {
                if (!value) {
                    return "You need to write something!";
                }
            }
        });

        console.log('input value', result.value)

        if (result.isConfirmed) {
            try {
                const res = await codeUnit('rejectApprovalDocument', {
                    data: {
                        docNo: approvalDocument?.documentNo,
                        employeeNo: approvalDocument?.approverID,
                        rejectReason: result.value, // use input value
                    }
                });

                if (!res.ok || res.error || res.success === false) {
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
        } else if (result.isDenied) {
            Swal.fire("Changes are not saved", "", "info");
        }
    }

    const approveRequest = async () => {
        const res =  await codeUnit('approveDocument', {
            data: {
                docNo: approvalDocument?.documentNo,
                employeeNo: approvalDocument?.approverID,
            }
        })

        if (res.error) {
            const rawMsg =
                res?.rawResponse?.error?.message ||
                res?.error?.message ||
                res?.error?.details?.[0]?.message;

            console.error("🔴 API returned error:", res);
            Swal.fire("Error", rawMsg || "Rejcet approval requst failed!", "error");
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
                <button className="btn btn-warning" onClick={delegateApproval}>Delegate</button>
                <button className="btn btn-primary ms-2" onClick={rejectApproval}>Reject</button>
                <button className="btn btn-success ms-2" onClick={approveRequest}>Approve</button>
            </div>

            <div className="">
                {loading && (<div>
                    <p className="">Loading approval documents.......</p>
                </div>)}
                {!loading && (
                    <>
                        <iframe
                            loading="eager"
                            src={`data:application/pdf;base64,${selectedApprovalDocument?.value[0]?.pdfAttachment}`}
                            width="100%"
                            height="600px">
                        </iframe>

                        {
                            selectedApprovalAttachments?.value.map(attachment => {
                                    const src = `data:application/pdf;base64,${attachment.base64Attachment}`;
                                    <>
                                        <p key={ attachment?.attachedDate } className="">{ attachment?.attachedDate }</p>
                                        <iframe key={ attachment?.attachedDate }
                                                src={`data:application/pdf;base64,${src}`}
                                                width="100%"
                                                height="600px">
                                        </iframe>
                                    </>


                                }
                            )}
                    </>

                )}

            </div>
            {children}

        </CustomModal>
    )
}

