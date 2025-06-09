"use client";

import ReusableTabbedTable from "../tables/ReusableTabbedTable";
import { useMemo } from "react";
import { decodeValue } from "@/app/utils/helpers";

interface Props {
    records: Array<Record<string, any>>
}
export default function TabbedRequisitionRequests({ records }: Props) {
    const openRequisitions = useMemo(() => {
        return records.filter((item) => item.status === 'Open')
    }, [records])

    const pendingApprovalRequisitions = useMemo(() => {
        return records.filter((item) => decodeValue(item.status) === 'Pending Approval')
    }, [records])

    const releasedRequisitions = useMemo(() => {
        return records.filter((item) => item.status === 'Released')
    }, [records])

    const tabData = [
        { key: "open", label: "Open", data: openRequisitions },
        { key: "pending-approval", label: "Pending Approval", data: pendingApprovalRequisitions },
        { key: "released", label: "Released", data: releasedRequisitions },
    ];

    return <ReusableTabbedTable tabs={tabData} type="requisition"/>;
}
