"use client";

import React, { useState, useEffect } from "react";
import SettlementExpenseForm from "./SettlementExpenseForm";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  PlusCircle,
  XCircle,
} from "lucide-react";
import { useAdvance } from "@/app/context/AdvanceContext";
import {
  checkIfMissingRequiredProperty,
  findObjectFromArray,
  removeNullAndUndefinedFromObject,
  removeObjectProps,
  safeTypechecker,
} from "@/app/utils/helpers";
import { useMySetups } from "@/app/context/SetupContext";
import Swal from "sweetalert2";
import {
  codeUnit,
  createResource,
  deleteResource,
  getResource,
  patchResource,
} from "@/app/lib/api/http";
import { RequestResponse } from "@/app/types/options";
import { usePageLoader } from "@/app/context/PageLoaderContext";
import AccountingExpenseDetailsForm from "./AccountingExpenseDetailsForm";
import VerticalProgressCard from "./VerticalProgressCard";

interface Props {
  closeSettlementDialog?: () => void;
}

export default function AdvanceSettlement({ closeSettlementDialog }: Props) {
  const [claimOverspent, setClaimOverspent] = useState<string>("No");
  const [returnAdvanceBalance, setReturnAdvanceBalance] =
    useState<string>("No");
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [selectedDeliverer, setSelectedDeliverer] = useState<string>("");
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);

  const {
    actions,
    accountedLines,
    expenses,
    formData,
    showAdvanceAccountedLineDetailsModal,
    showAdvannceSettlementForm,
    selectedAdvanceLineForViewAccountingDetails,
    selectedAdvanceLineForView,
  } = useAdvance();
  const { dispatcher } = actions;
  const { currencies, fetchSetups, userProfiles } = useMySetups();
  const { actions: loaderActions } = usePageLoader();
  const { dispatcher: loaderDispatcher } = loaderActions;

  const totalSurrendered = expenses.reduce(
    (sum, item) => sum + (item?.accountedAmount || 0),
    0
  );

  const totalBalanceAmount = expenses.reduce(
    (sum, item) => sum + item?.balance,
    0
  );
  const overspent = 0 > totalBalanceAmount;
  const fullyAccounted = totalBalanceAmount === 0;
  const underspent = 0 < totalBalanceAmount;

  const validateDetailedLinePayload = (line: Record<string, any>) => {
    const strippedPayLoad = removeNullAndUndefinedFromObject(line);
    const isMissingRequiredProp = checkIfMissingRequiredProperty(
      strippedPayLoad,
      Number(line.entryNo) >= 0
        ? [
            "DetailedLineMgtDocType",
            "DetailedLineMgtDocNo",
            "DetailedLineMgtLineNo",
            "amount",
            "description",
          ]
        : [
            "DetailedLineMgtDocType",
            "DetailedLineMgtDocNo",
            "DetailedLineMgtLineNo",
            "amount",
            "attachment",
            "description",
          ]
    );
    if (!isMissingRequiredProp)
      throw new Error("Validation Error!. Not a valid payload");
    if (isMissingRequiredProp.missing) {
      throw new Error(
        `Validation Error!. Missing [${isMissingRequiredProp.prop.join(",")}] ${
          isMissingRequiredProp.prop.length > 1 ? "Properties" : "Property"
        }`
      );
    }
  };
  const postRequest = async (index: number | null = null): Promise<void> => {
    try {
      const res = await getResource("imprest", {
        params: {
          filters: {
            no: formData?.no,
          },
          $expand: `imprestLinesAPI($expand=detailedImprestLines($select=entryNo,DetailedLineMgtDocType,DetailedLineMgtDocNo,DetailedLineMgtLineNo,description,amount,financeAmount,attachmentName))`,
        },
      });
      if (res.error) {
        Swal.fire(res.error.code, res.error.message, "error");
        loaderDispatcher({
          type: "PATCH_LOADING_STATE",
          payload: {
            loading: false,
            message: "",
          },
        });
        return;
      }
      if (!res.value?.[0]) {
        Swal.fire(
          "Error",
          "We experienced difficulties reloading this document. We are going to close this screen",
          "info"
        );
        return closeSettlementDialog();
      }
      const { imprestLinesAPI, ...rest } = res.value[0];
      dispatcher({
        type: "OPEN_EXISTING_ADVANCE",
        payload: rest,
      });
      const updatedAccountingDetails = [];
      const refetchedLines = [];
      imprestLinesAPI?.forEach((line: Record<string, any>) => {
        const { detailedImprestLines, ...otherProps } = line;
        updatedAccountingDetails.push(detailedImprestLines);
        refetchedLines.push(otherProps);
      });
      dispatcher({
        type: "SET_EXISTING_ADVANCE_LINES",
        payload: refetchedLines,
      });
      updatedAccountingDetails.splice(
        0,
        Infinity,
        ...updatedAccountingDetails.flat(Infinity)
      );
      dispatcher({
        type: "SET_DETAILED_ACCOUNTING_LINES",
        payload: updatedAccountingDetails,
      });
      const updatedLine = findObjectFromArray(
        refetchedLines,
        "lineNo",
        selectedAdvanceLineForView.lineNo
      );
      dispatcher({
        type: "SET_SELECTED_ADVANCE_LINE_TO_VIEW_SETTLEMENT_DETAILS",
        payload: updatedLine,
      });
      const updatedLineAccountingDetails = updatedAccountingDetails.filter(
        (record: Record<string, any>) =>
          record.DetailedLineMgtLineNo === updatedLine.lineNo
      );
      if (index >= 0) {
        const unsavedLines = selectedAdvanceLineForViewAccountingDetails.filter(
          (l: Record<string, any>, i: number) => {
            if (
              safeTypechecker(l.entryNo) === "Null" ||
              safeTypechecker(l.entryNo) === "Undefined"
            ) {
              return index !== i;
            }
          }
        );
        updatedLineAccountingDetails.push(...unsavedLines);
      }
      dispatcher({
        type: "SET_ACCOUNTING_LINES_FOR_SELECTED_ADVANCE_LINE_TO_VIEW_SETTLEMENT_DETAILS",
        payload: updatedLineAccountingDetails,
      });
    } catch (error: any) {
      Swal.fire("Error!", error.message, "error");
      loaderDispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: false,
          message: "",
        },
      });
    }
  };
  function isValidSurrenderStatus(
    status: any
  ): status is
    | "Open"
    | "Issued"
    | "Accounted"
    | "Settled"
    | "Posted"
    | "Pending Liquidation"
    | "Rejected"
    | "Liquidation Rejected"
    | "Reversed" {
    return [
      "Open",
      "Issued",
      "Accounted",
      "Settled",
      "Posted",
      "Pending Liquidation",
      "Rejected",
      "Liquidation Rejected",
      "Reversed",
    ].includes(status);
  }

  const handleViewLineAccountingDetails = async (
    index: number,
    exp: Record<string, any>
  ): Promise<void> => {
    try {
      loaderDispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: true,
          message: "",
        },
      });
      if (exp) {
        const selectLineAccountingEntries = accountedLines.filter(
          (line: Record<string, any>) => {
            return line.DetailedLineMgtLineNo === exp.lineNo;
          }
        );
        // dispatcher({
        //   type: "SET_SETTLEMENT_MODAL",
        //   payload: false,
        // });
        dispatcher({
          type: "SET_SELECTED_ADVANCE_LINE_TO_VIEW_SETTLEMENT_DETAILS",
          payload: exp,
        });
        dispatcher({
          type: "SET_ACCOUNTING_LINES_FOR_SELECTED_ADVANCE_LINE_TO_VIEW_SETTLEMENT_DETAILS",
          payload: selectLineAccountingEntries,
        });
        // dispatcher({
        //   type: "SET_ADVANCE_ACCOUNTED_LINE_DETAILS_MODAL",
        //   payload: true,
        // });
      }
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    } finally {
      loaderDispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: false,
          message: "",
        },
      });
    }
  };

  const addNewEntryToAccount = (exp: Record<string, any>) => {
    if (!exp) return;

    const newDraftState = [...selectedAdvanceLineForViewAccountingDetails];
    newDraftState.push({
      amount: 0,
      description: "",
      DetailedLineMgtDocType: "Imprest",
      DetailedLineMgtDocNo: exp.documentNo,
      DetailedLineMgtLineNo: exp.lineNo,
    });
    dispatcher({
      type: "SET_SELECTED_ADVANCE_LINE_TO_VIEW_SETTLEMENT_DETAILS",
      payload: exp,
    });
    dispatcher({
      type: "SET_ACCOUNTING_LINES_FOR_SELECTED_ADVANCE_LINE_TO_VIEW_SETTLEMENT_DETAILS",
      payload: newDraftState,
    });
  };

  const handleDeleteDetailedExpesneLine = async (
    index: number,
    line: Record<string, any>
  ): Promise<void> => {
    try {
      Swal.fire({
        title: "Are you sure you want delete this line?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#22c5ad",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      })
        .then(async (result) => {
          loaderDispatcher({
            type: "PATCH_LOADING_STATE",
            payload: {
              loading: true,
              message: "Deleting entry, please wait...",
            },
          });
          if (result.isConfirmed) {
            if (line.entryNo >= 0) {
              const res = await deleteResource("imprestDetailedLine", {
                data: line,
                primaryKey: [
                  "entryNo",
                  "DetailedLineMgtDocType",
                  "DetailedLineMgtDocNo",
                  "DetailedLineMgtLineNo",
                ],
              });
              if (res.error) {
                Swal.fire(res.error.code, res.error.message);
                loaderDispatcher({
                  type: "PATCH_LOADING_STATE",
                  payload: {
                    loading: false,
                    message: "",
                  },
                });
                return;
              }
              await postRequest(index);
            } else {
              const newDraftState = [
                ...selectedAdvanceLineForViewAccountingDetails,
              ];
              /* eslint-disable @typescript-eslint/no-unused-vars */
              const filteredLines = newDraftState.filter(
                (_l: Record<string, any>, i: number) => {
                  return i !== index;
                }
              );
              dispatcher({
                type: "SET_ACCOUNTING_LINES_FOR_SELECTED_ADVANCE_LINE_TO_VIEW_SETTLEMENT_DETAILS",
                payload: filteredLines,
              });
              loaderDispatcher({
                type: "PATCH_LOADING_STATE",
                payload: {
                  loading: false,
                  message: "",
                },
              });
              return;
            }
          }
        })
        .finally(() => {
          Swal.fire("Success", "Accounting Line deleted.", "success");
          loaderDispatcher({
            type: "PATCH_LOADING_STATE",
            payload: {
              loading: false,
              message: "",
            },
          });
        });
    } catch (error: any) {
      Swal.fire("Error!", error.message, "error");
    } finally {
      loaderDispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: false,
          message: "",
        },
      });
    }
  };
  const handleSaveAccountedRow = async (
    index: number,
    exp: Record<string, any>
  ): Promise<void> => {
    try {
      loaderDispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: true,
          message: "Saving...",
        },
      });
      if (
        safeTypechecker(index) === "Null" ||
        safeTypechecker(index) === "Undefined" ||
        index < 0
      ) {
        loaderDispatcher({
          type: "PATCH_LOADING_STATE",
          payload: {
            loading: false,
            message: "",
          },
        });
        return;
      }
      if (safeTypechecker(exp) !== "Object") {
        Swal.fire(
          "Invalid request!",
          "Invalid request. Please try again later.",
          "warning"
        );
        loaderDispatcher({
          type: "PATCH_LOADING_STATE",
          payload: {
            loading: false,
            message: "",
          },
        });
        return;
      }
      validateDetailedLinePayload(exp);
      let response: RequestResponse = {};
      if (
        safeTypechecker(exp.entryNo) === "Undefined" ||
        safeTypechecker(exp.entryNo) === "Null"
      ) {
        if (!exp.amount || !exp.attachment) {
          Swal.fire(
            "Invalid request!",
            "You must account this line first by adding amount and uploading the receipt",
            "warning"
          );
          loaderDispatcher({
            type: "PATCH_LOADING_STATE",
            payload: {
              loading: false,
              message: "",
            },
          });
          return;
        } else {
          response = await createResource("imprestDetailedLine", {
            data: exp,
          });
        }
      } else {
        const updatePayload = removeObjectProps(exp, ["financeAmount"]);
        response = await patchResource("imprestDetailedLine", {
          primaryKey: [
            "entryNo",
            "DetailedLineMgtDocType",
            "DetailedLineMgtDocNo",
            "DetailedLineMgtLineNo",
          ],
          data: updatePayload,
        });
      }
      if (response.error) {
        Swal.fire(response.error.code, response.error.message, "error");
        loaderDispatcher({
          type: "PATCH_LOADING_STATE",
          payload: {
            loading: false,
            message: "",
          },
        });
        return;
      }
      await postRequest(index);
      Swal.fire("Success", "Accounting entry added successfully!", "success");
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    } finally {
      loaderDispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: false,
          message: "",
        },
      });
    }
  };

  const handleSendSettlementForApproval = async () => {
    try {
      if (formData?.no) {
        loaderDispatcher({
          type: "PATCH_LOADING_STATE",
          payload: {
            loading: true,
            message: "Sending for approval...",
          },
        });
        const res = await codeUnit("AdvnaceLiquidation", {
          data: {
            docNo: formData?.no,
          },
        });
        if (res.error) {
          loaderDispatcher({
            type: "PATCH_LOADING_STATE",
            payload: {
              loading: false,
              message: "",
            },
          });
          return Swal.fire(res.error.code, res.error.message, "error");
        }
        await postRequest();
        loaderDispatcher({
          type: "PATCH_LOADING_STATE",
          payload: {
            loading: false,
            message: "",
          },
        });
        Swal.fire(
          "Success",
          "Successfully sent settlement for approval.",
          "success"
        );
      } else {
        Swal.fire("Alert", "Nothing happened. Try again later.", "info");
      }
    } catch (error: any) {
      loaderDispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: false,
          message: "",
        },
      });
      Swal.fire("Error!", error?.message, "error");
    }
  };

  const handleCancelSettlementApprovalRequest = async () => {
    try {
      const res = await codeUnit("CancelAdvanceApprovalRequest", {
        data: {
          docNo: formData?.no,
        },
      });
      if (res.error) {
        return Swal.fire(res.error.code, res.error.message, "error");
      }
      await postRequest();
      Swal.fire(
        "Success",
        "Successfully cancelled settlment approval request",
        "success"
      );
    } catch (error: any) {
      Swal.fire("Error!", error.meesage, "error");
    }
  };

  useEffect(() => {
    if (totalBalanceAmount > 0) {
      setReturnAdvanceBalance("Yes");
    } else {
      setReturnAdvanceBalance("No");
    }

    if (overspent) {
      setClaimOverspent("Yes");
    } else {
      setClaimOverspent("No");
    }
  }, [totalBalanceAmount, overspent]);

  useEffect(() => {
    fetchSetups(["userProfiles"]);
  });

  useEffect(() => {
    if (expenses && expenses.length) {
      const getExpenseLinesAccountingLines = expenses.map(
        (line: Record<string, any>) => {
          return getResource("imprestDetailedLine", {
            params: {
              filters: {
                DetailedLineMgtDocType: line.documentType,
                DetailedLineMgtDocNo: line.documentNo,
                DetailedLineMgtLineNo: line.lineNo,
              },
              $select:
                "entryNo, DetailedLineMgtDocType, DetailedLineMgtDocNo, DetailedLineMgtLineNo, description, amount, financeAmount, attachmentName",
            },
          });
        }
      );
      Promise.all(getExpenseLinesAccountingLines)
        .then((response) => {
          const flatResponse = response
            .map((line: Record<string, any>) => line.value)
            .flat(Infinity);
          dispatcher({
            type: "SET_DETAILED_ACCOUNTING_LINES",
            payload: flatResponse,
          });
        })
        .catch((error: any) => {
          Swal.fire("Error!", error.message, "error");
        });
    }
  }, [expenses, dispatcher]);

  useEffect(() => {
    if (formData) {
      console.log("Current formData:", formData);
    }
  }, [formData]);

  return (
    <div className="container-fluid d-flex flex-column min-vh-100">
      <div className="row flex-grow-1">
        <div className="col-md-9">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-primary-subtle d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold text-dark">Advance Settlement</h5>
              {showAdvanceAccountedLineDetailsModal && (
                <button
                  type="button"
                  className="btn btn-success d-flex align-items-center gap-1"
                  onClick={addNewEntryToAccount}
                >
                  <PlusCircle size={16} />
                  Add New Entry
                </button>
              )}
            </div>
            <div className="card-body">
              <>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="p-3 border rounded bg-light">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Amount Advanced</span>
                        <ArrowUp size={16} className="text-success" />
                      </div>
                      {showAdvanceAccountedLineDetailsModal && (
                        <h5 className="mt-2 mb-0 text-success fw-bold">
                          {(findObjectFromArray(
                            currencies,
                            "code",
                            formData?.currencyCode
                          )?.description as string) || "KES"}{" "}
                          {selectedAdvanceLineForView?.amountToPay}
                        </h5>
                      )}
                      {showAdvannceSettlementForm && (
                        <h5 className="mt-2 mb-0 text-success fw-bold">
                          {(findObjectFromArray(
                            currencies,
                            "code",
                            formData?.currencyCode
                          )?.description as string) || "KES"}{" "}
                          {formData?.amountToPayHeader}
                        </h5>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 border rounded bg-light">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Amount Justified</span>
                        <ArrowDown size={16} className="text-primary" />
                      </div>
                      {showAdvanceAccountedLineDetailsModal && (
                        <h5 className="mt-2 mb-0 text-primary fw-bold">
                          {(findObjectFromArray(
                            currencies,
                            "code",
                            formData?.currencyCode
                          )?.description as string) || "KES"}{" "}
                          {selectedAdvanceLineForView.accountedAmount.toLocaleString()}
                        </h5>
                      )}
                      {showAdvannceSettlementForm && (
                        <h5 className="mt-2 mb-0 text-primary fw-bold">
                          {(findObjectFromArray(
                            currencies,
                            "code",
                            formData?.currencyCode
                          )?.description as string) || "KES"}{" "}
                          {totalSurrendered.toLocaleString()}
                        </h5>
                      )}
                    </div>
                  </div>
                </div>
                {showAdvannceSettlementForm && (
                  <div
                    className={`toast d-flex align-items-center w-100 text-white border-0 show ${
                      overspent
                        ? "bg-danger"
                        : fullyAccounted
                        ? "bg-success"
                        : "bg-warning"
                    }`}
                    role="alert"
                  >
                    <div className="toast-body d-flex align-items-center gap-2">
                      {overspent ? (
                        <>
                          <AlertTriangle size={20} />
                          <div>
                            <strong>Claim:</strong>{" "}
                            <strong>
                              {(findObjectFromArray(
                                currencies,
                                "code",
                                formData?.currencyCode
                              )?.description as string) || "KES"}{" "}
                              {Math.abs(totalBalanceAmount).toLocaleString()}
                            </strong>{" "}
                            overspent
                          </div>
                        </>
                      ) : fullyAccounted ? (
                        <>
                          <Check size={20} />
                          <div>
                            <strong>Perfect!</strong> Advance fully accounted
                            for.
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={20} />
                          <div>
                            <strong>Surrender:</strong> Remaining balance of{" "}
                            <strong>
                              {(findObjectFromArray(
                                currencies,
                                "code",
                                formData?.currencyCode
                              )?.description as string) || "KES"}{" "}
                              {totalBalanceAmount.toLocaleString()}
                            </strong>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                {showAdvanceAccountedLineDetailsModal && (
                  <div
                    className={`toast d-flex align-items-center w-100 text-white border-0 show ${
                      selectedAdvanceLineForView?.accountedAmount >
                      selectedAdvanceLineForView?.amountToPay
                        ? "bg-danger"
                        : selectedAdvanceLineForView?.accountedAmount ===
                          selectedAdvanceLineForView?.amountToPay
                        ? "bg-success"
                        : "bg-warning"
                    }`}
                    role="alert"
                  >
                    <div className="toast-body d-flex align-items-center gap-2">
                      {selectedAdvanceLineForView?.accountedAmount >
                      selectedAdvanceLineForView?.amountToPay ? (
                        <>
                          <AlertTriangle size={20} />
                          <div>
                            <strong>Claim:</strong>{" "}
                            <strong>
                              {(findObjectFromArray(
                                currencies,
                                "code",
                                formData?.currencyCode
                              )?.description as string) || "KES"}{" "}
                              {Math.abs(
                                selectedAdvanceLineForView?.balance
                              ).toLocaleString()}
                            </strong>{" "}
                            overspent
                          </div>
                        </>
                      ) : selectedAdvanceLineForView?.accountedAmount ===
                        selectedAdvanceLineForView?.amountToPay ? (
                        <>
                          <Check size={20} />
                          <div>
                            <strong>Perfect!</strong> Advance fully accounted
                            for.
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={20} />
                          <div>
                            <strong>Surrender:</strong> Remaining balance of{" "}
                            <strong>
                              {(findObjectFromArray(
                                currencies,
                                "code",
                                formData?.currencyCode
                              )?.description as string) || "KES"}{" "}
                              {selectedAdvanceLineForView?.balance.toLocaleString()}
                            </strong>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                {showAdvannceSettlementForm && (
                  <SettlementExpenseForm
                    selectedLineIndex={activeLineIndex}
                    setActiveLineIndex={setActiveLineIndex}
                    selectedAdvanceLineForView={selectedAdvanceLineForView}
                    saveAccountingLine={handleSaveAccountedRow}
                    deleteDetailedExpesneLine={handleDeleteDetailedExpesneLine}
                    addNewEntryToAccount={addNewEntryToAccount}
                    handleViewLineAccountingDetails={
                      handleViewLineAccountingDetails
                    }
                  />
                )}
                {showAdvanceAccountedLineDetailsModal && (
                  <AccountingExpenseDetailsForm
                    saveAccountingLine={handleSaveAccountedRow}
                    deleteDetailedExpesneLine={handleDeleteDetailedExpesneLine}
                  />
                )}
                {showAdvannceSettlementForm && overspent && (
                  <div className="row g-3 mt-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        Claim Overspent Amount?
                      </label>
                      <select
                        className="form-select"
                        value={claimOverspent}
                        onChange={(e) => setClaimOverspent(e.target.value)}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No, Convert to Donation</option>
                      </select>
                    </div>

                    {claimOverspent === "Yes" && (
                      <div className="col-md-6">
                        <label className="form-label fw-medium">
                          Give the money to:
                        </label>
                        <select
                          className="form-select"
                          value={selectedRecipient}
                          onChange={(e) => setSelectedRecipient(e.target.value)}
                        >
                          <option defaultValue="">
                            -- Select Recipient --
                          </option>
                          {userProfiles?.map((profile: Record<string, any>) => (
                            <option key={profile?.no} value={profile?.no}>
                              {`${profile?.firstName} ${profile?.secondName} ${profile?.lastName}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
                {showAdvannceSettlementForm && underspent && (
                  <div className="row g-3 mt-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        Return Advance Balance?
                      </label>
                      <select
                        className="form-select"
                        value={returnAdvanceBalance}
                        onChange={(e) =>
                          setReturnAdvanceBalance(e.target.value)
                        }
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>

                    {returnAdvanceBalance === "Yes" && (
                      <div className="col-md-6">
                        <label className="form-label fw-medium">
                          Deliverer to Return Balance
                        </label>
                        <select
                          className="form-select"
                          value={selectedDeliverer}
                          onChange={(e) => setSelectedDeliverer(e.target.value)}
                        >
                          <option defaultValue="">
                            -- Select Deliverer --
                          </option>
                          {userProfiles?.map((profile: Record<string, any>) => (
                            <option key={profile?.no} value={profile?.no}>
                              {`${profile?.firstName} ${profile?.secondName} ${profile?.lastName}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </>
              <div className="d-flex justify-content-between mt-4">
                {showAdvannceSettlementForm && (
                  <div className="d-flex gap-2">
                    {formData.imprestStatus === "Issued" ? (
                      <button
                        type="button"
                        className="btn btn-success d-flex align-items-center gap-1"
                        onClick={handleSendSettlementForApproval}
                      >
                        <Check size={16} />
                        Send Settlement For Approval
                      </button>
                    ) : formData.imprestStatus === "Accounted" ? (
                      <button
                        type="button"
                        className="btn btn-outline-danger d-flex align-items-center gap-2 fw-semibold"
                        onClick={handleCancelSettlementApprovalRequest}
                      >
                        <XCircle size={16} />
                        Cancell Settlement Approval Request
                      </button>
                    ) : (
                      ""
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <VerticalProgressCard
            advance={
              formData && isValidSurrenderStatus(formData?.status)
                ? { ...(formData as any), status: formData.status }
                : null
            }
          />
        </div>
      </div>
      <div className="d-flex justify-content-center gap-2 mb-4">
        {[1].map((step) => (
          <div
            key={step}
            className={`rounded-circle  bg-danger"
              }`}
            style={{
              width: "10px",
              height: "10px",
              opacity: 1,
              transition: "all 0.3s ease",
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
