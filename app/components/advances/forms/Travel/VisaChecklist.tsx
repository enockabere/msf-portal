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
                    documentNo: travelInfo?.no,
                    documentType: travelInfo.documentType,
                    checklistType: "Visa",
                }
            }
        })

        console.log('getVisaChecklist', res?.value)
        setVisaChecklist(res?.value || [])
    }

    useEffect(() => {
        getVisaChecklist()
    }, []);

    return (
        <>
            <div className='row g-3'>
                <div className={'col-12'}>
                    <table className="table table-hover caption-top my-2 align-middle">
                        <caption className={'text-gray-800'}>Visa checklist items</caption>
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
                        {visaChecklist.map((row, index) => (
                            <tr key={`checklist-item-${index}`}>
                                <td>{index + 1}. {row.checklistItem}-{row.checklistItemDescription}</td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={row.expiryDate}
                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                        placeholder="Enter ID or Passport number"
                                        required
                                    />
                                </td>
                                {/*<td>*/}
                                {/*    <label className="btn btn-sm btn-outline-secondary w-100">*/}
                                {/*        <UploadCloud size={14} className="me-1" /> Upload*/}
                                {/*        <input*/}
                                {/*            type="file"*/}
                                {/*            accept="image/*,.pdf"*/}
                                {/*            hidden*/}
                                {/*            onChange={(e) =>*/}
                                {/*                handleFileChange(index, e.target.files?.[0] || null)*/}
                                {/*            }*/}
                                {/*        />*/}
                                {/*    </label>*/}
                                {/*    {row.file && <small>{row.file.name}</small>}*/}
                                {/*</td>*/}
                                <td>
                                    <Form.Check
                                        type="checkbox"
                                        id={`check-${index}`}
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
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};