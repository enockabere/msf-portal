"use client";

import { useEffect, useState } from "react";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import { Wallet, Bell, Coins, BarChart } from "lucide-react";
import SummaryCards from "@/app/components/cards/SummaryCards";
import TabbedTravelRequests from "@/app/components/travel/TabbedTravelRequests";
import TravelRequestWizard from "@/app/components/travel/TravelRequestWizard";
import CustomModal from "@/app/components/modals/CustomModal";
import { useSession } from "next-auth/react";
import { getResource } from "@/app/lib/api/http";
import { toast } from "react-toastify";

export default function TravelClient() {
  const { setBreadcrumb } = useBreadcrumb();

  const { data: session } = useSession();
  const profileNo = session?.user?.profile?.no;
  const [travelRequests, setTravelRequests] = useState([]);
  const [profile, setProfile] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await getResource("travelRequests", {
          params: {
            filters: {
              travellerNo: profileNo,
            },
          },
        });

        if (res.error) {
          console.log("Travel request error: ", res.error);
          toast.error(res.error.message);
        } else {
          setTravelRequests([...res.value]);
        }
      } catch (error: any) {
        console.log("Error fetching travel request!", error.message);
      }
    };

    const fetchProfile = async () => {
      try {
        const res = await getResource("travelProfile", {
          params: {
            filters: {
              no: profileNo,
            },
          },
        });

        if (res.error) {
          console.log("Response Error: ", res.error);
          toast.error(res.error.message);
        } else {
          setProfile(res.value.at(0));
        }
      } catch (error: any) {
        console.log("Error fetching profile!", error.message);
      }
    };

    fetchRequests();
    fetchProfile();
  }, [profileNo]);

  const [showModal, setShowModal] = useState(false);

  const handleNewRequestClick = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const [placement, setPlacement] = useState<
    "right" | "top" | "bottom" | "left"
  >("top");
  useEffect(() => {
    const saved = localStorage.getItem("advancePlacement") as
      | "right"
      | "top"
      | "bottom"
      | "left"
      | null;

    if (saved && saved !== placement) {
      setPlacement(saved);
    }
  }, [placement]);

  const handleChangePlacement = (
    newPlacement: "right" | "top" | "bottom" | "left"
  ) => {
    setPlacement(newPlacement);
    localStorage.setItem("advancePlacement", newPlacement);
  };

  useEffect(() => {
    setBreadcrumb([
      { label: "Dashboard", path: "/dashboard" },
      { label: "Make Request", path: "/dashboard/make-request" },
      { label: "Travel Request", path: "/dashboard/make-request/travel" },
    ]);
  }, [setBreadcrumb]);

  const cards = [
    {
      title: "Unsettled",
      value: "KES 52,400",
      description: "Unsettled Amount",
      icon: <Wallet size={28} />,
      bgColorClass: "bg-light-warning",
      textColorClass: "text-warning",
      onClick: () => {}, // You can add modal trigger logic later
    },
    {
      title: "Open Travel Requests",
      value: "1 Pending",
      description: "Open Approvals",
      icon: <Bell size={28} />,
      bgColorClass: "bg-light-success",
      textColorClass: "text-success",
    },
    {
      title: "Pending Requests",
      value: "4",
      description: "Requests Pending Approval",
      icon: <Coins size={28} />,
      bgColorClass: "bg-light-info",
      textColorClass: "text-info",
    },
    {
      title: "Total",
      value: 13,
      description: "Total Requests",
      icon: <BarChart size={28} />,
      bgColorClass: "bg-light-warning",
      textColorClass: "text-warning",
    },
  ];

  return (
    <div className="page-content dashboard-container p-3">
      {placement === "top" && (
        <div className="row gx-1 mb-1">
          <div className="col-12">
            <SummaryCards
              cards={cards}
              layout="horizontal"
              currentPlacement="top"
              onPlacementChange={handleChangePlacement}
              actionButton={
                <button
                  className="btn bg-danger text-white btn-md"
                  onClick={handleNewRequestClick}
                >
                  <i className="fa fa-plus me-1" />
                  New Travel Request
                </button>
              }
            />
          </div>
        </div>
      )}

      <div className="row gx-1">
        {placement === "left" && (
          <>
            <div className="col-lg-3">
              <SummaryCards
                cards={cards}
                layout="horizontal"
                currentPlacement="top"
                onPlacementChange={handleChangePlacement}
                actionButton={
                  <button
                    className="btn bg-danger text-white btn-md"
                    onClick={handleNewRequestClick}
                  >
                    <i className="fa fa-plus me-1" />
                    New Travel Request
                  </button>
                }
              />
            </div>
            <div className="col-lg-9">
              <div className="card h-100 p-2">
                <TabbedTravelRequests
                  records={travelRequests}
                  profile={profile}
                />
              </div>
            </div>
          </>
        )}

        {placement === "right" && (
          <>
            <div className="col-lg-9">
              <div className="card h-100 p-2">
                <TabbedTravelRequests
                  records={travelRequests}
                  profile={profile}
                />
              </div>
            </div>
            <div className="col-lg-3">
              <SummaryCards
                cards={cards}
                layout="horizontal"
                currentPlacement="top"
                onPlacementChange={handleChangePlacement}
                actionButton={
                  <button
                    className="btn bg-danger text-white btn-md"
                    onClick={handleNewRequestClick}
                  >
                    <i className="fa fa-plus me-1" />
                    New Travel Request
                  </button>
                }
              />
            </div>
          </>
        )}

        {(placement === "top" || placement === "bottom") && (
          <div className="col-12">
            <div className="card h-100 p-2">
              <TabbedTravelRequests
                records={travelRequests}
                profile={profile}
              />
            </div>
          </div>
        )}
      </div>

      {placement === "bottom" && (
        <div className="row gx-1 mt-2">
          <div className="col-12">
            <SummaryCards
              cards={cards}
              layout="horizontal"
              currentPlacement="top"
              onPlacementChange={handleChangePlacement}
              actionButton={
                <button
                  className="btn bg-danger text-white btn-md"
                  onClick={handleNewRequestClick}
                >
                  <i className="fa fa-plus me-1" />
                  New Travel Request
                </button>
              }
            />
          </div>
        </div>
      )}
      <CustomModal
        show={showModal}
        onClose={handleCloseModal}
        title="New Travel Request"
        size="xl"
        titleIcon={<Wallet size={18} className="text-white" />}
      >
        <div className="row">
          <div className="col-md-12">
            <TravelRequestWizard profile={profile} />
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
