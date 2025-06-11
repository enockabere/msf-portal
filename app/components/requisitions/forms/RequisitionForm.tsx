"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CircleCheckIcon,
  CircleX,
  Plus,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Requisition, RequisitionLine } from "../../../types/requisition";
import { useSession } from "next-auth/react";
import FormInput from "../../../components/inputs/FormInput";
import FormSelect from "../../../components/inputs/FormSelect";
import { useMySetups } from "../../../context/SetupContext";
import {
  decodeValue,
  employeeName,
  formatCurrency,
  pickKeys,
  removeNullAndUndefinedFromObject,
} from "../../../utils/helpers";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import {
  codeUnit,
  createResource,
  deleteResource,
  getResource,
  patchResource,
} from "../../../lib/api/http";
import { usePageLoader } from "../../../context/PageLoaderContext";
import FormSwitch from "../../../components/inputs/FormSwitch";
import FormFileInput from "../../../components/inputs/FormFileInput";
import { downloadFileFromBase64 } from "../../../utils/downloadBas64";

// Constants
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
};

const INITIAL_REQUEST_LINE = {
  id: "",
  lineNo: undefined,
  documentType: "User Requisition",
  documentNo: "",
  billingItemCode: "",
  quantity: 1,
  unitCost: 0,
  unitOfMeasure: "",
  locationCode: "",
  globalDimension1Code: "",
  globalDimension2Code: "",
  globalDimension3Code: "",
  globalDimension4Code: "",
};

const REQUEST_FOR_OPTIONS = [
  { code: "myself", description: "Myself" },
  { code: "another", description: "Another employee" },
];

type Attachment = {
  fileName: string;
  base64?: string;
  tableID?: number;
  no?: string;
  documentType?: string;
  lineNo?: number;
  id?: number;
  [key: string]: any;
};

type FormAction = "save" | "submit";

interface RequisitionFormProps {
  requisitionNo?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const RequisitionForm: React.FC<RequisitionFormProps> = ({
  requisitionNo,
  onClose,
  onSuccess,
}) => {
  // Hooks and Context
  const { data: session } = useSession();
  const {
    actions: { dispatcher },
  } = usePageLoader();
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

  // State
  const [formData, setFormData] = useState<Requisition>(INITIAL_REQUEST);
  const [requisitionLines, setRequisitionLines] = useState<RequisitionLine[]>([
    INITIAL_REQUEST_LINE,
  ]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [requestFor, setRequestFor] = useState("myself");
  const [formAction, setFormAction] = useState<FormAction>("save");

  // Derived values
  const employee = useMemo(
    () => ({
      number: session?.user?.profile?.no,
      shortcutDimension1Code: session?.user?.profile?.shortcutDimension1Code,
      shortcutDimension2Code: session?.user?.profile?.shortcutDimension2Code,
      shortcutDimension3Code: session?.user?.profile?.shortcutDimension3Code,
      shortcutDimension4Code: session?.user?.profile?.shortcutDimension4Code,
    }),
    [session]
  );

  const totalAmount = useMemo(
    () =>
      requisitionLines.reduce(
        (sum, item) => sum + (item.quantity || 0) * (item.unitCost || 0),
        0
      ),
    [requisitionLines]
  );

  const isReadOnly = useMemo(
    () => formData.status && decodeValue(formData.status) !== "Open",
    [formData.status]
  );

  const isEdit = useMemo(() => !!formData.id, [formData.id]);

  // Helper functions
  const handleFormChange = (field: keyof Requisition, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRequisitionLineChange = (
    index: number,
    field: keyof RequisitionLine,
    value: any
  ) => {
    setRequisitionLines((prevLines) =>
      prevLines.map((line, i) =>
        i === index ? { ...line, [field]: value } : line
      )
    );
  };

  const getRequisitionLineAmount = (unitCost: number, quantity: number) => {
    return formatCurrency(unitCost * quantity, formData.currencyCode);
  };

  const addRequisitionLine = () => {
    setRequisitionLines([...requisitionLines, INITIAL_REQUEST_LINE]);
  };

  const removeRequisitionLine = async (
    index: number,
    line: RequisitionLine
  ) => {
    try {
      if (line.id) {
        const res = await deleteResource("requisitionLines", {
          data: line,
          primaryKey: ["id"],
        });

        if (res.error) throw new Error(res.error.message);
      }
      setRequisitionLines((prev) => prev.filter((_, i) => i !== index));
    } catch (error: any) {
      await Swal.fire("Error deleting billing item", error.message, "error");
    }
  };

  // Data fetching and operations
  const loadRequisition = async (requisitionNo: string) => {
    const res = await getResource("requisitions", {
      params: {
        filters: { no: requisitionNo },
        $expand:
          "requisitionLines,attachments($select=tableID,no,documentType,lineNo,id,fileName)",
      },
    });

    if (res.error) throw new Error(res.error.message);

    const { requisitionLines, attachments, ...requisition } = res.value.at(0);

    if (requisition.requestedFor !== employee.number) {
      setRequestFor("another");
    }

    setFormData(requisition);
    setRequisitionLines(
      requisitionLines.length ? requisitionLines : [INITIAL_REQUEST_LINE]
    );
    setAttachments(attachments);
  };

  const hydrateRequisitionLine = (
    line: Record<string, any>,
    requisition: Record<string, any>
  ): Record<string, any> => ({
    ...line,
    documentNo: line.documentNo || requisition.no,
    locationCode: line.locationCode || requisition.locationCode,
    globalDimension1Code:
      line.globalDimension1Code || requisition.globalDimension1Code,
    globalDimension2Code:
      line.globalDimension2Code || requisition.globalDimension2Code,
    globalDimension3Code:
      line.globalDimension3Code || requisition.globalDimension3Code,
    globalDimension4Code:
      line.globalDimension4Code || requisition.globalDimension4Code,
  });

  const saveRequisitionLines = async (
    lines: RequisitionLine[],
    requisition: Record<string, any>
  ) => {
    const operations = await Promise.all(
      lines.map(async (line) => {
        const strippedPayload = pickKeys(
          removeNullAndUndefinedFromObject(line),
          Object.keys(INITIAL_REQUEST_LINE)
        );
        const payload = hydrateRequisitionLine(strippedPayload, requisition);

        return payload.id
          ? await patchResource("requisitionLines", {
              data: payload,
              primaryKey: ["id"],
            })
          : await createResource("requisitionLines", { data: payload });
      })
    );

    operations.forEach((op, index) => {
      if (op.error) throw new Error("Saving of some lines failed");
      handleRequisitionLineChange(index, "id", op.id);
      handleRequisitionLineChange(index, "lineNo", op.lineNo);
    });
  };

  const uploadFiles = async (files: Attachment[], requisitionNo: string) => {
    const operations = await Promise.all(
      files.map((file) =>
        createResource("requisitionAttachments", {
          data: {
            no: requisitionNo,
            fileName: file.fileName,
            attachment: file.base64,
          },
        })
      )
    );

    if (operations.some((op) => op.error)) {
      throw new Error("Error saving attachments");
    }
  };

  const handleViewAttachment = async (file: Attachment) => {
    try {
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: { loading: true, message: "Fetching attachment" },
      });

      let base64 = file.base64;
      if (!base64) {
        const res = await getResource("requisitionAttachments", {
          params: {
            filters: pickKeys(file, [
              "tableID",
              "no",
              "documentType",
              "lineNo",
              "id",
            ]),
          },
        });

        if (res.error) throw new Error(res.error.message);
        base64 = res.value[0].attachment;
      }

      await downloadFileFromBase64(base64, file.fileName);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error opening attachment";
      toast.error(message);
    } finally {
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: { loading: false, message: "" },
      });
    }
  };

  const handleDeleteAttachment = async (file: Attachment) => {
    try {
      if (file.tableID) {
        const res = await deleteResource("requisitionAttachments", {
          data: pickKeys(file, [
            "tableID",
            "no",
            "documentType",
            "lineNo",
            "id",
          ]),
          primaryKey: ["tableID", "no", "documentType", "lineNo", "id"],
        });

        if (res.error) throw new Error(res.error.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCancelApprovalRequest = async () => {
    try {
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: { loading: true, message: "Cancelling Approval Request" },
      });

      const res = await codeUnit("cancelRequisitionApprovalRequest", {
        data: { headerNo: formData.no },
      });

      if (res.error) throw new Error(res.error.message);
      await loadRequisition(formData.id);
      await Swal.fire(
        "Success",
        "Requisition approval request has been canceled"
      );
    } catch (error: any) {
      await Swal.fire("Cancel approval request failed", error.message, "error");
    } finally {
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: { loading: false, message: "" },
      });
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: true,
          message:
            formAction === "save"
              ? "Saving Request"
              : "Submitting for Approval",
        },
      });

      if (requisitionLines.length === 0) {
        throw new Error("Requisition requires at least one billing item.");
      }

      const strippedPayload = removeNullAndUndefinedFromObject(formData);
      const payload = pickKeys(strippedPayload, Object.keys(INITIAL_REQUEST));

      const reqResponse = payload.id
        ? await patchResource("requisitions", {
            data: payload,
            primaryKey: ["id"],
          })
        : await createResource("requisitions", { data: payload });

      if (reqResponse.error) throw new Error(reqResponse.error.message);

      setFormData((prev) => ({ ...prev, ...reqResponse }));
      await saveRequisitionLines(requisitionLines, reqResponse);

      const newFiles = attachments.filter((attachment) => !attachment.tableID);
      if (newFiles.length > 0) await uploadFiles(newFiles, reqResponse.no);

      if (formAction === "submit") {
        const res = await codeUnit("sendRequisitionForApproval", {
          data: { headerNo: reqResponse.no },
        });
        if (res.error) throw new Error(res.error.message);
        toast.success("Requisition has been sent for approval");
      } else {
        toast.success("Requisition has been saved successfully");
      }

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error: any) {
      await Swal.fire(
        `Failed to ${formAction} requisition`,
        error.message,
        "error"
      );
    } finally {
      dispatcher({
        type: "PATCH_LOADING_STATE",
        payload: { loading: false, message: "" },
      });
    }
  };

  // Effects
  useEffect(() => {
    const prepareFormData = () => {
      setFormData((prev) => ({
        ...prev,
        requestedBy: employee.number,
        requestedFor: employee.number,
        status: "Open",
        globalDimension1Code: employee.shortcutDimension1Code,
        globalDimension2Code: employee.shortcutDimension2Code,
        globalDimension3Code: employee.shortcutDimension3Code,
        globalDimension4Code: employee.shortcutDimension4Code,
      }));
    };

    const fetchRequisition = async (requisitionNo: string) => {
      try {
        dispatcher({
          type: "PATCH_LOADING_STATE",
          payload: { loading: true, message: "Fetching requisition record" },
        });
        await loadRequisition(requisitionNo);
      } catch (error: any) {
        await Swal.fire(
          "Error fetching requisition record",
          error.message,
          "error"
        );
      } finally {
        dispatcher({
          type: "PATCH_LOADING_STATE",
          payload: { loading: false, message: "" },
        });
      }
    };

    const initialize = async () => {
      try {
        await fetchSetups([
          "employees",
          "locations",
          "dimensions",
          "billingItems",
          "unitsOfMeasure",
          "globalCurrencies",
        ]);

        if (requisitionNo) {
          await fetchRequisition(requisitionNo);
        } else {
          prepareFormData();
        }
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    initialize();
  }, [employee, fetchSetups, requisitionNo, dispatcher]);

  // Render
  return (
    <div className="container-fluid d-flex flex-column">
      <form className="p-2 pt-3" onSubmit={handleSubmit}>
        {/* Header Section */}
        <div className="row flex-grow-1 mb-3">
          <div className="col-md-4">
            <FormInput
              label="Title"
              value={formData.title}
              onChange={(value) => handleFormChange("title", value)}
              placeholder="Enter title"
              required
              disabled={isReadOnly}
            />
          </div>

          <div className="col-md-4">
            <FormInput
              label="Description"
              value={formData.description}
              onChange={(value) => handleFormChange("description", value)}
              placeholder="Enter brief description"
              required
              disabled={isReadOnly}
            />
          </div>

          <div className="col-md-4">
            <FormSelect
              label="Who are you requesting for?"
              value={requestFor}
              onChange={setRequestFor}
              options={REQUEST_FOR_OPTIONS}
              required
              disabled={isReadOnly}
            />
          </div>

          {requestFor === "another" && (
            <div className="col-md-4">
              <FormSelect
                label="Request For"
                value={formData.requestedFor}
                onChange={(value) => handleFormChange("requestedFor", value)}
                options={employees.map((item) => ({
                  code: item.number,
                  description: employeeName(item),
                }))}
                required
                disabled={isReadOnly}
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
              disabled={isReadOnly}
            />
          </div>

          <div className="col-md-4">
            <FormSelect
              label="Currency"
              value={formData.currencyCode}
              placeholder="-- Select Currency --"
              onChange={(value) => handleFormChange("currencyCode", value)}
              options={globalCurrencies.map((item) => ({
                code: item.code,
                description: item.displayName,
              }))}
              required
              disabled={isReadOnly}
            />
          </div>

          <div className="col-md-4">
            <FormSelect
              label="Location"
              value={formData.locationCode}
              placeholder="-- Select Location --"
              onChange={(value) => handleFormChange("locationCode", value)}
              options={locations.map((item) => ({
                code: item.code,
                description: item.name,
              }))}
              required
              disabled={isReadOnly}
            />
          </div>

          <div className="col-md-4">
            <FormFileInput
              label={
                <>
                  <UploadCloud size={14} className="me-1" /> Upload Attachment
                </>
              }
              value={attachments}
              multiple={true}
              preview={isEdit}
              onChange={setAttachments}
              onView={handleViewAttachment}
              onRemove={handleDeleteAttachment}
              required
              disabled={isReadOnly}
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
                disabled={isReadOnly}
              />
            )}
          </div>
        </div>

        {/* Dimensions Section */}
        <div className="mb-3">
          <label className="form-label">Specify Dimensions</label>
          <div className="row flex-grow-1 mb-2">
            <div className="col-md-6">
              <FormSelect
                label="Cost Center"
                value={formData.globalDimension1Code}
                placeholder="Select OC"
                onChange={(value) =>
                  handleFormChange("globalDimension1Code", value)
                }
                options={OC.map((d) => ({ code: d.code, description: d.name }))}
                required
                disabled={isReadOnly}
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Department"
                value={formData.globalDimension2Code}
                placeholder="Select Department"
                onChange={(value) =>
                  handleFormChange("globalDimension2Code", value)
                }
                options={DEPARTMENTS.map((d) => ({
                  code: d.code,
                  description: d.name,
                }))}
                required
                disabled={isReadOnly}
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Country"
                value={formData.globalDimension3Code}
                placeholder="Select Country"
                onChange={(value) =>
                  handleFormChange("globalDimension3Code", value)
                }
                options={COUNTRY.map((d) => ({
                  code: d.code,
                  description: d.name,
                }))}
                disabled={isReadOnly}
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Project"
                value={formData.globalDimension4Code}
                placeholder="Select Project"
                onChange={(value) =>
                  handleFormChange("globalDimension4Code", value)
                }
                options={PROJECT.map((d) => ({
                  code: d.code,
                  description: d.name,
                }))}
                disabled={isReadOnly}
              />
            </div>
          </div>
        </div>

        <hr />

        {/* Billing Items Section */}
        <div className="mb-3">
          <div
            className="p-2 mb-3 bg-light d-flex justify-content-between align-items-center"
            style={{ background: "#f43434" }}
          >
            <h5 className="mb-0 text-dark">Billing Items</h5>
            {!isReadOnly && (
              <button
                type="button"
                className="btn btn-success d-flex align-items-center gap-1"
                onClick={addRequisitionLine}
              >
                <Plus size={16} />
                Add Billing Item
              </button>
            )}
          </div>

          <div className="table-responsive">
            <table className="table table-bordered mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Item</th>
                  <th>Units</th>
                  <th>Quantity</th>
                  <th>Unit Cost</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requisitionLines.map((line, idx) => (
                  <tr key={idx}>
                    <td>
                      <FormSelect
                        value={line.billingItemCode}
                        onChange={(value) =>
                          handleRequisitionLineChange(
                            idx,
                            "billingItemCode",
                            value
                          )
                        }
                        options={billingItems.map((item) => ({
                          code: item.code,
                          description: item.description,
                        }))}
                        required
                        disabled={isReadOnly}
                        styles="mb-0"
                      />
                    </td>
                    <td>
                      <FormSelect
                        value={line.unitOfMeasure}
                        onChange={(value) =>
                          handleRequisitionLineChange(
                            idx,
                            "unitOfMeasure",
                            value
                          )
                        }
                        options={unitsOfMeasure.map((item) => ({
                          code: item.code,
                          description: item.displayName,
                        }))}
                        required
                        disabled={isReadOnly}
                        styles="mb-0"
                      />
                    </td>
                    <td>
                      <FormInput
                        value={line.quantity}
                        onChange={(value) =>
                          handleRequisitionLineChange(
                            idx,
                            "quantity",
                            Number(value)
                          )
                        }
                        required
                        disabled={isReadOnly}
                        styles="mb-0"
                      />
                    </td>
                    <td>
                      <FormInput
                        value={line.unitCost}
                        onChange={(value) =>
                          handleRequisitionLineChange(
                            idx,
                            "unitCost",
                            Number(value)
                          )
                        }
                        required
                        disabled={isReadOnly}
                        styles="mb-0"
                      />
                    </td>
                    <td>
                      {getRequisitionLineAmount(line.unitCost, line.quantity)}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeRequisitionLine(idx, line)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-light">
                <tr>
                  <td>Total Amount</td>
                  <td colSpan={5} className="text-end">
                    {formatCurrency(totalAmount, formData.currencyCode)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="d-flex justify-content-between mt-4">
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
            >
              <ArrowLeft size={16} className="me-1" />
              Go Back
            </button>

            {!isReadOnly && (
              <>
                <button
                  type="submit"
                  className="btn btn-danger d-flex align-items-center gap-1"
                  onClick={() => setFormAction("save")}
                >
                  <Save size={16} />
                  Save
                </button>

                <button
                  type="submit"
                  className="btn btn-success d-flex align-items-center gap-1"
                  onClick={() => setFormAction("submit")}
                >
                  <CircleCheckIcon size={16} />
                  Submit for Approval
                </button>
              </>
            )}

            {decodeValue(formData.status) === "Pending Approval" && (
              <button
                type="button"
                className="btn btn-danger d-flex align-items-center gap-1"
                onClick={handleCancelApprovalRequest}
              >
                <CircleX size={16} />
                Cancel Approval
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default RequisitionForm;
