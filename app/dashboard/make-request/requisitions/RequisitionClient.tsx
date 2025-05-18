"use client";

import TabbedRequisitionRequests from "@/app/components/requisitions/TabbedRequisitionRequests";
import {useEffect, useState} from "react";
import {getResource} from "@/app/lib/api/http";
import {toast} from "react-toastify";

export default function RequisitionClient() {
    const [requisitions, setRequisitions] = useState([])

    useEffect(() => {
        const fetchRequisitions = async () => {
            try {
                const res = await getResource('requisitions', {
                    params: {
                        // Params
                    }
                });

                if (res.error) {
                    console.log('Requisition fetch error: ', res.error);
                    toast.error(res.error.message)
                } else {
                    setRequisitions([...res.value])
                }
            } catch (error: any) {
                console.log('Error fetching requisitions!', error.message)
            }
        }

        fetchRequisitions();
    })

    return (
        <div className="page-content dashboard-container p-3">
            <div className="row gx-1">
                <div className="col-lg-12">
                    <div className="card h-100 p-2">
                        <TabbedRequisitionRequests records={requisitions} />
                    </div>
                </div>
            </div>
        </div>
    );
}
