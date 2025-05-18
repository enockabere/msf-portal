"use client";

import React from "react";
import {ArrowLeft, ArrowUp, Check, PencilIcon, UploadCloud} from "lucide-react";

export default function RequisitionForm() {
    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log("Form submitted");
    }

    return (
        <div className="container-fluid d-flex flex-column">
            <form className="p-2 pt-3" onSubmit={handleSubmit}>
                <div className="row flex-grow-1 mb-3">
                    <div className="col-md-4">
                        <label htmlFor="title" className="form-label">
                            Title <span className="text-danger">*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            className="form-control"
                            placeholder="Enter Title"
                            value=""
                            onChange={(e) => console.log(e.target.value)}
                            required
                            disabled=""
                        />
                    </div>

                    <div className="col-md-4">
                        <label htmlFor="description" className="form-label">
                            Description <span className="text-danger">*</span>
                        </label>
                        <input
                            id="description"
                            type="text"
                            className="form-control"
                            placeholder="Enter Description"
                            value=""
                            onChange={(e) => console.log(e.target.value)}
                            required
                            disabled=""
                        />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label fw-medium">
                            Who are you requesting for?
                        </label>
                        <select
                            className="form-select"
                            value=""
                            onChange={(e) => console.log(e.target.value)}>
                            <option value="">-- Select Recipient --</option>
                            {[
                                "Myself",
                                "Another employee",
                            ].map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="row flex-grow-1 mb-3">
                    <div className="col-md-4">
                        <label className="form-label">
                            Due Date <span className="text-danger">*</span>
                        </label>
                        <input
                            type="date"
                            className="form-control"
                            value=""
                            onChange={(e) => console.log(e.target.value)}
                            required
                            disabled=""
                        />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">
                            <UploadCloud size={14} className="me-1" /> Upload Attachment
                        </label>

                        <input
                            type="file"
                            className="form-control"
                            accept="image/*,.pdf"
                            onChange={(e) => console.log(1, e.target.files?.[0] || null)}
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        Specify Dimensions
                    </label>

                    <div className="row flex-grow-1 mb-2">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                value=""
                                onChange={(e) => console.log(e.target.value)}
                                placeholder="Select ENTITY"
                                disabled=""
                            />
                        </div>

                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                value=""
                                onChange={(e) => console.log(e.target.value)}
                                placeholder="Select OC"
                                disabled=""
                            />
                        </div>
                    </div>

                    <div className="row flex-grow-1">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                value=""
                                onChange={(e) => console.log(e.target.value)}
                                placeholder="Select DEPARTMENTS"
                                disabled=""
                            />
                        </div>

                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                value=""
                                onChange={(e) => console.log(e.target.value)}
                                placeholder="Select COUNTRY"
                                disabled=""
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        Billing Items
                    </label>
                </div>

                <div className="d-flex justify-content-between mt-4">
                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => console.log("Go Back")}>
                            <ArrowLeft size={16} className="me-1" />
                            Go Back
                        </button>

                        <button
                            type="button"
                            className="btn btn-danger d-flex align-items-center gap-1"
                            onClick={() => { console.log("✅ Submitting data:"); }}>
                            <PencilIcon size={16} />
                            Save Draft
                        </button>

                        <button
                            type="button"
                            className="btn btn-success d-flex align-items-center gap-1"
                            onClick={() => { console.log("✅ Submitting data:"); }}>
                            <Check size={16} />
                            Submit for Approval
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
