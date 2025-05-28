import React, { useCallback, useEffect, useState } from 'react';
import { getResource } from "@/app/lib/api/http";
import { TravelRequest } from "@/app/types/travel";
import ChecklistRow from "@/app/components/travel/ChecklistRow";
import { ChecklistItem } from "@/app/types/ChecklistItem";

interface GroupedChecklist {
    [travellerName: string]: ChecklistItem[];
}

export default function VisaChecklist({ travelInfo }: { travelInfo: TravelRequest }) {
    const [visaChecklist, setVisaChecklist] = useState<ChecklistItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVisaChecklist = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await getResource('travellerChecklist', {
                params: {
                    filters: {
                        documentNo: travelInfo.no,
                        documentType: travelInfo.documentType,
                        checklistType: "Visa",
                        verified: false,
                    }
                }
            });

            if (res.error) {
                throw new Error(res.error.message || 'Failed to fetch visa checklist');
            }

            setVisaChecklist(res.value || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            console.error('Error fetching visa checklist:', err);
        } finally {
            setLoading(false);
        }
    }, [travelInfo.no, travelInfo.documentType]);

    const groupByTravellerName = useCallback((items: ChecklistItem[]): GroupedChecklist => {
        return items.reduce((acc: GroupedChecklist, item) => {
            const name = item.travellerName || 'Unknown Traveller';
            if (!acc[name]) {
                acc[name] = [];
            }
            acc[name].push(item);
            return acc;
        }, {});
    }, []);

    useEffect(() => {
        fetchVisaChecklist();
    }, [fetchVisaChecklist]);

    const groupedChecklist = groupByTravellerName(visaChecklist);
    const hasChecklistItems = Object.keys(groupedChecklist).length > 0;

    return (
      <div className="row g-3">
          <div className="col-12">
              <div className="alert alert-info">
                  <p className="mb-0">
                      Click this link to request for your travel voucher: {' '}
                      <a
                        href="https://fcmtravel.co.ke/msf/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                          fcmtravel.co.ke/msf
                      </a>
                  </p>
              </div>

              {loading ? (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger">
                    {error} {' '}
                    <button
                      onClick={fetchVisaChecklist}
                      className="btn btn-sm btn-outline-danger"
                    >
                        Retry
                    </button>
                </div>
              ) : hasChecklistItems ? (
                Object.entries(groupedChecklist).map(([travellerName, items]) => (
                  <div key={travellerName} className="mb-4">
                      <div className="bg-danger p-2 rounded">
                          <h5 className="text-white fw-bold m-0">{travellerName}</h5>
                      </div>

                      <div className="table-responsive">
                          <table className="table table-hover align-middle mt-2">
                              <thead className="table-light">
                              <tr>
                                  <th>Item - Description</th>
                                  <th>Attachment</th>
                                  <th>Verify</th>
                                  <th>Action</th>
                              </tr>
                              </thead>
                              <tbody>
                              {items.map((row) => (
                                <ChecklistRow
                                  key={`${row.lineNo}-${row.checklistItem}`}
                                  row={row}
                                  fetchChecklist={fetchVisaChecklist}
                                />
                              ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted py-4">
                    No visa checklist items found.
                </div>
              )}
          </div>
      </div>
    );
}