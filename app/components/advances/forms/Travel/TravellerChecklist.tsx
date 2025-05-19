import React, { useEffect, useState, useCallback } from 'react';
import { getResource } from "@/app/lib/api/http";
import { TravelRequest } from "@/app/types/travel";
import ChecklistRow from "@/app/components/travel/ChecklistRow";

export default function VisaChecklist({ travelInfo }: { travelInfo: TravelRequest }) {
    const [travelChecklist, setTravelChecklist] = useState([]);

    const getTravelChecklist = useCallback(async () => {
        const res = await getResource('travellerChecklist', {
            params: {
                filters: {
                    documentNo: travelInfo.no,
                    documentType: travelInfo.documentType,
                    checklistType: "Travel",
                }
            }
        });

        setTravelChecklist(res?.value || []);
    }, [travelInfo]); // Only re-create when this value changes

    const groupByTravellerName = (items) => {
        return items.reduce((acc, item) => {
            const name = item.travellerName || 'Unknown Traveller';
            if (!acc[name]) {
                acc[name] = [];
            }
            acc[name].push(item);
            return acc;
        }, {});
    };

    useEffect(() => {
        getTravelChecklist();
    }, [travelInfo, getTravelChecklist]);

    return (
        <div className='row g-3'>
            <div className={'col-12'}>
                {travelChecklist && Object.keys(groupByTravellerName(travelChecklist)).length > 0 ? (
                    Object.entries(groupByTravellerName(travelChecklist)).map(([travellerName, items]) => (
                        <div key={travellerName}>
                            <div className="bg-danger p-2 rounded">
                                <p className="text-white m-0"><strong>{travellerName}</strong></p>
                            </div>

                            <table className="table table-hover caption-top my-2 align-middle">
                                <thead className="table-light">
                                <tr>
                                    <th>Item - Description</th>
                                    <th>Expiry Date</th>
                                    <th>Verify</th>
                                    <th>Action</th>
                                </tr>
                                </thead>

                                <tbody>
                                {Array.isArray(items) && items.length > 0 ? (
                                    items.map((row) => (
                                        <ChecklistRow
                                            key={row.lineNo + row.checklistItem}
                                            row={row}
                                            fetchChecklist={getTravelChecklist}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td className="text-center text-gray-500 py-4">
                                            No items found.
                                        </td>
                                    </tr>
                                )}
                                </tbody>

                            </table>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-4">No travel checklist found.</div>
                )}
            </div>
        </div>
    );
};
