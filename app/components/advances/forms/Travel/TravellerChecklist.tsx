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
                    documentNo: travelInfo.documentNo,
                    documentType: travelInfo.documentType,
                    checklistType: "Travel",
                }
            }
        });

        console.log('getTravelChecklist', res?.value);
        setTravelChecklist(res?.value || []);
    }, [travelInfo.documentType]); // Only re-create when this value changes

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
    }, [getTravelChecklist]);

    return (
        <div className='row g-3'>
            <div className={'col-12'}>
                {Object.entries(groupByTravellerName(travelChecklist)).map(([travellerName, items]) => (
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
                            {Array.isArray(items) && items.map((row) => (
                                <ChecklistRow
                                    key={row.lineNo + row.checklistItem}
                                    row={row}
                                    fetchChecklist={getTravelChecklist}
                                />
                            ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
};
