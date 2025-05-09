import React, {useState} from "react";
import {UploadCloud} from "lucide-react";

export default function VisaApplicationForm() {
    const [hasVisa, setHasVisa] = useState('Yes');
    const [visaExpiry, setVisaExpiry] = useState('');
    const [visaFee, setVisaFee] = useState('');

    const handleFileChange = (index: number, file: File | null) => {
        console.log(file)
    };

    return (
        <>
            <div className="row g-3">
                <div className="col-md-6 col-12">
                    <label className="form-label">Do you have a valid visa to Nairobi?</label>
                    <select className="form-select" value={hasVisa} onChange={(e) => setHasVisa(e.target.value)}>
                        <option value='Yes'>Yes</option>
                        <option value='No'>No</option>
                    </select>
                </div>

                {hasVisa === 'Yes' ? (
                    <div className="col-md-6 col-12">
                        <label className="form-label">Visa is valid until?</label>
                        <input type="date" className="form-control" value={visaExpiry} onChange={(e) => setVisaExpiry(e.target.value)}/>
                    </div>
                ): (
                    <div className="col-md-6 col-12">
                        <label className="form-label">Specify visa processing fee</label>
                        <input type="number" className="form-control" value={visaFee} onChange={(e) => setVisaFee(e.target.value)}/>
                        <div className='form-text'>A visa advance request will be raised</div>
                    </div>
                )}
            </div>
            {hasVisa === 'No' && (
                <div className='row g-3'>
                    <div className={'col-12'}>
                        <table className="table table-hover caption-top my-2 align-middle">
                            <caption className={'text-gray-800'}>Visa checklist items</caption>
                            <thead className="table-light">
                            <tr>
                                <th>Item</th>
                                <th>Action</th>
                            </tr>
                            </thead>

                            <tbody>
                            <tr>
                                <td>1. Valid passport</td>
                                <td>
                                    <label className="btn btn-sm btn-outline-secondary w-100">
                                        <UploadCloud size={14} className="me-1" /> Upload
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            hidden
                                            onChange={(e) =>
                                                handleFileChange(1, e.target.files?.[0] || null)
                                            }
                                        />
                                    </label>
                                </td>
                            </tr>
                            <tr>
                                <td>2. Passport-Sized Photos</td>
                                <td>
                                    <label className="btn btn-sm btn-outline-secondary w-100">
                                        <UploadCloud size={14} className="me-1" /> Upload
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            hidden
                                            onChange={(e) =>
                                                handleFileChange(1, e.target.files?.[0] || null)
                                            }
                                        />
                                    </label>
                                </td>
                            </tr>
                            <tr>
                                <td>3. Proof of Financial Means</td>
                                <td>
                                    <label className="btn btn-sm btn-outline-secondary w-100">
                                        <UploadCloud size={14} className="me-1" /> Upload
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            hidden
                                            onChange={(e) =>
                                                handleFileChange(1, e.target.files?.[0] || null)
                                            }
                                        />
                                    </label>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}