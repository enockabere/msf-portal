"use client";

import { Advance } from "@/app/types/advance";
import ReusableTabbedAdvanceTable from "../tables/ReusableTabbedAdvanceTable";

export default function TabbedTravelRequests() {
  const open: Advance[] = [
    {
      no: "TRV00101",
      advanceType: "Advance",
      employeeName: "Alice Kariuki",
      status: "Open",
      applicationAmount: 30000,
      currencyCode: "KES",
      applicationDate: "2025-05-01",
      preferredDisbursementDate: "2025-05-06",
      documentStatus: "",
      repaymentAmount: 0,
      repaymentInstallments: 0,
      disbursed: undefined,
    },
    {
      no: "TRV00102",
      advanceType: "Advance",
      employeeName: "Brian Mumo",
      status: "Open",
      applicationAmount: 27000,
      currencyCode: "KES",
      applicationDate: "2025-05-02",
      preferredDisbursementDate: "2025-05-07",
      documentStatus: "",
      repaymentAmount: 0,
      repaymentInstallments: 0,
      disbursed: undefined,
    },
  ];

  const pending: Advance[] = [
    {
      no: "TRV00103",
      advanceType: "Advance",
      employeeName: "Cynthia Mwangi",
      status: "Pending Approval",
      applicationAmount: 42000,
      currencyCode: "KES",
      applicationDate: "2025-04-28",
      preferredDisbursementDate: "2025-05-04",
      documentStatus: "",
      repaymentAmount: 0,
      repaymentInstallments: 0,
      disbursed: undefined,
    },
    {
      no: "TRV00104",
      advanceType: "Advance",
      employeeName: "David Otieno",
      status: "Pending Approval",
      applicationAmount: 36000,
      currencyCode: "KES",
      applicationDate: "2025-04-29",
      preferredDisbursementDate: "2025-05-05",
      documentStatus: "",
      repaymentAmount: 0,
      repaymentInstallments: 0,
      disbursed: undefined,
    },
  ];

  const released: Advance[] = [
    {
      no: "TRV00105",
      advanceType: "Advance",
      employeeName: "Eunice Kamau",
      status: "Released",
      applicationAmount: 50000,
      currencyCode: "KES",
      applicationDate: "2025-04-20",
      preferredDisbursementDate: "2025-04-25",
      documentStatus: "",
      repaymentAmount: 0,
      repaymentInstallments: 0,
      disbursed: undefined,
    },
    {
      no: "TRV00106",
      advanceType: "Advance",
      employeeName: "Felix Mutua",
      status: "Released",
      applicationAmount: 41000,
      currencyCode: "KES",
      applicationDate: "2025-04-21",
      preferredDisbursementDate: "2025-04-26",
      documentStatus: "",
      repaymentAmount: 0,
      repaymentInstallments: 0,
      disbursed: undefined,
    },
  ];

  const forApproval: Advance[] = [
    {
      no: "TRV00107",
      advanceType: "Advance",
      employeeName: "Grace Nduta",
      status: "Pending Approval",
      applicationAmount: 35000,
      currencyCode: "KES",
      applicationDate: "2025-04-15",
      preferredDisbursementDate: "2025-04-20",
      documentStatus: "",
      repaymentAmount: 0,
      repaymentInstallments: 0,
      disbursed: undefined,
    },
    {
      no: "TRV00108",
      advanceType: "Advance",
      employeeName: "Henry Wanjohi",
      status: "Pending Approval",
      applicationAmount: 39000,
      currencyCode: "KES",
      applicationDate: "2025-04-16",
      preferredDisbursementDate: "2025-04-21",
      documentStatus: "",
      repaymentAmount: 0,
      repaymentInstallments: 0,
      disbursed: undefined,
    },
  ];

  const tabData = [
    { key: "open", label: "Open", data: open },
    { key: "pending", label: "Pending", data: pending },
    { key: "released", label: "Approved", data: released },
    { key: "approvals", label: "Approval Requests", data: forApproval },
  ];

  const handleNewRequest = () => {};

  return <ReusableTabbedAdvanceTable tabs={tabData} />;
}
