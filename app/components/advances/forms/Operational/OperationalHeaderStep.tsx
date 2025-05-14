"use client";

import React from "react";
import { ArrowDown } from "lucide-react";
import { FormData } from "@/app/types/advance";
import { useMySetups } from "@/app/context/SetupContext";
import { findObjectFromArray } from "@/app/utils/helpers";
import { useSession } from "next-auth/react";

interface OperationalHeaderStepProps {
  formData: FormData;
  onFormChange: (field: keyof FormData, value: string) => void;
  onNext: () => void;
}

export default function OperationalHeaderStep({
  formData,
  onFormChange,
  onNext,
}: OperationalHeaderStepProps) {


  const { imprestTypes, currencies, paymentMethods } = useMySetups();
  const { data } = useSession();

  const renderViewByTypes = (method: string) => {
    let type: string = findObjectFromArray(paymentMethods, "code", method)?.type as string || 'Mpesa';
    switch (type) {
      case "Mpesa": {
        onFormChange("phone", data.user?.profile?.phoneNo);
        return (
          <div className="fade-in">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="mpesa-phone" className="form-label">
                  Mpesa Phone Number
                </label>
                <div className="input-group">
                  <span className="input-group-text">+254</span>
                  <input
                    type="tel"
                    className="form-control"
                    id="mpesa-phone"
                    value={formData.phone}
                    onChange={(e) => onFormChange("phone", e.target.value)}
                    maxLength={9}
                  />
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="id-passport" className="form-label">
                  ID/Passport Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="id-passport"
                  value={formData.idPassportNumber}
                  onChange={(e) =>
                    onFormChange("idPassportNumber", e.target.value)
                  }
                  placeholder="Enter ID or Passport number"
                />
              </div>
            </div>
          </div>
        );
      }
      case "Cheques":
      case "Bank_x0020_Transfer": {
        return (
          <div className="fade-in">
            <div className="row">
              <div className="col-md-3 mb-3">
                <label htmlFor="account-no" className="form-label">
                  Account No.
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="account-no"
                  value={formData.accountNo}
                  onChange={(e) => onFormChange("accountNo", e.target.value)}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="bank" className="form-label">
                  Select Bank
                </label>
                <select
                  className="form-select"
                  id="bank"
                  value={formData.bank}
                  onChange={(e) => onFormChange("bank", e.target.value)}
                >
                  <option>Equity Bank</option>
                  <option>Co-operative Bank</option>
                  <option>NCBA</option>
                </select>
              </div>
              <div className="col-md-5 mb-3">
                <label htmlFor="branch" className="form-label">
                  Select Branch
                </label>
                <select
                  className="form-select"
                  id="branch"
                  value={formData.branch}
                  onChange={(e) => onFormChange("branch", e.target.value)}
                >
                  <option>Westlands</option>
                  <option>Kisumu</option>
                  <option>Nakuru</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="cheque-name" className="form-label">
                  Cheque Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="cheque-name"
                  value={formData.chequeName}
                  onChange={(e) => onFormChange("chequeName", e.target.value)}
                />
              </div>
              <div className="col-6 mb-3">
                <label htmlFor="swift-code" className="form-label">
                  Swift Code
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="swift-code"
                  value={formData.swiftCode}
                  onChange={(e) => onFormChange("swiftCode", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      }
      case "Cash": {
        return (
          <div className="fade-in">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="cash-collection-date" className="form-label">
                  Cash Collection Date
                </label>
                <input
                  type="date"
                  id="cash-collection-date"
                  className="form-control"
                  value={formData.cashCollectionDate}
                  onChange={(e) =>
                    onFormChange("cashCollectionDate", e.target.value)
                  }
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="col-md-6 mb-3 fade-in">
                <label htmlFor="cash-hours" className="form-label">
                  Collection Time
                </label>
                <select
                  id="cash-hours"
                  className="form-select"
                  value={formData.cashHours}
                  onChange={(e) =>
                    onFormChange("cashHours", e.target.value)
                  }
                  required
                >
                  <option value="morning">
                    Morning (8:00 AM - 12:00 PM)
                  </option>
                  <option value="afternoon">
                    Afternoon (1:00 PM - 5:00 PM)
                  </option>
                </select>
              </div>
            </div>
          </div>
        )
      }
    }

  }

  return (
    <div className="card mb-4 border-secondary">
      <div className="card-header bg-primary-subtle d-flex justify-content-between align-items-center">
        <h5 className="mb-0 text-dark">Step 1: Advance Request</h5>
        <div className="badge text-dark fs-6">
          Total Advance: {formData.currency} {formData.amount}
        </div>
      </div>
      <div className="card-body">
        <form className="p-2 pt-3">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label htmlFor="advance_type" className="form-label">
                Advance Type
              </label>
              <select id="advance_type" className="form-select">
                <option disabled aria-disabled selected>--select imprest type--</option>
                {
                  imprestTypes.map((type: Record<string, any>) => {
                    return (
                      <option
                        value={type.code}
                        key={type.code}
                      >
                        {type.description}
                      </option>
                    )
                  })
                }
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label htmlFor="currency" className="form-label">
                Currency
              </label>
              <select
                id="currency"
                className="form-select"
                onChange={(e) => onFormChange("currency", e.target.value)}
              >
                <option disabled aria-disabled selected> -- Select Currency -- </option>
                {
                  currencies.map((currency: Record<string, any>) => {
                    return (
                      <option value={currency.code} key={currency.code}>{currency.description}</option>
                    )
                  })
                }
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="payment-method" className="form-label">
                Payment Method
              </label>
              <select
                id="payment-method"
                className="form-select"
                onChange={(e) => onFormChange("paymentMethod", e.target.value)}
              >
                <option disabled aria-disabled selected> --Select paymeny method-- </option>
                {
                  paymentMethods.map((method: Record<string, any>) => {
                    return (
                      <option value={method.code} key={method.code}>
                        {method.description}
                      </option>
                    );
                  })
                }
              </select>
            </div>
          </div>
          {renderViewByTypes(formData.paymentMethod)}
          <div className="row">
            <div className="col-md-12 mb-3">
              <label htmlFor="purpose" className="form-label">
                Purpose
              </label>
              <input
                type="text"
                id="purpose"
                className="form-control"
                placeholder="e.g. Fuel, petty cash..."
                value={formData.purpose}
                onChange={(e) => onFormChange("purpose", e.target.value)}
              />
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-12">
              <button
                type="button"
                className="btn btn-primary ms-auto d-flex align-items-center gap-2 fw-semibold"
                onClick={onNext}
              >
                <ArrowDown size={16} />
                Save & Continue
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
