"use client";

import ReusableTabbedAdvanceTable from "../tables/ReusableTabbedAdvanceTable";
import { useMemo } from "react";

interface Props {
    records: Array<Record<string, any>>
}
export default function TabbedRequisitionRequests({ records, profile }: Props) {
    const userRequisitions = useMemo(() => {
        return records.filter((item) => item.documentType === 'Purchase_x0020_Requisition')
    }, [records])

    const purchaseRequisitions = useMemo(() => {
        return records.filter((item) => item.documentType === 'Purchase_x0020_Requisition')
    }, [records])

    const storeRequisitions = useMemo(() => {
        return records.filter((item) => item.documentType === 'Purchase_x0020_Requisition')
    }, [records])

    const tabData = [
        { key: "user", label: "User Requisitions", data: userRequisitions },
        { key: "purchase", label: "Purchase Requisitions", data: purchaseRequisitions },
        { key: "store", label: "Store Requisitions", data: storeRequisitions },
    ];

    return <ReusableTabbedAdvanceTable tabs={tabData} type="requisition"/>;
}
