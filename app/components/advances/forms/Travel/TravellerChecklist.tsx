import React, {useEffect, useState} from "react";
import {Save, UploadCloud} from "lucide-react";
import {Form} from "react-bootstrap";
import {createResource, getResource} from "@/app/lib/api/http";
import Swal from "sweetalert2";
import {TravelRequest} from "@/app/types/travel";

export default function TravellerChecklist({travelInfo}: {travelInfo: TravelRequest}) {
    const [travelChecklist, setTravelChecklist] = useState([])

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

    const saveChecklistItem = async (index) => {
        const rowData = rows[index];

        try {
            const res = await createResource('travelRoutes', {
                data: {
                },
            });

            if(res.error) {
                return Swal.fire('Error!', res.error.message)
            }
            console.log('create routes res', res)
            Swal.fire("Success", 'Travel checklist updated successfully!' );
        } catch (e) {
            Swal.fire('Error!', e.message)
        }
    };


    const getTravelChecklist = async () => {
        const res = await getResource('travellerChecklist', {
            params: {
                filters: {
                    documentNo: travelInfo?.no,
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
                    <table className="table table-hover caption-top my-2 align-middle">
                        <caption className={'text-gray-800'}>Travel checklist items</caption>
                        <thead className="table-light">
                        <tr>
                            <th>Item - Description</th>
                            <th>Expiry Date</th>
                            {/*<th>Attach</th>*/}
                            <th>Verify</th>
                            <th>Action</th>
                        </tr>
                        </thead>

                        <tbody>

                        {Object.entries(groupByTravellerName(travelChecklist)).map(([travellerName, items], groupIndex) => (
                            <React.Fragment key={`group-${groupIndex}`}>
                                <tr className="table-primary">
                                    <td colSpan={4}><strong>{travellerName}</strong></td>
                                </tr>

                                {items?.map((row, index) => (
                                    <tr key={`checklist-item-${groupIndex}-${index}`}>
                                        <td>{index + 1}. {row.checklistItem} - {row.checklistItemDescription}</td>
                                        <td>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={row.expiryDate}
                                                onChange={(e) => handleInputChange(index, e.target.value)}
                                                placeholder="Enter expiry date"
                                                required
                                            />
                                        </td>
                                        <td>
                                            <Form.Check
                                                type="checkbox"
                                                id={`check-${groupIndex}-${index}`}
                                                className="mb-2 text-capitalize"
                                                checked={row.has}
                                                onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                                            />
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-outline-success btn-sm"
                                                onClick={() => saveChecklistItem(index)}
                                                title="Save"
                                            >
                                                <Save size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}

                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}