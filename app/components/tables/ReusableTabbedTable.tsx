"use client";

import { Tabs, Tab } from "react-bootstrap";
import TravelRequestTable from "../travel/TravelRequestTable";
import RequisitionRequestsTable from "../requisitions/RequisitionRequestsTable";

interface TabConfig {
  key: string;
  label: string;
  data: Array<Record<string, any>>;
}

interface ReusableTabbedAdvanceTableProps {
  tabs: TabConfig[];
  profile?: Record<string, any>;
  type: string;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function ReusableTabbedTable({
  tabs,
  profile,
  type,
  isLoading,
  onRefresh
}: ReusableTabbedAdvanceTableProps) {
  return (
    <div className="position-relative">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="flex-grow-1">
          <Tabs defaultActiveKey={tabs[0]?.key || "open"} className="mb-0">
            {tabs.map((tab) => (
              <Tab
                key={tab.key}
                eventKey={tab.key}
                title={`${tab.label} (${tab.data.length})`}
              >
                <div className="pt-3">
                  {type === "travel" && (<TravelRequestTable data={tab.data} loading={isLoading} profile={profile} />)}
                  {type === "requisition" && (<RequisitionRequestsTable data={tab.data} loading={isLoading} onRefresh={onRefresh} />)}
                </div>
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
