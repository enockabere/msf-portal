"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { TravelRequestProviders } from "@/app/types/travel";

interface TravelTicketSelectorProps {
  tickets: TravelRequestProviders[];
}

export default function TravelTicketSelector({
  tickets,
}: TravelTicketSelectorProps) {
  return (
    <div className="card mb-4">
      <div className="card-body">
        {tickets.length === 0 ? (
          <div className="text-center text-muted py-4">
            No available tickets at the moment.
          </div>
        ) : (
          <table className="table table-bordered mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>documentType</th>
                <th>documentNo</th>
                <th>service Code</th>
                <th>service</th>
                <th>vendorName</th>
                <th>vehicle Number</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket, idx) => (
                <tr key={ticket.id}>
                  <td>{idx + 1}</td>
                  <td>{ticket.documentType}</td>
                  <td>{ticket.documentNo}</td>
                  <td>{ticket.serviceCode}</td>
                  <td>{ticket.serviceDescription}</td>
                  <td>{ticket.vendorName}</td>
                  <td>{ticket.vehicleRegistrationNo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
