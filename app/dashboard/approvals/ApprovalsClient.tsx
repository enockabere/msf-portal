"use client";

import dynamic from "next/dynamic";
import { ToastContainer } from "react-toastify";
import { useSession } from "next-auth/react";
const ApprovalDataTableTable = dynamic(
    () => import("@/app/components/approvals/ApprovalTable"),
    { ssr: false }
);

export default function ApprovalsClient() {
    const { data:employee } = useSession();




    return (
        <div className="page-content dashboard-container p-3">
            <ToastContainer position="top-right" autoClose={5000} />

            <ApprovalDataTableTable employeeNo={employee?.user?.profile?.number} />

        </div>
    );
}
