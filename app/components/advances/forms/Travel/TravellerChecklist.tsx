import React, {useEffect, useState} from "react";
import {Save, UploadCloud} from "lucide-react";
import {Form} from "react-bootstrap";
import {createResource, getResource} from "@/app/lib/api/http";
import Swal from "sweetalert2";
import {TravelRequest} from "@/app/types/travel";

export default function TravellerChecklist({travelInfo}: {travelInfo: TravelRequest}) {
    const [travelChecklist, setTravelChecklist] = useState([])
    const [editableChecklist, setEditableChecklist] = useState([]);

    const [rows, setRows] = useState(
        Array.from({ length: 5 }, (_, index) => ({
            id: index + 1,
            expiryDate: '',
            file: null,
            checked: false,
        }))
    );

    const handleInputChange = (index, value) => {
        const updated = [...editableChecklist];
        updated[index].expiryDate = value;
        setEditableChecklist(updated);
    };

    const handleCheckboxChange = (index, value) => {
        const updated = [...editableChecklist];
        updated[index].has = value;
        setEditableChecklist(updated);
    };


    // const handleFileChange = (index, file) => {
    //     const updatedRows = [...rows];
    //     updatedRows[index].file = file;
    //     setRows(updatedRows);
    // };


    const updateChecklistItem = async (index) => {
        const item = editableChecklist[index];

        try {
            const res = await createResource('travelRoutes', {
                data: {
                    checklistId: item.id,
                    expiryDate: item.expiryDate,
                    has: item.has,
                    // add any other relevant fields
                },
            });

            if (res.error) {
                return Swal.fire('Error!', res.error.message, 'error');
            }

            Swal.fire('Success', 'Travel checklist updated successfully!', 'success');
        } catch (e) {
            Swal.fire('Error!', e.message, 'error');
        }
    };


    const getTravelChecklist = async () => {
        const res = await getResource('travellerChecklist', {
            params: {
                filters: {
                    documentNo: "ETR003",
                    documentType: travelInfo.documentType,
                    checklistType: "Travel",
                }
            }
        })

        console.log('getTravelChecklist', res?.value)

        setTravelChecklist(res?.value || [])
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
        getTravelChecklist()
    }, []);

    return (
        <>
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
}