"use client";

import TabbedRequisitionRequests from "@/app/components/requisitions/TabbedRequisitionRequests";
import { useEffect, useMemo, useState } from "react";
import { codeUnit, getResource } from "@/app/lib/api/http";
import {toast} from "react-toastify";
import {Briefcase, PlusCircle, ShoppingCartIcon, Store, User} from "lucide-react";
import SummaryCards from "@/app/components/cards/SummaryCards";
import CustomModal from "@/app/components/modals/CustomModal";
import RequisitionForm from "@/app/components/requisitions/forms/RequisitionForm";
import { useSession } from "next-auth/react";

interface Statistics {
    totalRequisitions: number;
    totalUserRequisitions: number;
    totalPurchaseRequisitions: number;
    totalStoreRequisitions: number;
}

export default function RequisitionClient() {
    const [requisitions, setRequisitions] = useState([])
    const [statistics, setStatistics] = useState<Statistics>({
        totalRequisitions: 0,
        totalUserRequisitions: 0,
        totalPurchaseRequisitions: 0,
        totalStoreRequisitions: 0,
    });
    const { data: session } = useSession();

    const handleNewRequisitionRequestClick = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchRequisitions = async (status?: string) => {
            try {
                let filters = `contains(requestedByFor, '${session?.user?.profile?.no || ""}')`;

                if (status) {
                    filters += ` and status eq ${status}`;
                }

                const res = await getResource('requisitions', {
                    params: {
                        $filter: filters,
                    }
                });

                if (res.error) {
                    throw new Error(res.error.message);
                } else {
                    setRequisitions([...res.value])
                }
            } catch (error: any) {
                toast.error(error.message);
                console.log('Error fetching requisitions!', error.message)
            }
        };

        const fetchStatistics = async () => {
            try {
                const res = await codeUnit("getRequisitionStats", {
                    data: {
                        employeeNo: session?.user?.profile?.no || ""
                    }
                });

                if (res.error) {
                    throw new Error(res.error.message);
                }

                setStatistics({...JSON.parse(res.value)})
            } catch (error: any) {
                toast.error(error.message);
            }
        };

        fetchRequisitions();
        fetchStatistics();
    }, [session?.user?.profile?.no])

    const cards = useMemo(() => {
        return [
            {
                title: "User Requisitions",
                value: statistics.totalUserRequisitions,
                description: "User Requisitions",
                icon: <User size={28} />,
                bgColorClass: "bg-light-success",
                textColorClass: "text-success",
            },
            {
                title: "Store Requisitions",
                value: statistics.totalStoreRequisitions,
                description: "Store Requisitions",
                icon: <Briefcase size={28} />,
                bgColorClass: "bg-light-warning",
                textColorClass: "text-warning",
                onClick: () => { }, // You can add modal trigger logic later
            },
            {
                title: "Purchase Requisitions",
                value: statistics.totalPurchaseRequisitions,
                description: "Purchase Requisitions",
                icon: <ShoppingCartIcon size={28} />,
                bgColorClass: "bg-light-info",
                textColorClass: "text-info",
            },
            {
                title: "Total Requisitions",
                value: statistics.totalRequisitions,
                description: "Total Requisition",
                icon: <Store size={28} />,
                bgColorClass: "bg-light-warning",
                textColorClass: "text-warning",
            },
        ];
    }, [statistics.totalPurchaseRequisitions, statistics.totalRequisitions, statistics.totalStoreRequisitions, statistics.totalUserRequisitions]);

    return (
        <div className="page-content dashboard-container p-3">
            <div className="row gx-1 mb-2">
                <div className="col-12">
                    <SummaryCards
                        cards={cards}
                        layout="horizontal"
                        currentPlacement="top"
                        actionButton={
                            <button
                                className="btn bg-danger text-white btn-md"
                                onClick={handleNewRequisitionRequestClick}
                            >
                                <i className="fa fa-plus me-1" />
                                New Requisition
                            </button>
                        }
                    />
                </div>
            </div>

            <div className="row gx-1">
                <div className="col-lg-12">
                    <div className="card h-100 p-2">
                        <TabbedRequisitionRequests records={requisitions} />
                    </div>
                </div>
            </div>

            <CustomModal
                show={showModal}
                onClose={handleCloseModal}
                title="New Requisition"
                size="xl"
                titleIcon={<PlusCircle size={18} className="text-white" />}
            >
                <div className="row">
                    <div className="col-md-12">
                        <RequisitionForm />
                    </div>
                </div>
            </CustomModal>
        </div>
    );
}
