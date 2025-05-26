"use client";

import { useState, useMemo } from "react";
import classNames from "classnames";
import ProfileSettings from "./tabs/ProfileSettings";
import DependantsTab from "./tabs/DependantsTab";

interface Dependant {
  name: string;
  relation: string;
  countryOfOrigin: string;
  dob?: string;
  gender?: string;
}

export default function ProfileTabs({
  dependants,
  setDependants,
}: {
  dependants: Dependant[];
  setDependants: React.Dispatch<React.SetStateAction<Dependant[]>>;
}) {

  const availableTabs = useMemo(() => {
    return [
      { id: "profile-settings", label: "Profile Settings" },
      { id: "dependants", label: "Dependants" }, // Always include this tab
      { id: "gallery", label: "Gallery" },
    ];
  }, []);

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
        {activeTab === "profile-settings" && (
          <div className="tab-pane fade show active">
            <ProfileSettings />
          </div>
        )}

        {activeTab === "dependants" && (
          <div className="tab-pane fade show active">
            <DependantsTab
              dependants={dependants}
              setDependants={setDependants}
            />
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="tab-pane fade show active p-3" id="gallery">
            <p className="text-muted">No content in gallery yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
