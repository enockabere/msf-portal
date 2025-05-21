"use client";

import React, {useState} from "react";
import {ArrowLeft, Check, PencilIcon, Plus, Trash2, UploadCloud} from "lucide-react";

export default function RequisitionForm() {
    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log("Form submitted");
    }

    const [billingItems, setBillingItems] = useState([
        {
            id: 1,
            title: "Item 1",
            quantity: 2,
            unitPrice: 50,
            totalPrice: 100
        }
    ]);

    const addBillingItem = () => {
        const newItem = {
            id: billingItems.length + 1,
            title: "",
            quantity: 0,
            unitPrice: 0,
            totalPrice: 0
        };
        setBillingItems([...billingItems, newItem]);
    };

    const removeBillingItem = (id) => {
        setBillingItems(billingItems.filter(item => item.id !== id));
    };

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
                            />
                        </div>

                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                value=""
                                onChange={(e) => console.log(e.target.value)}
                                placeholder="Select OC"
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
                            />
                        </div>

                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                value=""
                                onChange={(e) => console.log(e.target.value)}
                                placeholder="Select COUNTRY"
                            />
                        </div>
                    </div>
                </div>

                <hr/>

                <div className="mb-3">
                    <div className="p-2 mb-3 bg-light d-flex justify-content-between align-items-center"
                        style={{ background: "#f43434" }}>
                        <h5 className="mb-0 text-dark">Billing Items</h5>
                        <button
                            type="button"
                            className="btn btn-success d-flex align-items-center gap-1"
                            onClick={addBillingItem}>
                            <Plus size={16} />
                            Add Billing Item
                        </button>
                    </div>

                    <div className="">
                        <table className="table table-bordered mb-0 align-middle">
                            <thead className="table-light">
                            <tr>
                                <th>Description</th>
                                <th>Quantity</th>
                                <th>Unit Cost</th>
                                <th>Amount</th>
                                <th>Location</th>
                                <th>Dimensions</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {billingItems.map((billingItem, idx) => (
                                <tr key={`${idx}-${billingItem.id}`}>
                                <td>
                                    <div className="">
                                        <label className="form-label">
                                            Billing Item <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter Description"
                                            value=""
                                            onChange={(e) => console.log(e.target.value)}
                                            required
                                        />
                                    </div>
                                </td>
                                <td>
                                    <div className="">
                                        <label className="form-label">
                                            Quantity <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Enter Quantity"
                                            value=""
                                            onChange={(e) => console.log(e.target.value)}
                                            required
                                        />
                                    </div>
                                </td>
                                    <td>
                                        <div className="">
                                            <label className="form-label">
                                                Unit Cost <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Unit Cost"
                                                value=""
                                                onChange={(e) => console.log(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <div className="">
                                            <label className="form-label">
                                                Amount <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Enter Amount"
                                                value=""
                                                onChange={(e) => console.log(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <div className="">
                                            <label className="form-label">
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter Location"
                                                value=""
                                                onChange={(e) => console.log(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <div className="">
                                            <label className="form-label">
                                                Dimensions
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter Dimensions"
                                                value=""
                                                onChange={(e) => console.log(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </td>
                                <td className="">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => removeBillingItem(billingItem.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
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
