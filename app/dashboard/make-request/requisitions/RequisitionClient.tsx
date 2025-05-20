"use client";

import TabbedRequisitionRequests from "@/app/components/requisitions/TabbedRequisitionRequests";
import {useEffect, useState} from "react";
import {getResource} from "@/app/lib/api/http";
import {toast} from "react-toastify";
import {Briefcase, PlusCircle, ShoppingCartIcon, Store, User, Wallet} from "lucide-react";
import SummaryCards from "@/app/components/cards/SummaryCards";
import CustomModal from "@/app/components/modals/CustomModal";
import RequisitionForm from "@/app/components/requisitions/forms/RequisitionForm";

export default function RequisitionClient() {
    const [requisitions, setRequisitions] = useState([])

    const handleNewRequisitionRequestClick = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const [showModal, setShowModal] = useState(false);

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

    const cards = [
        {
            title: "Open Requisitions",
            value: 79,
            description: "Open Requisitions",
            icon: <Briefcase size={28} />,
            bgColorClass: "bg-light-warning",
            textColorClass: "text-warning",
            onClick: () => { }, // You can add modal trigger logic later
        },
        {
            title: "Pending Requisitions",
            value: 40,
            description: "Pending Requisitions",
            icon: <User size={28} />,
            bgColorClass: "bg-light-success",
            textColorClass: "text-success",
        },
        {
            title: "Approved Requisitions",
            value: 27,
            description: "Approved Requisitions",
            icon: <ShoppingCartIcon size={28} />,
            bgColorClass: "bg-light-info",
            textColorClass: "text-info",
        },
        {
            title: "Total Requisitions",
            value: 13,
            description: "Total Requisition",
            icon: <Store size={28} />,
            bgColorClass: "bg-light-warning",
            textColorClass: "text-warning",
        },
    ];

    return (
        <div className="page-content dashboard-container p-3">
            <div className="row gx-1 mb-2">
                <div className="col-12">
                    <SummaryCards
                        cards={cards}
                        layout="horizontal"
                        currentPlacement="top"
                        onPlacementChange=""
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
