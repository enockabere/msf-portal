"use client";

import { Tabs, Tab } from "react-bootstrap";
import TravelRequestTable from "../travel/TravelRequestTable";

interface TabConfig {
  key: string;
  label: string;
  data: Array<Record<string, any>>;
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
                <div className="pt-3">
                  <TravelRequestTable data={tab.data} loading={false} />
                </div>
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
