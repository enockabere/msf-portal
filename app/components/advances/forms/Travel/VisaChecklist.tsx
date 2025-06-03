import React, { useCallback, useEffect, useState } from 'react';
import { getResource } from "@/app/lib/api/http";
import { TravelRequest } from "@/app/types/travel";
import ChecklistRow from "@/app/components/travel/ChecklistRow";
import { ChecklistItem } from "@/app/types/ChecklistItem";
import { usePageLoader } from "@/app/context/PageLoaderContext";
import Swal from "sweetalert2";

interface GroupedChecklist {
  [travellerName: string]: ChecklistItem[];
}

export default function VisaChecklist({ travelInfo }: { travelInfo: TravelRequest }) {
  const [visaChecklist, setVisaChecklist] = useState<GroupedChecklist>({});
  const { actions } = usePageLoader();
  const { dispatcher } = actions;

  const fetchVisaChecklist = useCallback(async () => {
    try {
      dispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: true,
          message: 'Fetching visa checklist...',
        }
      });

      const res = await getResource('travellerChecklist', {
        params: {
          filters: {
            documentNo: travelInfo.no,
            documentType: travelInfo.documentType,
            checklistType: "Visa",
            verified: false,
          },
          "$expand": `attachments($select=keyID,documentCode)`
        }
      });

      if (res.error) {
        throw new Error(res.error.message || 'Failed to fetch visa checklist');
      }

      const groupedCheckList = res.value.reduce((acc: GroupedChecklist, item: ChecklistItem) => {
        const name = item.travellerName || 'Unknown Traveller';
        if (!acc[name]) {
          acc[name] = [];
        }
        acc[name].push(item);
        return acc;
      }, {});

      setVisaChecklist(groupedCheckList);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      await Swal.fire("Error fetching checklist", errorMessage, "error");
    } finally {
      dispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: false,
          message: '',
        }
      });
    }
  }, [dispatcher, travelInfo.no, travelInfo.documentType]);

  useEffect(() => {
    fetchVisaChecklist();
  }, [fetchVisaChecklist]);

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
              className="text-primary fw-bold"
            >
              fcmtravel.co.ke/msf
            </a>
          </p>
        </div>

        {Object.entries(visaChecklist).map(([travellerName, items]) => (
          <div key={travellerName} className="mb-4">
            <div className="bg-danger p-2 rounded">
              <h5 className="text-white fw-bold m-0">{travellerName}</h5>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mt-2">
                <thead className="table-light">
                <tr>
                  <th>Item Description</th>
                  <th>Attachment</th>
                  <th className="text-end">Has Item</th>
                </tr>
                </thead>
                <tbody>
                {items.map((row) => (
                  <ChecklistRow
                    key={`${row.lineNo}-${row.checklistItem}-${row.travellerName}`}
                    row={row}
                  />
                ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {Object.keys(visaChecklist).length === 0 && (
          <div className="alert alert-warning mt-3">
            No visa checklist items found for this travel request.
          </div>
        )}
      </div>
    </div>
  );
}