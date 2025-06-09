"use client";

import React from "react";
import {
  PlusCircle,
  FileChartColumnIncreasing,
  Building2,
  FolderOpen,
  DollarSign,
} from "lucide-react";
import { useAdvance } from "@/app/context/AdvanceContext";
import { useMySetups } from "@/app/context/SetupContext";
import { findObjectFromArray } from "@/app/utils/helpers";
import AccountingExpenseDetailsForm from "./AccountingExpenseDetailsForm";

interface Props {
  saveAccountingLine?: (
    index: number,
    exp: Record<string, any>
  ) => Promise<void>;
  deleteDetailedExpesneLine?: (
    index: number,
    line: Record<string, any>
  ) => Promise<void>;
  selectedAdvanceLineForView?: Record<string, any>;
  selectedAdvanceLineForViewAccountingDetails?: Record<string, any>[];
  selectedLineIndex?: number | null;
  setActiveLineIndex?: (index: number) => void;
  addNewEntryToAccount?: (exp: Record<string, any>) => void;
  handleViewLineAccountingDetails?:(index: number, exp: Record<string, any>) => Promise<void>
}

export default function SettlementExpenseForm({
  saveAccountingLine,
  deleteDetailedExpesneLine,
  selectedAdvanceLineForView,
  selectedAdvanceLineForViewAccountingDetails,
  selectedLineIndex,
  setActiveLineIndex,
  addNewEntryToAccount,
  handleViewLineAccountingDetails,
}: Props) {
  const { expenses } = useAdvance();
  const { DEPARTMENTS, PROJECT } = useMySetups();

  return (
    <div className="container-fluid px-0 my-3">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-danger text-white py-3">
              <h5 className="card-title mb-0 d-flex align-items-center">
                <FileChartColumnIncreasing size={20} className="me-2" />
                Settlement Expense Details
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="accordion" id="settlementAccordion">
                {expenses.map((exp, idx) => {
                  const departmentName = findObjectFromArray(
                    DEPARTMENTS,
                    "code",
                    exp[
                      `shortcutDimension${DEPARTMENTS[0]["globalDimensionNo"]}Code`
                    ]
                  )?.name as string;

                  const projectName = findObjectFromArray(
                    PROJECT,
                    "code",
                    exp[
                      `shortcutDimension${PROJECT[0]["globalDimensionNo"]}Code`
                    ]
                  )?.name as string;

                  const isCurrentLine =
                    selectedLineIndex === idx &&
                    selectedAdvanceLineForView?.lineNo === exp.lineNo;

                  return (
                    <div
                      className="accordion-item border-0 border-bottom"
                      key={`${exp?.expenseCode}-${exp?.lineNo}`}
                    >
                      <h2 className="accordion-header" id={`heading-${idx}`}>
                        <button
                          className="accordion-button collapsed bg-light text-dark fw-medium py-2 px-3 border-0 shadow-none"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapse-${idx}`}
                          aria-expanded="false"
                          aria-controls={`collapse-${idx}`}
                          onClick={() => {setActiveLineIndex?.(idx);handleViewLineAccountingDetails(idx, exp)}}
                        >
                          <div className="d-flex align-items-center justify-content-between w-100 me-2">
                            <div className="d-flex align-items-center flex-grow-1">
                              <div className="bg-primary rounded-circle p-1 me-2">
                                <DollarSign size={12} className="text-white" />
                              </div>
                              <div className="me-3">
                                <div className="fw-bold text-dark small">
                                  {exp.description || exp.expenseCode}
                                </div>
                                <small className="text-muted">
                                  Line #{exp.lineNo}
                                </small>
                              </div>
                            </div>

                            <div className="d-flex align-items-center gap-3 flex-shrink-0">
                              <div className="text-center">
                                <div className="small text-muted">
                                  Cost Center
                                </div>
                                <div className="fw-medium small">
                                  {departmentName || "N/A"}
                                </div>
                              </div>

                              <div className="text-center">
                                <div className="small text-muted">Project</div>
                                <div className="fw-medium small">
                                  {projectName || "N/A"}
                                </div>
                              </div>

                              <div className="text-center">
                                <div className="small text-muted">Amount</div>
                                <div className="badge bg-success small">
                                  KES {exp.amountToPay?.toLocaleString()}
                                </div>
                              </div>

                              <div className="text-center">
                                <div className="small text-muted">
                                  Surrendered
                                </div>
                                <div className="fw-medium small">
                                  KES{" "}
                                  {exp?.accountedAmount?.toLocaleString() ||
                                    "0"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                      </h2>
                      <div
                        id={`collapse-${idx}`}
                        className="accordion-collapse collapse"
                        aria-labelledby={`heading-${idx}`}
                        data-bs-parent="#settlementAccordion"
                      >
                        <div className="accordion-body p-3 bg-white">
                          <div className="d-flex justify-content-between align-items-center">
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm px-3 py-1"
                              onClick={() => {
                                addNewEntryToAccount?.(exp);
                              }}
                            >
                              <PlusCircle size={14} className="me-1" />
                              Add Entry
                            </button>
                          </div>

                          {/* Accounting Details Form */}
                          {isCurrentLine && (
                            <div className="mt-3">
                              <div className="card border-0 shadow-sm">
                                <div className="card-body p-3">
                                  <AccountingExpenseDetailsForm
                                    saveAccountingLine={saveAccountingLine}
                                    deleteDetailedExpesneLine={
                                      deleteDetailedExpesneLine
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
