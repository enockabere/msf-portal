"use client";

import React, { useEffect, useState, useCallback } from "react";
import ConfirmedEtaUpload from "./ConfirmedEtaUpload";
import NoEtaDownloads from "./NoEtaDownloads";
import { getResource, patchResource } from "@/app/lib/api/http";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import DataTable, { TableColumn } from "react-data-table-component";
import "../../../tables/datatable-custom.css";
import "./download.css";

interface TravelDocumentsProps {
  primaryKey: { no: string; documentType: string };
  status: string;
  requireETA: boolean;
  travelId: string;
}

interface Traveller {
  travellerType: string;
  documentType: string;
  documentNo: string;
  lineNo: number;
  travellerName: string;
  hasETA: boolean;
}

const TravelDocuments: React.FC<TravelDocumentsProps> = ({
  primaryKey,
  status,
  requireETA,
  travelId,
}) => {
  const [travellers, setTravellers] = useState<Traveller[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingLineNo, setUpdatingLineNo] = useState<number | null>(null);
  const [alertDismissed, setAlertDismissed] = useState(false);

  const fetchTravellers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getResource("travellers", {
        params: {
          filters: { documentNo: primaryKey.no },
        },
      });

      if (res.error) {
        Swal.fire("Error", res.error.message, "error");
      } else {
        setTravellers(res.value);
      }
    } catch {
      Swal.fire("Error", "Failed to fetch travellers", "error");
    } finally {
      setLoading(false);
    }
  }, [primaryKey.no]);

  useEffect(() => {
    if (requireETA) fetchTravellers();
  }, [fetchTravellers, requireETA]);

  const updateTravellerETA = async (traveller: Traveller, newETA: boolean) => {
    try {
      setUpdatingLineNo(traveller.lineNo);

      const payload = {
        documentType: traveller.documentType,
        documentNo: traveller.documentNo,
        lineNo: traveller.lineNo,
        travellerName: traveller.travellerName,
        hasETA: newETA,
      };

      const res = await patchResource("travellers", {
        primaryKey: ["documentType", "documentNo", "lineNo"],
        data: payload,
      });

      if (res.error) {
        Swal.fire("Error", res.error.message, "error");
      } else {
        const msg =
          res.message || res?.value?.message || "ETA updated successfully.";
        await Swal.fire("Success", msg, "success");
        await fetchTravellers();
      }
    } catch (err: any) {
      Swal.fire("Error", err.message || "Update failed", "error");
    } finally {
      setUpdatingLineNo(null);
    }
  };

  const columns: TableColumn<Traveller>[] = [
    {
      name: "Traveller",
      selector: (row) => row.travellerName,
      sortable: true,
      width: "40%",
    },
    {
      name: "Type",
      selector: (row) => row.travellerType,
      sortable: true,
      width: "30%",
    },
    {
      name: "Has ETA",
      width: "30%",
      center: true,
      cell: (row: Traveller) => (
        <div
          key={row.lineNo}
          className="d-flex justify-content-center align-items-center gap-2"
        >
          <input
            type="checkbox"
            checked={row.hasETA}
            disabled={updatingLineNo === row.lineNo}
            onChange={() => updateTravellerETA(row, !row.hasETA)}
            className="form-check-input"
          />
          {updatingLineNo === row.lineNo && (
            <Loader2 size={16} className="spin" />
          )}
        </div>
      ),
    },
  ];

  const allTravellersHaveETA = travellers.every((t) => t.hasETA);

  return (
    <div className="travel-documents-container">
      {requireETA ? (
        <>
          {loading ? (
            <div className="table">
              {[...Array(2)].map((_, index) => (
                <div className="skeleton-row" key={index}>
                  <div className="skeleton-cell skeleton-col-2"></div>
                  <div className="skeleton-cell skeleton-col-2"></div>
                  <div className="skeleton-cell skeleton-col-2"></div>
                </div>
              ))}
            </div>
          ) : allTravellersHaveETA ? (
            <ConfirmedEtaUpload
              status={status}
              travelId={travelId}
              travelNo={primaryKey.no}
            />
          ) : (
            <div className="card border-0 shadow-sm">
              {!alertDismissed && (
                <div className="alert alert-warning fade show m-3 mb-0">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      Please tick <strong>"Has ETA"</strong> once the traveller
                      has a valid ETA. If not, download and print all the
                      required documents before travel.
                    </div>
                    <button
                      type="button"
                      className="btn-close ms-2"
                      onClick={() => setAlertDismissed(true)}
                      aria-label="Close"
                    ></button>
                  </div>
                </div>
              )}

              <div className="card-body">
                <div className="mb-4">
                  <h5 className="card-title fw-semibold mb-3">Travellers</h5>
                  <DataTable
                    className="react-data-table compact"
                    columns={columns}
                    data={travellers}
                    pagination
                    striped
                    dense
                    highlightOnHover
                    responsive
                    noDataComponent="No traveller records found"
                  />
                </div>

                <div className="border-top pt-3 mt-3">
                  <h5 className="fw-semibold mb-3">Required Documents</h5>
                  <NoEtaDownloads
                    primaryKey={primaryKey}
                    requireETA={requireETA}
                    compact
                  />
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <ConfirmedEtaUpload
          status={status}
          travelId={travelId}
          travelNo={primaryKey.no}
        />
      )}
    </div>
  );
};

export default TravelDocuments;
