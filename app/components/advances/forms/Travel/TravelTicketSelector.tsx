"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface TicketItem {
  id: string;
  ticketNumber: string;
  departure: string;
  destination: string;
  travelDate: string;
  airline: string;
}

interface TravelTicketSelectorProps {
  tickets: TicketItem[];
  selectedTicketId: string | null;
  onSelectTicket: (ticketId: string) => void;
}

export default function TravelTicketSelector({
  tickets,
  selectedTicketId,
  onSelectTicket,
}: TravelTicketSelectorProps) {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <table className="table table-bordered mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Ticket No</th>
              <th>From</th>
              <th>To</th>
              <th>Travel Date</th>
              <th>Airline</th>
              <th className="text-center">Select</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket, idx) => (
              <tr key={ticket.id}>
                <td>{idx + 1}</td>
                <td>{ticket.ticketNumber}</td>
                <td>{ticket.departure}</td>
                <td>{ticket.destination}</td>
                <td>{ticket.travelDate}</td>
                <td>{ticket.airline}</td>
                <td className="text-center">
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      selectedTicketId === ticket.id
                        ? "btn-success"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => onSelectTicket(ticket.id)}
                  >
                    <CheckCircle2 size={16} className="me-1" />
                    {selectedTicketId === ticket.id ? "Selected" : "Select"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
