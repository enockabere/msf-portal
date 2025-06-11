import React, { useCallback, useEffect, useState } from 'react';
import { getResource } from "../../../../lib/api/http";
import { TravelRequest } from "../../../../types/travel";
import ChecklistRow from "../../../../components/travel/ChecklistRow";
import { ChecklistItem } from "../../../../types/ChecklistItem";
import { usePageLoader } from "../../../../context/PageLoaderContext";
import Swal from "sweetalert2";

interface GroupedChecklist {
  [travellerName: string]: ChecklistItem[];
}

export default function ChecklistForm({ travelInfo, checklistType }: { travelInfo: TravelRequest, checklistType: string }) {
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

  const fetchChecklist = useCallback(async () => {
    try {
      setLoadingState(true, 'Fetching checklist...');

      const res = await getResource('travellerChecklist', {
        params: {
          filters: {
            documentNo: travelInfo.no,
            documentType: travelInfo.documentType,
            checklistType: checklistType,
            verified: false,
          },
          "$expand": `attachments($select=keyID,documentCode)`
        }
      });

      if (res.error) {
        throw new Error(res.error.message || 'Failed to fetch checklist');
      }

      setVisaChecklist(groupChecklistItems(res.value));
    } catch (error: unknown) {
      await showErrorAlert("Error fetching checklist", error);
    } finally {
      setLoadingState(false);
    }
  }, [checklistType, groupChecklistItems, setLoadingState, showErrorAlert, travelInfo.documentType, travelInfo.no]);

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  const renderTravellerChecklists = () => {
    if (Object.keys(visaChecklist).length === 0) {
      return (
        <div className="alert alert-warning mt-3">
          No checklist items found for this travel request.
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
        {renderTravellerChecklists()}
      </div>
    </div>
  );
}