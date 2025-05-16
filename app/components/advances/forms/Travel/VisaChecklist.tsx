import React, {useEffect, useState} from 'react';
import { UploadCloud, Save } from 'lucide-react';
import { Form } from 'react-bootstrap';
import {createResource, getResource} from "@/app/lib/api/http";
import Swal from "sweetalert2";
import {TravelRequest} from "@/app/types/travel";

export default function VisaChecklist ({travelInfo}: {travelInfo: TravelRequest}) {
    const [visaChecklist, setVisaChecklist] = useState([])

    const [rows, setRows] = useState(
        Array.from({ length: 5 }, (_, index) => ({
            id: index + 1,
            expiryDate: '',
            file: null,
            checked: false,
        }))
    );

    const handleInputChange = (index, value) => {
        const updatedRows = [...rows];
        updatedRows[index].expiryDate = value;
        setRows(updatedRows);
    };

    // const handleFileChange = (index, file) => {
    //     const updatedRows = [...rows];
    //     updatedRows[index].file = file;
    //     setRows(updatedRows);
    // };

    const handleCheckboxChange = (index, value) => {
        const updatedRows = [...rows];
        updatedRows[index].checked = value;
        setRows(updatedRows);
    };

    const saveChecklistItem = async(index) => {
        const rowData = rows[index];
        console.log('Saving row:', rowData);
        // Example: send to API or process further

        try {
            const res = await createResource('travelRoutes', {
                data: {
                },
            });

            if(res.error) {
                return Swal.fire('Error!', res.error.message)
            }
            console.log('create routes res', res)
            Swal.fire("Success", 'Visa checklist updated successfully!' );
        } catch (e) {
            Swal.fire('Error!', e.message)
        }
    };


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
                                {items.map((row, index) => (
                                    <tr key={`${travellerName}-${row.checklistItem}`}>
                                        <td>{row.checklistItem}. {row.checklistItemDescription}</td>
                                        <td>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={row.expiryDate}
                                                onChange={(e) => handleInputChange(
                                                    editableChecklist.findIndex(i => i.id === row.id),
                                                    e.target.value
                                                )}
                                                placeholder="Enter expiry date"
                                                required
                                            />
                                        </td>
                                        <td>
                                            <Form.Check
                                                type="checkbox"
                                                id={`check-${travellerName}-${row.checklistItem}`}
                                                className="mb-2 text-capitalize"
                                                checked={row.has}
                                                onChange={(e) => handleCheckboxChange(
                                                    editableChecklist.findIndex(i => i.id === row.id),
                                                    e.target.checked
                                                )}
                                            />
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-outline-success btn-sm"
                                                onClick={() => updateChecklistItem(
                                                    editableChecklist.findIndex(i => i.id === row.id)
                                                )}
                                                title="Save"
                                            >
                                                <Save size={16} />
                                            </button>
                                        </td>
                                    </tr>
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