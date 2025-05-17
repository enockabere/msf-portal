import React, {useEffect, useState} from 'react';
import { UploadCloud, Save } from 'lucide-react';
import { Form } from 'react-bootstrap';
import {createResource, getResource} from "@/app/lib/api/http";
import Swal from "sweetalert2";
import {TravelRequest} from "@/app/types/travel";
import ChecklistRow from "@/app/components/travel/ChecklistRow";

export default function VisaChecklist ({travelInfo}: {travelInfo: TravelRequest}) {
    const [visaChecklist, setVisaChecklist] = useState([])

    const getVisaChecklist = async () => {
        const res = await getResource('travellerChecklist', {
            params: {
                filters: {
                    documentNo: "ETR003",
                    documentType: travelInfo.documentType,
                    checklistType: "Visa",
                }
            }
        })

        console.log('getVisaChecklist', res?.value)
        setVisaChecklist(res?.value || [])
    }

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
        getVisaChecklist()
    }, []);

    return (
        <>
            <div className='row g-3'>
                <div className={'col-12'}>
                    {Object.entries(groupByTravellerName(visaChecklist)).map(([travellerName, items]) => (
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
                                {Array.isArray(items) && items.map((row, index) => (
                                  <ChecklistRow key={row.lineNo + row.checklistItem} row={row}/>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};