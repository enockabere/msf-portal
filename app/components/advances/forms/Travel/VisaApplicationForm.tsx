import React, {useState} from "react";

export default function VisaApplicationForm() {
    const [hasVisa, setHasVisa] = useState('Yes');
    const [visaExpiry, setVisaExpiry] = useState('');
    const [visaFee, setVisaFee] = useState('');

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
                    </div>
                )}
            </div>
        </>
    );
}