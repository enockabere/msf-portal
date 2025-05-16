"use client";

import ReusableTabbedAdvanceTable from "../tables/ReusableTabbedAdvanceTable";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { getResource } from "@/app/lib/api/http";
import { toast } from "react-toastify";

export default function TabbedTravelRequests() {
  const { data:session } = useSession()
  const profileNo = session?.user?.profile?.no
  const [travelRequests, setTravelRequests] = useState([])

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await getResource('travelRequests', {
          params: {
            filters: {
              travellerNo: profileNo
            },
          }
        });

        if (res.error) {
          console.log('Travel request error: ', res.error);
          toast.error(res.error.message)
        } else {
          setTravelRequests([...res.value])
        }
      } catch (error: any) {
        console.log('Error fetching travel request!', error.message)
      }
    }

    fetchRequests()
  }, [profileNo]);

  const openRequests = useMemo(() => {
    return travelRequests.filter((item) => item.approvalStatus === 'Open')
  }, [travelRequests])

  const pendingRequests = useMemo(() => {
    return travelRequests.filter((item) => item.approvalStatus === 'Pending Approval')
  }, [travelRequests])

  const approvedRequests = useMemo(() => {
    return travelRequests.filter((item) => item.approvalStatus === 'Released')
  }, [travelRequests])

  const tabData = [
    { key: "open", label: "Open", data: openRequests },
    { key: "pending", label: "Pending", data: pendingRequests },
    { key: "released", label: "Approved", data: approvedRequests },
  ];

  return <ReusableTabbedAdvanceTable tabs={tabData} />;
}
