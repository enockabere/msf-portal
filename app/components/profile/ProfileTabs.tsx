// components/profile/ProfileTabs.tsx

"use client";

import { useState } from "react";
import classNames from "classnames";
import ProfileSettings from "./tabs/ProfileSettings";
import DependentsTab from "./tabs/DependentsTab";
import BankDetailsTab from "./tabs/BankDetailsTab";

const tabs = [
  { id: "gallery", label: "Gallery" },
  { id: "profile-settings", label: "Profile Settings" },
  { id: "dependents", label: "Dependants" },
  { id: "bank-details", label: "Bank Details" },
];

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState("profile-settings");

  return (
    <div className="col-md-8">
      <ul className="nav nav-tabs mb-3" role="tablist">
        {tabs.map((tab) => (
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

        {activeTab === "dependents" && (
          <div className="tab-pane fade show active">
            <DependentsTab />
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
