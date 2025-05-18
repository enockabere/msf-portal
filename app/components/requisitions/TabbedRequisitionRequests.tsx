"use client";

import ReusableTabbedAdvanceTable from "../tables/ReusableTabbedAdvanceTable";
import { useMemo } from "react";
import { decodeValue } from "@/app/utils/helpers";

interface Props {
    records: Array<Record<string, any>>
}
export default function TabbedRequisitionRequests({ records, profile }: Props) {
    const userRequisitions = useMemo(() => {
        return records.filter((item) => item.type === 'User Requisitions')
    }, [records])

    const purchaseRequisitions = useMemo(() => {
        return records.filter((item) => decodeValue(item.type) === 'Purchase Requisitions')
    }, [records])

    const storeRequisitions = useMemo(() => {
        return records.filter((item) => item.type === 'Store Requisitions')
    }, [records])

    const tabData = [
        { key: "user", label: "User Requisitions", data: userRequisitions },
        { key: "purchase", label: "Purchase Requisitions", data: purchaseRequisitions },
        { key: "store", label: "Store Requisitions", data: storeRequisitions },
    ];

    return <ReusableTabbedAdvanceTable tabs={tabData} type="requisition"/>;
}
