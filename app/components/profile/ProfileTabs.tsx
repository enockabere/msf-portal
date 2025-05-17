"use client";

import { useState, useMemo } from "react";
import classNames from "classnames";
import ProfileSettings from "./tabs/ProfileSettings";
import DependentsTab from "./tabs/DependentsTab";
import BankDetailsTab from "./tabs/BankDetailsTab";
import { useSession } from "next-auth/react";

interface Dependent {
  name: string;
  relation: string;
  countryOfOrigin: string;
  dob?: string;
  gender?: string;
}

export default function ProfileTabs({
  dependents,
  setDependents,
}: {
  dependents: Dependent[];
  setDependents: React.Dispatch<React.SetStateAction<Dependent[]>>;
}) {
  const { data: session } = useSession();
  const profileType = session?.user?.profile?.type || "";

  const availableTabs = useMemo(() => {
    const baseTabs = [
      { id: "gallery", label: "Gallery" },
      { id: "profile-settings", label: "Profile Settings" },
      { id: "bank-details", label: "Bank Details" },
    ];

    if (profileType === "Visitor") {
      baseTabs.splice(2, 0, { id: "dependents", label: "Dependants" }); // insert before bank-details
    }

    return baseTabs;
  }, [profileType]);

  const [activeTab, setActiveTab] = useState("profile-settings");

  return (
    <div className="col-md-8">
      <ul className="nav nav-tabs mb-3" role="tablist">
        {availableTabs.map((tab) => (
          <li className="nav-item" role="presentation" key={tab.id}>
            <button
              className={classNames("nav-link fw-medium", {
                active: activeTab === tab.id,
              })}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="tab-content">
        {activeTab === "gallery" && (
          <div className="tab-pane fade show active p-3" id="gallery">
            <p className="text-muted">No content in gallery yet.</p>
          </div>
        )}

        {activeTab === "profile-settings" && (
          <div className="tab-pane fade show active">
            <ProfileSettings />
          </div>
        )}

        {activeTab === "dependents" && profileType === "Visitor" && (
          <div className="tab-pane fade show active">
            <DependentsTab
              dependents={dependents}
              setDependents={setDependents}
            />
          </div>
        )}

        {activeTab === "bank-details" && (
          <div className="tab-pane fade show active">
            <BankDetailsTab />
          </div>
        )}
      </div>
    </div>
  );
}
