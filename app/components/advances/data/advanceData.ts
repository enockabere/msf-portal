export interface Advance {
  id: number;
  type: string;
  status: "Open" | "Approved" | "Rejected";
  amount: number;
  createdAt: string;
  requestedBy: string;
}

export const advanceData: Advance[] = [
  {
    id: 1,
    type: "Salary",
    status: "Open",
    amount: 5000,
    createdAt: "2024-07-18",
    requestedBy: "John Doe",
  },
  {
    id: 2,
    type: "Travel",
    status: "Approved",
    amount: 2500,
    createdAt: "2024-04-03",
    requestedBy: "Jane Smith",
  },
  {
    id: 3,
    type: "Operational",
    status: "Rejected",
    amount: 9000,
    createdAt: "2024-04-05",
    requestedBy: "Michael Johnson",
  },
  {
    id: 4,
    type: "Salary",
    status: "Approved",
    amount: 3000,
    createdAt: "2024-04-10",
    requestedBy: "Sarah Williams",
  },
  {
    id: 5,
    type: "Project",
    status: "Open",
    amount: 7500,
    createdAt: "2024-04-12",
    requestedBy: "David Brown",
  },
];
