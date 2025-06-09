"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleCheckIcon, CircleX, Plus, Save, Trash2, UploadCloud } from "lucide-react";
import { Attachment, Requisition, RequisitionLine } from "@/app/types/requisition";
import { useSession } from "next-auth/react";
import FormInput from "@/app/components/inputs/FormInput";
import FormSelect from "@/app/components/inputs/FormSelect";
import { useMySetups } from "@/app/context/SetupContext";
import {
  decodeValue,
  employeeName,
  formatCurrency,
  pickKeys,
  removeNullAndUndefinedFromObject
} from "@/app/utils/helpers";
import Swal from "sweetalert2";
import { codeUnit, createResource, deleteResource, getResource, patchResource } from "@/app/lib/api/http";
import { usePageLoader } from "@/app/context/PageLoaderContext";
import FormSwitch from "@/app/components/inputs/FormSwitch";

const INITIAL_REQUEST: Requisition = {
  id: "",
  no: "",
  documentType: "User Requisition",
  requestedBy: "",
  requestedFor: "",
  dueDate: "",
  title: "",
  description: "",
  locationCode: "",
  currencyCode: "",
  urgent: false,
  urgencyReasons: "",
  globalDimension1Code: "",
  globalDimension2Code: "",
  globalDimension3Code: "",
  globalDimension4Code: "",
}

const INITIAL_REQUEST_LINE = {
  id: "",
  documentType: "User Requisition",
  documentNo: "",
  billingItemCode: "",
  description: "",
  quantity: 1,
  unitCost: 0,
  unitOfMeasure: "",
  locationCode: "",
  globalDimension1Code: "",
  globalDimension2Code: "",
  globalDimension3Code: "",
  globalDimension4Code: "",
}

const REQUEST_FOR_OPTIONS = [
  {
    code: 'myself',
    description: 'Myself',
  },
  {
    code: 'another',
    description: 'Another employee',
  },
];

export default function RequisitionForm({ requisitionId }: {requisitionId?: string; }) {
  const {data: session} = useSession();
  const employee: Record<string, any> = {
    number: session?.user?.profile?.no,
    shortcutDimension1Code: session?.user?.profile?.shortcutDimension1Code,
    shortcutDimension2Code: session?.user?.profile?.shortcutDimension2Code,
    shortcutDimension3Code: session?.user?.profile?.shortcutDimension3Code,
    shortcutDimension4Code: session?.user?.profile?.shortcutDimension4Code,
  };

  const {
    OC,
    DEPARTMENTS,
    PROJECT,
    COUNTRY,
    employees,
    locations,
    billingItems,
    unitsOfMeasure,
    globalCurrencies,
    fetchSetups,
  } = useMySetups();

  const [formData, setFormData] = useState<Requisition>(INITIAL_REQUEST);
  const [requisitionLines, setRequisitionLines] = useState<Array<RequisitionLine>>([INITIAL_REQUEST_LINE]);
  const [attachments, setAttachments] = useState<Array<Attachment>>([])
  const [requestFor, setRequestFor] = useState('myself');
  const [formAction, setFormAction] = useState<'save' | 'submit'>('save');
  const { actions } = usePageLoader();
  const { dispatcher } = actions;
  const router = useRouter();

  useEffect(() => {
    const loadSetups = async () => {
      try {
        await fetchSetups([
          'employees',
          'locations',
          'dimensions',
          'billingItems',
          'unitsOfMeasure',
          'globalCurrencies',
        ]);
      } catch (error: any) {
        console.error('Error loading setups:', error);
      }
    };

    const prepareFormData = () => {
      const initialData = {
        requestedBy: employee.number,
        requestedFor: employee.number,
        status: "Open",
        globalDimension1Code: employee.shortcutDimension1Code,
        globalDimension2Code: employee.shortcutDimension2Code,
        globalDimension3Code: employee.shortcutDimension3Code,
        globalDimension4Code: employee.shortcutDimension4Code,
      };

      setFormData((prev) => ({...prev, ...initialData}))
    };

    const fetchRequisition = async (requisitionId: string) => {
      try {
        dispatcher({
          type: "PATCH_LOADING_STATE",
          payload: {
            loading: true,
            message: "Fetching requisition record",
          },
        });

        const res = await getResource("requisitions", {
          params: {
            filters: {
              id: requisitionId
            },
            $expand: "requisitionLines,attachments($select=tableID,no,documentType,lineNo,id,fileName)"
          }
        });

        if (res.error) {
          throw new Error(res.error.message);
        }

        const { requisitionLines, attachments, ...requisition } = res.value.at(0)
        setFormData(prev => ({...prev, ...requisition}));
        setRequisitionLines(prev => requisitionLines.length ? [...requisitionLines] : [...prev]);
        setAttachments(prev => [...prev, ...attachments]);

      } catch (error: any) {
        await Swal.fire("Error fetching requisition record", error.message, "error");
      } finally {
        dispatcher({
          type: "PATCH_LOADING_STATE",
          payload: {
            loading: false,
            message: "",
          },
        });
      }
    };

    loadSetups();

    if (requisitionId) {
      fetchRequisition(requisitionId);
    } else {
      prepareFormData();
    }
  }, [
    employee.number,
    employee.shortcutDimension1Code,
    employee.shortcutDimension2Code,
    employee.shortcutDimension3Code,
    employee.shortcutDimension4Code,
    fetchSetups,
    requisitionId,
    dispatcher,
  ]);

  const handleFormChange = (field: keyof Requisition, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  };

  const handleBillingItemsChange = (index: number, field: keyof RequisitionLine, value: any) => {
    setRequisitionLines(prevLines =>
      prevLines.map((line, i) =>
        i === index ? { ...line, [field]: value } : line
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: true,
          message: formAction === "save" ? "Saving Request" : "Submitting for Approval",
        },
      });

      if (requisitionLines.length === 0) {
        throw new Error("Requisition requires at least one billing item.");
      }

      const strippedPayload: Record<string, any> = removeNullAndUndefinedFromObject(formData);
      const payload = pickKeys(strippedPayload, Object.keys(INITIAL_REQUEST));

      const reqResponse = payload.no
        ? await patchResource("requisitions", {
          data: payload,
          primaryKey: ["id"],
        })
        : await createResource("requisitions", { data: payload });

      if (reqResponse.error) {
        throw new Error(reqResponse.error.message);
      }

      // Process each line individually
      const operations = await Promise.all(
        requisitionLines.map(async (line: RequisitionLine) => {
          const strippedPayload = pickKeys(removeNullAndUndefinedFromObject(line), Object.keys(INITIAL_REQUEST_LINE));

          const payload = {
            ...strippedPayload,
            ...{
              documentNo: reqResponse.no,
              globalDimension1Code: reqResponse.globalDimension1Code,
              globalDimension2Code: reqResponse.globalDimension2Code,
              globalDimension3Code: reqResponse.globalDimension3Code,
              globalDimension4Code: reqResponse.globalDimension4Code,
            }}

          return line.id
          return line.id
            ? await patchResource('requisitionLines', {
              data: {payload},
              primaryKey: ["id"]
            })
            : await createResource('requisitionLines', { data: payload });
        })
      );

      const hasError = operations.some(operation => !!operation.error);

      if (hasError) {
        console.log("Operations", operations);
        throw new Error('Saving of some lines failed');
      }

      if (formAction === "submit") {
        // Send for approval
        const res = await codeUnit("sendRequisitionForApproval", {
          data: { headerNo: reqResponse.id }
        });

        if (res.error) {
          throw new Error(res.error.message);
        }

        await Swal.fire("Success", "Requisition has been sent for approval");
      } else {
        await Swal.fire("Success", "Requisition has been saved successfully");
      }
    } catch (error: any) {
      await Swal.fire("Failed to save requisition", error.message, "error");
    } finally {
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: false,
          message: "",
        },
      });
    }
  }

  const handleCancelApprovalRequest = async () => {
    try {
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: true,
          message: "Cancelling Approval Request",
        },
      });
    } catch (error: any) {
      await Swal.fire("Cancel approval request failed", error.message, "error");
    } finally {
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: false,
          message: "",
        },
      });
    }
  }

  const addRequisitionLine = () => {
    setRequisitionLines([...requisitionLines, INITIAL_REQUEST_LINE]);
  };

  const removeRequisitionLine = async (index: number, line: RequisitionLine) => {
    try {
      if (line.id) {
        const res = await deleteResource("requisitionLines", {
          data: line,
          primaryKey: ['id'],
        })

        if (res.error) {
          throw new Error(res.error.message);
        }
      }
      setRequisitionLines(requisitionLines.filter((_, i) => i !== index));
    } catch (error: any) {
      await Swal.fire("Error deleting billing item", error.message, "error");
    }
  };

  const totalAmount = useMemo(() =>
      requisitionLines.reduce(
        (sum, item) => sum + (item.quantity * item.unitCost),
        0
      ), [requisitionLines]);

  const goBack = () => {
    router.refresh();
  };

  return (
    <div className="container-fluid d-flex flex-column">
      <form className="p-2 pt-3" onSubmit={handleSubmit}>
        <div className="row flex-grow-1 mb-3">
          <div className="col-md-4">
            <FormInput
              label="Title"
              value={formData.title}
              onChange={(value) => handleFormChange("title", value)}
              placeholder="Enter title"
              required
            />
          </div>

          <div className="col-md-4">
            <FormInput
              label="Description"
              value={formData.description}
              onChange={(value) => handleFormChange("description", value)}
              placeholder="Enter brief description"
              required
            />
          </div>

          <div className="col-md-4">
            <FormSelect
              label="Who are you requesting for?"
              value={requestFor}
              onChange={(value) => setRequestFor(value)}
              options={REQUEST_FOR_OPTIONS}
              required
            />
          </div>

          {requestFor === 'another' && (
            <div className="col-md-4">
              <FormSelect
                label="Request For"
                value={formData.requestedFor}
                onChange={(value) => handleFormChange("requestedFor", value)}
                options={employees.map(item => ({code: item.number, description: employeeName(item)}))}
                required
              />
            </div>
          )}

          <div className="col-md-4">
            <FormInput
              type="date"
              label="Due Date"
              value={formData.dueDate}
              onChange={(value) => handleFormChange("dueDate", value)}
              required
            />
          </div>

          <div className="col-md-4">
            <FormSelect
              label="Currency"
              value={formData.currencyCode}
              placeholder="-- Select Currency --"
              onChange={(value) => handleFormChange("currencyCode", value)}
              options={globalCurrencies.map(item => ({code: item.code, description: item.displayName}))}
              required
            />
          </div>

          <div className="col-md-4">
            <FormSelect
              label="Location"
              value={formData.locationCode}
              placeholder="-- Select Location --"
              onChange={(value) => handleFormChange("locationCode", value)}
              options={locations.map(item => ({code: item.code, description: item.name}))}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">
              <UploadCloud size={14} className="me-1"/> Upload Attachment
            </label>

            <input
              type="file"
              className="form-control"
              accept="image/*,.pdf"
              onChange={(e) => console.log(1, e.target.files?.[0] || null)}
            />
          </div>

          <div className="col-md-4">
            <FormSwitch
              label="Is urgent?"
              id="urgent"
              value={formData.urgent}
              onChange={(value) => handleFormChange("urgent", value)}
            />

            {formData.urgent && (
              <FormInput
                value={formData.urgencyReasons}
                onChange={(value) => handleFormChange("urgencyReasons", value)}
                placeholder="Why is the request urgent?"
                required
              />
            )}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">
            Specify Dimensions
          </label>

          <div className="row flex-grow-1 mb-2">
            <div className="col-md-6">
              <FormSelect
                label="Cost Center"
                value={formData.globalDimension1Code}
                placeholder="Select OC"
                onChange={(value) => handleFormChange("globalDimension1Code", value)}
                options={OC.map(d => ({code: d.code, description: d.name}))}
                required
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Department"
                value={formData.globalDimension2Code}
                placeholder="Select Department"
                onChange={(value) => handleFormChange("globalDimension2Code", value)}
                options={DEPARTMENTS.map(d => ({code: d.code, description: d.name}))}
                required
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Country"
                value={formData.globalDimension3Code}
                placeholder="Select Country"
                onChange={(value) => handleFormChange("globalDimension3Code", value)}
                options={COUNTRY.map(d => ({code: d.code, description: d.name}))}
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Project"
                value={formData.globalDimension4Code}
                placeholder="Select Project"
                onChange={(value) => handleFormChange("globalDimension4Code", value)}
                options={PROJECT.map(d => ({code: d.code, description: d.name}))}
              />
            </div>
          </div>
        </div>

        <hr/>

        <div className="mb-3">
          <div className="p-2 mb-3 bg-light d-flex justify-content-between align-items-center"
               style={{background: "#f43434"}}>
            <h5 className="mb-0 text-dark">Billing Items</h5>
            <button
              type="button"
              className="btn btn-success d-flex align-items-center gap-1"
              onClick={addRequisitionLine}>
              <Plus size={16}/>
              Add Billing Item
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered mb-0 align-middle">
              <thead className="table-light">
              <tr>
                <th className="w-25">Item</th>
                <th>Units</th>
                <th style={{width: '10%'}}>Quantity</th>
                <th style={{width: '15%'}}>Unit Cost</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
              </thead>
              <tbody>
              {requisitionLines.map((requisitionLine, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="">
                      <FormSelect
                        value={requisitionLines[idx].billingItemCode}
                        onChange={(value) => handleBillingItemsChange(idx, "billingItemCode", value)}
                        options={billingItems.map(item => ({code: item.code, description: item.description}))}
                        required
                      />
                    </div>
                  </td>
                  <td>
                    <div className="">
                      <FormSelect
                        value={requisitionLines[idx].unitOfMeasure}
                        onChange={(value) => handleBillingItemsChange(idx, "unitOfMeasure", value)}
                        options={unitsOfMeasure.map(item => ({code: item.code, description: item.displayName}))}
                        required
                      />
                    </div>
                  </td>
                  <td>
                    <div className="">
                      <FormInput
                        type="number"
                        value={requisitionLines[idx].quantity}
                        onChange={(value) => handleBillingItemsChange(idx, "quantity", parseInt(value || 0))}
                        required
                      />
                    </div>
                  </td>
                  <td>
                    <div className="">
                      <FormInput
                        type="number"
                        value={requisitionLines[idx].unitCost}
                        onChange={(value) => handleBillingItemsChange(idx, "unitCost", parseFloat(value || 0))}
                        required
                      />
                    </div>
                  </td>
                  <td>
                    <div className="">
                      <FormSelect
                        value={requisitionLines[idx].locationCode}
                        onChange={(value) => handleBillingItemsChange(idx, "locationCode", value)}
                        options={locations.map(item => ({code: item.code, description: item.name}))}
                        required
                      />
                    </div>
                  </td>
                  <td className="">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeRequisitionLine(idx, requisitionLine)}
                    >
                      <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
              </tbody>
              <tfoot className="bg-light">
                <tr>
                  <td>Total Amount</td>
                  <td colSpan={5} className="text-end">{ formatCurrency(totalAmount, formData.currencyCode) }</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="d-flex justify-content-between mt-4">
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={goBack}>
              <ArrowLeft size={16} className="me-1"/>
              Go Back
            </button>

            <button
              type="submit"
              className="btn btn-danger d-flex align-items-center gap-1"
              onClick={() => {
                setFormAction('save');
              }}>
              <Save size={16}/>
              Save
            </button>

            {formData.status === "Open" && (
              <button
                type="submit"
                className="btn btn-success d-flex align-items-center gap-1"
                onClick={() => {
                  setFormAction('submit');
                }}>
                <CircleCheckIcon size={16}/>
                Submit for Approval
              </button>
            )}

            {decodeValue(formData.status) === "Pending Approval" && (
              <button
                type="button"
                className="btn btn-danger d-flex align-items-center gap-1"
                onClick={handleCancelApprovalRequest}>
                <CircleX size={16}/>
                Cancel Approval
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
