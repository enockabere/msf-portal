"use client";

import { Tabs, Tab } from "react-bootstrap";
import { Advance } from "@/app/types/advance";
import TravelRequestTable from "../travel/TravelRequestTable";

interface TabConfig {
  key: string;
  label: string;
  data: Advance[];
}

interface ReusableTabbedAdvanceTableProps {
  tabs: TabConfig[];
}

export default function ReusableTabbedAdvanceTable({
  tabs,
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
                <TravelRequestTable data={tab.data} loading={false} />
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
