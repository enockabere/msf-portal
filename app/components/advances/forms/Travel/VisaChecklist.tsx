import React, {useCallback, useEffect, useState} from 'react';
import { getResource} from "@/app/lib/api/http";
import {TravelRequest} from "@/app/types/travel";
import ChecklistRow from "@/app/components/travel/ChecklistRow";

export default function VisaChecklist ({travelInfo}: {travelInfo: TravelRequest}) {
    const [visaChecklist, setVisaChecklist] = useState([])

    const getVisaChecklist = useCallback(async () => {
        const res = await getResource('travellerChecklist', {
            params: {
                filters: {
                    documentNo: travelInfo.no,
                    documentType: travelInfo.documentType,
                    checklistType: "Visa",
                }
            }
        })

        console.log('getVisaChecklist', res)

        setVisaChecklist(res?.value || [])
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
        getVisaChecklist();
    }, [travelInfo, getVisaChecklist]);

    return (
        <>
            <div className='row g-3'>
                <div className="col-12">
                    <div className="">
                        <p className="">Click this lick to request for your travel voucher <a href="https://fcmtravel.co.ke/msf/" target="_blank" className="">fcmtravel.co.ke/msf</a></p>
                    </div>
                    {visaChecklist && Object.keys(groupByTravellerName(visaChecklist)).length > 0 ? (
                        Object.entries(groupByTravellerName(visaChecklist)).map(([travellerName, items]) => (
                            <div key={travellerName}>
                                <div className="bg-danger p-2 rounded">
                                    <p className="text-white m-0">
                                        <strong>{travellerName}</strong>
                                    </p>
                                </div>

                                <table className="table table-hover caption-top my-2 align-middle">
                                    <thead className="table-light">
                                    <tr>
                                        <th>Item - Description</th>
                                        <th>Expiry Date</th>
                                        <th>Attachment</th>
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
                                                fetchChecklist={getVisaChecklist}
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
                        <div className="text-center text-gray-500 py-4">No visa checklist found.</div>
                    )}
                </div>
            </div>
        </>
    );
};