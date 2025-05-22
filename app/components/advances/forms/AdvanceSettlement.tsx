"use client";

import React, { useState, useEffect } from "react";
import SettlementExpenseForm from "./SettlementExpenseForm";
import ProgressIndicator from "./Operational/ProgressIndicator";
import { AlertTriangle, ArrowDown, ArrowUp, Check, XCircle } from "lucide-react";
import { useAdvance } from "@/app/context/AdvanceContext";
import { checkIfMissingRequiredProperty, findObjectFromArray, removeNullAndUndefinedFromObject, safeTypechecker } from "@/app/utils/helpers";
import { useMySetups } from "@/app/context/SetupContext";
import Swal from "sweetalert2";
import { batchRequest, codeUnit, createResource, getResource, patchResource } from "@/app/lib/api/http";
import _ from 'lodash';
import { batchRequestOptions, RequestResponse } from "@/app/types/options";

interface Props {
  closeSettlementDialog?: () => void;
}

export default function AdvanceSettlement({
  closeSettlementDialog
}: Props) {
  const [claimOverspent, setClaimOverspent] = useState<string>("No");
  const [returnAdvanceBalance, setReturnAdvanceBalance] =
    useState<string>("No");
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [selectedDeliverer, setSelectedDeliverer] = useState<string>("");

  const { actions, accountedLines, expenses, formData } = useAdvance();
  const { dispatcher } = actions;
  const { currencies, fetchSetups, userProfiles } = useMySetups();

  const totalSurrendered = expenses.reduce(
    (sum, item) => sum + (item?.accountedAmount || 0),
    0
  );

  const totalBalanceAmount = expenses.reduce((sum, item) => sum + item?.balance, 0);
  const overspent = 0 > totalBalanceAmount;
  const fullyAccounted = totalBalanceAmount === 0;
  const underspent = 0 < totalBalanceAmount;


  const validateDetailedLinePayload = (line: Record<string, any>) => {
    console.log('passed line: ', line);
    const strippedPayLoad = removeNullAndUndefinedFromObject(line);
    console.log('stripped line: ', strippedPayLoad)
    const isMissingRequiredProp = checkIfMissingRequiredProperty(
      strippedPayLoad,
      line.entryNo >= 0 ?
        [
          "DetailedLineMgtDocType",
          "DetailedLineMgtDocNo",
          "DetailedLineMgtLineNo",
          "amount",
        ]
        :
        [
          "DetailedLineMgtDocType",
          "DetailedLineMgtDocNo",
          "DetailedLineMgtLineNo",
          "amount",
          "attachment",
        ]
    );
    if (!isMissingRequiredProp)
      throw new Error("Validation Error!. Not a valid payload");
    if (isMissingRequiredProp.missing) {
      throw new Error(`Validation Error!. Missing [${isMissingRequiredProp.prop.join(",")}] ${isMissingRequiredProp.prop.length > 1 ? "Properties" : "Property"
        }`);
    }
  }
  const postRequest = async (): Promise<void> => {
    try {
      const res = await getResource('imprest', {
        params: {
          filters: {
            no: formData?.no,
          },
          '$expand': `imprestLinesAPI($expand=detailedImprestLines)`
        }
      });
      if (res.error) {
        Swal.fire(res.error.code, res.error.message, 'error');
        return;
      }
      if (!res.value?.[0]) {
        Swal.fire('Error', 'We experienced difficulties reloading this document. We are going to close this screen', 'info');
        return closeSettlementDialog();
      }
      const { imprestLinesAPI, ...rest } = res.value[0];
      dispatcher({
        type: 'OPEN_EXISTING_ADVANCE',
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
        type: 'SET_EXISTING_ADVANCE_LINES',
        payload: refetchedLines,
      });
      const draftAccountedLinesState = [...accountedLines];
      const uniqueAccountingLines = _.differenceWith(draftAccountedLinesState, updatedAccountingDetails, (draft: Record<string, any>, updated: Record<string, any>) => {
        return draft.DetailedLineMgtLineNo === updated.DetailedLineMgtLineNo;
      });
      console.log('unique lines: ', uniqueAccountingLines);
      console.log('from fetch lines: ', updatedAccountingDetails);
      dispatcher({
        type: 'SET_DETAILED_ACCOUNTING_LINES',
        payload: [
          ...uniqueAccountingLines,
          ...updatedAccountingDetails,
        ],
      });
    } catch (error: any) {
      Swal.fire('Error!', error.message, 'error');
    }
  }

  const handleSaveAccountedRow = async (index: number, exp: Record<string, any>): Promise<void> => {
    try {
      if (
        safeTypechecker(index) === 'Null' ||
        safeTypechecker(index) === 'Undefined' ||
        index < 0
      ) return;
      if (safeTypechecker(exp) !== 'Object') return;
      const lineAccounted = findObjectFromArray(accountedLines, 'DetailedLineMgtLineNo', exp.lineNo);
      if (!lineAccounted) {
        Swal.fire('Invalid request!', 'You must account this line first by adding amount and uploading the receipt', 'warning');
        return;
      }
      if (!lineAccounted.amount || !lineAccounted.attachment) {
        Swal.fire('Invalid request!', 'You must account this line first by adding amount and uploading the receipt', 'warning');
        return;
      }
      validateDetailedLinePayload(lineAccounted);
      let response: RequestResponse = {};
      if (Number(lineAccounted.entryNo) >= 0) {
        response = await patchResource('imprestDetailedLine', {
          primaryKey: ['entryNo', 'DetailedLineMgtDocType', 'DetailedLineMgtDocNo', 'DetailedLineMgtLineNo'],
          data: lineAccounted,
        });
      } else {
        response = await createResource('imprestDetailedLine', {
          data: lineAccounted,
        });
      }
      if (response.error) {
        Swal.fire(response.error.code, response.error.message, 'error');
        return;
      }
      await postRequest();
      Swal.fire('Success', 'Line successfully accounted!', 'success');
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  }

  const handleSendSettlementForApproval = async () => {
    try {
      const accountingLinesNotSavedRequestOptions = [];
      const savedAccountingLinesRequestOptions = [];
      accountedLines.forEach((line: Record<string, any>) => {
        if (safeTypechecker(line.entryNo) === 'Null' || safeTypechecker(line.entryNo) === 'Undefined') {
          validateDetailedLinePayload(line);
          if (!line.amount || !line.attachment) {
            Swal.fire('Invalid request!', 'You must account this line first by adding amount and uploading the receipt', 'warning');
            return;
          }
          accountingLinesNotSavedRequestOptions.push({
            method: 'POST',
            endpoint: 'imprestDetailedLine',
            data: line,
          } satisfies batchRequestOptions)
        }
        else if (line.entryNo >= 0) {
          validateDetailedLinePayload(line);
          savedAccountingLinesRequestOptions.push(patchResource('imprestDetailedLine', {
            primaryKey: ['entryNo', 'DetailedLineMgtDocType', 'DetailedLineMgtDocNo', 'DetailedLineMgtLineNo'],
            data: line,
          }));
        }
      });
      Promise.all([
        batchRequest({
          batch: accountingLinesNotSavedRequestOptions
        }),
        Promise.all(savedAccountingLinesRequestOptions)
      ]).then(async (response) => {
        console.log('response from concurrency: ', response)
        dispatcher({
          type: 'SET_DETAILED_ACCOUNTING_LINES',
          payload: response,
        });
        const res = await codeUnit('AdvnaceLiquidation', {
          data: {
            docNo: formData?.no,
          }
        });
        if (res.error) {
          return Swal.fire(res.error.code, res.error.message, 'error');
        }
        await postRequest();
        Swal.fire('Success', 'Successfully sent settlement for approval.', 'success');
      });
    } catch (error: any) {
      Swal.fire('Error!', error?.message, 'error');
    }
  }

  const handleCancelSettlementApprovalRequest = async () => {
    try {
      const res = await codeUnit('CancelAdvanceApprovalRequest', {
        data: {
          docNo: formData?.no,
        }
      });
      if (res.error) {
        return Swal.fire(res.error.code, res.error.message, 'error');
      }
      await postRequest();
      Swal.fire('Success', 'Successfully cancelled settlment approval request', 'success');
    } catch (error: any) {
      Swal.fire('Error!', error.meesage, 'error');
    }
  }

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
    fetchSetups([
      'userProfiles'
    ]);
  });

  useEffect(() => {
    if (expenses && expenses.length) {
      const getExpenseLinesAccountingLines = expenses.map((line: Record<string, any>) => {
        return getResource('imprestDetailedLine', {
          params: {
            filters: {
              DetailedLineMgtDocType: line.documentType,
              DetailedLineMgtDocNo: line.documentNo,
              DetailedLineMgtLineNo: line.lineNo,
            },
            '$select': 'entryNo, DetailedLineMgtDocType, DetailedLineMgtDocNo, DetailedLineMgtLineNo, description, amount, financeAmount, attachmentName',
          }
        });
      });
      Promise.all(getExpenseLinesAccountingLines)
        .then((response) => {
          console.log('response from the concurrent query: ', response[0].value);
          dispatcher({
            type: 'SET_DETAILED_ACCOUNTING_LINES',
            payload: response[0].value,
          });
        })
        .catch((error: any) => {
          Swal.fire('Error!', error.message, 'error');
        })
    }
  }, [expenses, dispatcher]);

  return (
    <div className="container-fluid d-flex flex-column min-vh-100">
      <div className="row flex-grow-1">
        <div className="col-md-9">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-primary-subtle">
              <h5 className="mb-0 fw-semibold text-dark">
                Advance Settlement
              </h5>
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
                      <h5 className="mt-2 mb-0 text-success fw-bold">
                        {findObjectFromArray(currencies, 'code', formData?.currencyCode)?.description as string || 'KES'} {formData?.amountToPayHeader}
                      </h5>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 border rounded bg-light">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Amount Justified</span>
                        <ArrowDown size={16} className="text-primary" />
                      </div>
                      <h5 className="mt-2 mb-0 text-primary fw-bold">
                        {findObjectFromArray(currencies, 'code', formData?.currencyCode)?.description as string || 'KES'} {totalSurrendered.toLocaleString()}
                      </h5>
                    </div>
                  </div>
                </div>
                <div
                  className={`toast d-flex align-items-center w-100 text-white border-0 show ${overspent
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
                            {findObjectFromArray(currencies, 'code', formData?.currencyCode)?.description as string || 'KES'}
                            {" "}
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
                            {findObjectFromArray(currencies, 'code', formData?.currencyCode)?.description as string || 'KES'}
                            {" "}
                            {totalBalanceAmount.toLocaleString()}
                          </strong>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <SettlementExpenseForm
                  saveAccountingLine={handleSaveAccountedRow}
                />
                {overspent && (
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
                          onChange={(e) =>
                            setSelectedRecipient(e.target.value)
                          }
                        >
                          <option defaultValue="">-- Select Recipient --</option>
                          {
                            userProfiles?.map((profile: Record<string, any>) => (
                              <option key={profile?.no} value={profile?.no}>
                                {`${profile?.firstName} ${profile?.secondName} ${profile?.lastName}`}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
                {underspent && (
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
                          onChange={(e) =>
                            setSelectedDeliverer(e.target.value)
                          }
                        >
                          <option defaultValue="">-- Select Deliverer --</option>
                          {
                            userProfiles?.map((profile: Record<string, any>) => (
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
                <div className="d-flex gap-2">
                  {
                    formData.imprestStatus === 'Issued' ?
                      (
                        <button
                          type="button"
                          className="btn btn-success d-flex align-items-center gap-1"
                          onClick={handleSendSettlementForApproval}
                        >
                          <Check size={16} />
                          Send Settlement For Approval
                        </button>
                      ) :
                      formData.imprestStatus === 'Accounted' ?
                        (
                          <button
                            type="button"
                            className="btn btn-outline-danger d-flex align-items-center gap-2 fw-semibold"
                            onClick={handleCancelSettlementApprovalRequest}
                          >
                            <XCircle size={16} />
                            Cancell Settlement Approval Request
                          </button>
                        ) : ''
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <ProgressIndicator
            currentStep={1}
            isSubmitted={true}
          />
        </div>
      </div>
      <div className="d-flex justify-content-center gap-2 mb-4">
        {[1, 2].map((step) => (
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
