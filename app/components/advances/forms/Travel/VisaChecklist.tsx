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

const FCM_TRAVEL_LINK = "https://fcmtravel.co.ke/msf/";

export default function VisaChecklist({ travelInfo }: { travelInfo: TravelRequest }) {
  const [visaChecklist, setVisaChecklist] = useState<GroupedChecklist>({});
  const { dispatcher } = usePageLoader().actions;

  const showErrorAlert = useCallback(async (title: string, error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    await Swal.fire(title, errorMessage, "error");
  }, []);

  const setLoadingState = useCallback((loading: boolean, message = '') => {
    dispatcher({
      type: 'PATCH_LOADING_STATE',
      payload: { loading, message }
    });
  }, [dispatcher]);

  const groupChecklistItems = useCallback((items: ChecklistItem[]): GroupedChecklist => {
    return items.reduce((acc: GroupedChecklist, item: ChecklistItem) => {
      const name = item.travellerName || 'Unknown Traveller';
      if (!acc[name]) acc[name] = [];
      acc[name].push(item);
      return acc;
    }, {});
  }, []);

  const fetchVisaChecklist = useCallback(async () => {
    try {
      setLoadingState(true, 'Fetching visa checklist...');

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

      setVisaChecklist(groupChecklistItems(res.value));
    } catch (error: unknown) {
      await showErrorAlert("Error fetching checklist", error);
    } finally {
      setLoadingState(false);
    }
  }, [groupChecklistItems, setLoadingState, showErrorAlert, travelInfo]);

  useEffect(() => {
    fetchVisaChecklist();
  }, [fetchVisaChecklist]);

  const renderTravellerChecklists = () => {
    if (Object.keys(visaChecklist).length === 0) {
      return (
        <div className="alert alert-warning mt-3">
          No visa checklist items found for this travel request.
        </div>
      );
    }

    return Object.entries(visaChecklist).map(([travellerName, items]) => (
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
    ));
  };

  return (
    <div className="row g-3">
      <div className="col-12">
        <div className="alert alert-info">
          <p className="mb-0">
            Click this link to request for your travel voucher: {' '}
            <a
              href={FCM_TRAVEL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary fw-bold"
            >
              fcmtravel.co.ke/msf
            </a>
          </p>
        </div>

        {renderTravellerChecklists()}
      </div>
    </div>
  );
}