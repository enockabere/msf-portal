"use client";

import ReusableTabbedTable from "../tables/ReusableTabbedTable";
import { useMemo } from "react";
import { decodeValue } from "../../utils/helpers";

interface Props {
  records: Array<Record<string, any>>
  profile: Record<string, any>
}
export default function TabbedTravelRequests({ records, profile }: Props) {
  const openRequests = useMemo(() => {
    return records.filter((item) => item.approvalStatus === 'Open')
  }, [records])

  const pendingRequests = useMemo(() => {
    return records.filter((item) => decodeValue(item.approvalStatus) === 'Pending Approval')
  }, [records])

  const approvedRequests = useMemo(() => {
    return records.filter((item) => item.approvalStatus === 'Released')
  }, [records])

  const tabData = [
    { key: "open", label: "Open", data: openRequests },
    { key: "pending", label: "Pending", data: pendingRequests },
    { key: "released", label: "Approved", data: approvedRequests },
  ];

  return <ReusableTabbedTable tabs={tabData} profile={profile} type="travel"/>;
}
