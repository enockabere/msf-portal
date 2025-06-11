"use client";

import TabbedRequisitionRequests from "@/app/components/requisitions/TabbedRequisitionRequests";
import { useCallback, useEffect, useMemo, useState } from "react";
import { codeUnit, getResource } from "@/app/lib/api/http";
import { ToastContainer } from 'react-toastify';
import { Layers, PlusCircle, ShoppingCartIcon, Store, User } from "lucide-react";
import SummaryCards from "@/app/components/cards/SummaryCards";
import CustomModal from "@/app/components/modals/CustomModal";
import RequisitionForm from "@/app/components/requisitions/forms/RequisitionForm";
import { useSession } from "next-auth/react";
import { Requisition } from "@/app/types/requisition";
import Swal from "sweetalert2";

interface Statistics {
  totalRequisitions: number;
  totalUserRequisitions: number;
  totalPurchaseRequisitions: number;
  totalStoreRequisitions: number;
}

export default function RequisitionClient() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const {data: session} = useSession();

  const [statistics, setStatistics] = useState<Statistics>({
    totalRequisitions: 0,
    totalUserRequisitions: 0,
    totalPurchaseRequisitions: 0,
    totalStoreRequisitions: 0,
  });

  const fetchRequisitions = useCallback(async (documentType?: string) => {
    setIsLoading(true);
    try {
      let filters = `contains(requestedByFor, '${session?.user?.profile?.no || ""}')`;

      if (documentType) {
        filters += ` and documentType eq '${documentType}'`;
      }

      const res = await getResource('requisitions', {
        params: {
          $filter: filters,
        }
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      setRequisitions([...res.value]);
    } catch (error: any) {
      await Swal.fire("Error fetching requisitions", error.message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.profile?.no]);

  const fetchStatistics = useCallback(async () => {
    try {
      const res = await codeUnit("getRequisitionStats", {
        data: {
          employeeNo: session?.user?.profile?.no || ""
        }
      });

      if (res.error) {
        throw new Error(res.error.message);
      }
      setStatistics({...JSON.parse(res.value)});
    } catch (error: any) {
      console.error('Error fetching statistics:', error.message);
    }
  }, [session?.user?.profile?.no]);

  const handleRefresh = () => {
    fetchRequisitions();
    fetchStatistics();
  };

  const handleNewRequisitionRequestClick = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  useEffect(() => {
    if (session?.user?.profile?.no) {
      fetchRequisitions();
      fetchStatistics();
    }
  }, [fetchRequisitions, fetchStatistics, session?.user?.profile?.no]);

  const cards = useMemo(() => [
    {
      title: "User Requisitions",
      value: statistics.totalUserRequisitions,
      description: "User Requisitions",
      icon: <User size={28}/>,
      bgColorClass: "bg-light-success",
      textColorClass: "text-success",
      onClick: async () => {
        await fetchRequisitions('User Requisition');
      },
    },
    {
      title: "Store Requisitions",
      value: statistics.totalStoreRequisitions,
      description: "Store Requisitions",
      icon: <Store size={28}/>,
      bgColorClass: "bg-light-warning",
      textColorClass: "text-warning",
      onClick: async () => {
        await fetchRequisitions('Store Requisition');
      },
    },
    {
      title: "Purchase Requisitions",
      value: statistics.totalPurchaseRequisitions,
      description: "Purchase Requisitions",
      icon: <ShoppingCartIcon size={28}/>,
      bgColorClass: "bg-light-info",
      textColorClass: "text-info",
      onClick: async () => {
        await fetchRequisitions('Purchase Requisition');
      },
    },
    {
      title: "Total Requisitions",
      value: statistics.totalRequisitions,
      description: "Total Requisitions",
      icon: <Layers size={28}/>,
      bgColorClass: "bg-light-warning",
      textColorClass: "text-warning",
      onClick: async () => {
        await fetchRequisitions();
      },
    },
  ], [fetchRequisitions, statistics.totalPurchaseRequisitions, statistics.totalRequisitions, statistics.totalStoreRequisitions, statistics.totalUserRequisitions]);

  return (
    <div className="page-content dashboard-container p-3">
      <ToastContainer />
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
                disabled={isLoading}
              >
                <i className="fa fa-plus me-1"/>
                New Requisition
              </button>
            }
          />
        </div>
      </div>

      <div className="row gx-1">
        <div className="col-lg-12">
          <div className="card h-100 p-2">
            <TabbedRequisitionRequests
              records={requisitions}
              onRefresh={handleRefresh}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      <CustomModal
        show={showModal}
        onClose={handleCloseModal}
        title="New Requisition"
        size="xl"
        titleIcon={<PlusCircle size={18} className="text-white"/>}
      >
        <div className="row">
          <div className="col-md-12">
            <RequisitionForm
              onClose={handleCloseModal}
              onSuccess={handleRefresh}
            />
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
