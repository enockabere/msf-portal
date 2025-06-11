"use client";

import React, { useState, useEffect } from "react";
import "./SalaryAdvanceForm.css";
import VerticalProgressCard from "./VerticalProgressCard";
import OperationalHeaderStep from "./Operational/OperationalHeaderStep";
import OperationalLineStep from "./Operational/OperationalLineStep";
import { ExpenseItem, FormData, SalaryAdvanceData } from "@/app/types/advance";
import {
  checkIfMissingRequiredProperty,
  constructDimension,
  findObjectFromArray,
  removeNullAndUndefinedFromObject,
  removeObjectProps,
  safeTypechecker,
  // suggestImprestType,
} from "@/app/utils/helpers";
import { useMySetups } from "@/app/context/SetupContext";
import { useSession } from "next-auth/react";
import {
  batchRequest,
  codeUnit,
  createResource,
  getResource,
  patchResource,
  putResource,
} from "@/app/lib/api/http";
import Swal from "sweetalert2";
import { formatDate } from "@/app/utils/dateFormats";
import {
  batchRequestOptions,
  BatchRequestResponse,
  RequestResponse,
} from "@/app/types/options";
import { useAdvance } from "@/app/context/AdvanceContext";
<<<<<<< HEAD
import {
  ArrowDown,
  ArrowRightCircle,
  Check,
  RefreshCw,
  Undo2,
  XCircle,
} from "lucide-react";
=======
import { ArrowDown, Check, RefreshCw, Undo2, XCircle } from "lucide-react";
>>>>>>> 462b752 (update fixes)
import { usePageLoader } from "@/app/context/PageLoaderContext";

interface ValidateLine {
  expenseRequestOption?: Array<Record<string, any>>;
  patchBatchRequestOptions?: Array<Record<string, any>>;
}

export default function OperationalAdvanceForm({
  closeModalHandler,
  openSettlmentModalFactory,
}: {
  closeModalHandler?: () => void;
  openSettlmentModalFactory?: (data: FormData, ...args: any) => void;
}) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [paymentMethodType, setPaymentMethodType] = useState<string>("");
  const {
    paymentMethods,
    employeeBanks,
    DEPARTMENTS,
    PROJECT,
    OC,
    expenseCodes,
    fetchSetups,
  } = useMySetups();
  const { formData, expenses, actions, isEditing } = useAdvance();
  const { dispatcher, fetchLineSetup } = actions;
  const { actions: loaderActions } = usePageLoader();
  const { dispatcher: loaderDispatcher } = loaderActions;
  const { data } = useSession();

  function isValidStatus(status: any): status is SalaryAdvanceData["status"] {
    return [
      "Open",
      "Pending Approval",
      "Released",
      "Settled",
      "Accounted",
      "Rejected",
      "Issued",
    ].includes(status);
  }

  const handleFormChange = (field: keyof FormData, value: string) => {
    dispatcher({
      type: "CHANGE_ADVANCE_FORMDATA_FIELD",
      payload: { [field]: value },
    });
    handleSettingPaymentMethodType();
    // handleSettingReletedTravelRequestControl(field, value);
  };
<<<<<<< HEAD
  async function handleSettingReletedTravelRequestControl(
    field: keyof FormData,
    value: string
  ) {
    const assumedImprestTypes = ["OPERATION", "TRAVEL"];
    let imprestType: string;
    if (field === "imprestType") {
      for (const type of assumedImprestTypes) {
        const suggestedType = suggestImprestType(type, value);
        if (suggestedType) imprestType = suggestedType;
      }
      switch (imprestType) {
        case "TRAVEL": {
          loaderDispatcher({
            type: "PATCH_LOADING_STATE",
            payload: {
              loading: true,
              message: "",
            },
          });
          if (data.user.profile.type === "Employee") {
            await fetchSetups([
              {
                travelRequests: {
                  filters: {
                    documentType: "Employee",
                    travellerNo: data?.user?.profile?.no,
                    approvalStatus: "Released",
                  },
                },
              },
            ]);
            dispatcher({
              type: "SET_SHOW_ASSOCIATED_TRAVEL_REQUEST_CONTROL",
              payload: true,
            });
          }
          loaderDispatcher({
            type: "PATCH_LOADING_STATE",
            payload: {
              loading: false,
              message: "",
            },
          });
          break;
        }
        default: {
          dispatcher({
            type: "SET_SHOW_ASSOCIATED_TRAVEL_REQUEST_CONTROL",
            payload: false,
          });
        }
      }
    }
  }
=======
  // async function handleSettingReletedTravelRequestControl(field: keyof FormData, value: string) {
  //   const assumedImprestTypes = ["OPERATION", "TRAVEL"];
  //   let imprestType: string;
  //   if (field === 'imprestType') {
  //     for (const type of assumedImprestTypes) {
  //       const suggestedType = suggestImprestType(type, value);
  //       if (suggestedType)
  //         imprestType = suggestedType;
  //     }
  //     switch (imprestType) {
  //       case 'TRAVEL': {
  //         loaderDispatcher({
  //           type: 'PATCH_LOADING_STATE',
  //           payload: {
  //             loading: true,
  //             message: '',
  //           }
  //         });
  //         if (data.user.profile.type === 'Employee') {
  //           await fetchSetups([
  //             {
  //               'travelRequests': {
  //                 filters: {
  //                   documentType: 'Employee',
  //                   travellerNo: data?.user?.profile?.no,
  //                   approvalStatus: 'Released',
  //                 }
  //               }
  //             }
  //           ]);
  //           dispatcher({
  //             type: 'SET_SHOW_ASSOCIATED_TRAVEL_REQUEST_CONTROL',
  //             payload: true,
  //           });
  //         };
  //         loaderDispatcher({
  //           type: 'PATCH_LOADING_STATE',
  //           payload: {
  //             loading: false,
  //             message: '',
  //           }
  //         });
  //         break;
  //       };
  //       default: {
  //         dispatcher({
  //           type: 'SET_SHOW_ASSOCIATED_TRAVEL_REQUEST_CONTROL',
  //           payload: false,
  //         });
  //       }
  //     }
  //   }
  // }
>>>>>>> 462b752 (update fixes)
  const handleExpenseChange = <K extends keyof ExpenseItem>(
    index: number,
    field: K,
    value: ExpenseItem[K]
  ) => {
    const dimensionfields = {};
    switch (field) {
      case "operationCenter": {
        const selectedDimention = findObjectFromArray(OC, "code", value);
        if (selectedDimention) {
          dimensionfields[
            `shortcutDimension${selectedDimention.globalDimensionNo}Code`
          ] = value;
        }
        break;
      }
      case "costCenter": {
        const selectedDimention = findObjectFromArray(
          DEPARTMENTS,
          "code",
          value
        );
        if (selectedDimention) {
          dimensionfields[
            `shortcutDimension${selectedDimention.globalDimensionNo}Code`
          ] = value;
        }
        break;
      }
      case "project": {
        const selectedDimention = findObjectFromArray(PROJECT, "code", value);
        if (selectedDimention) {
          dimensionfields[
            `shortcutDimension${selectedDimention.globalDimensionNo}Code`
          ] = value;
        }
        break;
      }
    }
    dispatcher({
      type: "CHANGE_EXPENSE_LINE",
      payload: {
        index,
        update: {
          [field]: value,
          ...dimensionfields,
        },
      },
    });
  };

  const handleFileChange = (index: number, file: File | null) => {
    console.log(index, file);
  };

  function handleSettingPaymentMethodType() {
    if (!formData?.paymentMethod) return null;
    const type: string = findObjectFromArray(
      paymentMethods,
      "code",
      formData?.paymentMethod
    )?.type as string;
    setPaymentMethodType(type);
  }

  const removeExpenseLine = (index: number) => {
    dispatcher({
      type: "REMOVE_EXPENSE_LINE",
      payload: {
        index,
      },
    });
  };

  const addExpenseLine = () => {
    dispatcher({
      type: "ADD_NEW_ADVANCE_LINE",
      payload: {
        expenseCode: "",
        unitCost: NaN,
        description: "",
        operationCenter:
          data?.user?.profile?.[
            `shortcutDimension${OC?.[0]?.["globalDimensionNo"]}Code`
          ],
        costCenter:
          data?.user?.profile?.[
            `shortcutDimension${DEPARTMENTS?.[0]?.["globalDimensionNo"]}Code`
          ],
        project:
          data?.user?.profile?.[
            `shortcutDimension${PROJECT?.[0]?.["globalDimensionNo"]}Code`
          ],
        [`shortcutDimension${OC?.[0]?.["globalDimensionNo"]}Code`]:
          data?.user?.profile?.[
            `shortcutDimension${OC?.[0]?.["globalDimensionNo"]}Code`
          ],
        [`shortcutDimension${DEPARTMENTS?.[0]?.["globalDimensionNo"]}Code`]:
          data?.user?.profile?.[
            `shortcutDimension${DEPARTMENTS?.[0]?.["globalDimensionNo"]}Code`
          ],
        [`shortcutDimension${PROJECT?.[0]?.["globalDimensionNo"]}Code`]:
          data?.user?.profile?.[
            `shortcutDimension${PROJECT?.[0]?.["globalDimensionNo"]}Code`
          ],
      },
    });
  };

  const handleNext = async () => {
    const strippedFormData = removeNullAndUndefinedFromObject(formData);
    const missingRequiredValuesBeforeNext = checkIfMissingRequiredProperty(
      strippedFormData,
      ["imprestType", "currencyCode"]
    );
    if (
      !missingRequiredValuesBeforeNext ||
      missingRequiredValuesBeforeNext.missing
    ) {
      return Swal.fire(
        "Warning!",
        `Missing [${missingRequiredValuesBeforeNext.prop.join(
          " , "
        )}] which are required before adding lines!.`,
        "warning"
      );
    }
    fetchLineSetup();
    setCurrentStep(2);
  };

  const handlePrev = () => {
    setCurrentStep(1);
  };
  const postResourceAction = async (resourceCode: any) => {
    const response = await getResource("imprest", {
      params: {
        filters: {
          no: resourceCode,
        },
      },
    });
    if (response.error) {
      Swal.fire(
        "Error!",
        "Error retrieving the just created advance.",
        "error"
      );
      closeModalHandler();
      return;
    }
    dispatcher({
      type: "OPEN_EXISTING_ADVANCE",
      payload: response.value?.at(0),
    });
    dispatcher({
      type: "ADVANCE_CREATION_STATUSES",
      payload: {
        isNew: false,
        isEditing: response?.status === "Open",
        setForView: true,
      },
    });
    handlePrev();
  };

  const handleSubmit = async () => {
    try {
      loaderDispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: true,
          message: "Saving advance...",
        },
      });
      const pDate = new Date().toISOString();
      const presets: Record<string, any> = {
        documentType: "Imprest",
        postingDate: formatDate(pDate, "yyyy-MM-dd"),
        employeeNo: data.user?.profile?.no,
        requestedBy: data.user?.profile?.no,
        requestedByFor: data.user?.profile?.no,
      };
      for (const [key, value] of Object.entries(data?.user.profile)) {
        if (
          key
            .toLocaleLowerCase()
            .includes("shortcutDimension".toLocaleLowerCase())
        ) {
          presets[key] = value;
        }
      }
      let savedLines = [];
      if (!expenses.length && (isEditing || formData?.status === "Open")) {
        const res = await getResource("imprestLine", {
          params: {
            filters: {
              documentNo: formData?.no,
            },
          },
        });
        if (res.error) {
          Swal.fire(res.error.code, res.error.message, "error");
          return;
        }
        savedLines = res.value;
        dispatcher({
          type: "SET_EXISTING_ADVANCE_LINES",
          payload: res.value,
        });
      }
      if (!expenses.length && !savedLines.length) {
        loaderDispatcher({
          type: "PATCH_LOADING_STATE",
          payload: {
            loading: false,
            message: "",
          },
        });
        return Swal.fire(
          "Error!",
          "You must add at least one advance line to proceed!",
          "warning"
        );
      }
      loaderDispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          message: "Preparing data...",
        },
      });
      const strippedPayLoad = removeNullAndUndefinedFromObject({
        ...formData,
        ...presets,
      });
      const knownSchema = removeObjectProps(strippedPayLoad, [
        "cashCollectionDate",
        "idPassportNumber",
        "accountNo",
        "branch",
        "swiftCode",
        "amountToPayHeader",
      ]);
      const isMissingRequiredProp = checkIfMissingRequiredProperty(
        knownSchema,
        [
          "documentType",
          "imprestType",
          "postingDate",
          "employeeNo",
          "paymentMethod",
          "Purpose",
        ]
      );
      if (!isMissingRequiredProp) {
        loaderDispatcher({
          type: "PATCH_LOADING_STATE",
          payload: {
            loading: false,
            message: "",
          },
        });
        return Swal.fire("Validation Error!", `Not a valid payload`);
      }
      if (isMissingRequiredProp.missing) {
        loaderDispatcher({
          type: "PATCH_LOADING_STATE",
          payload: {
            loading: false,
            message: "",
          },
        });
        return Swal.fire(
          "Validation Error!",
          `Missing [${isMissingRequiredProp.prop.join(",")}] ${
            isMissingRequiredProp.prop.length > 1 ? "Properties" : "Property"
          }`
        );
      }
      const lineValidation = handleLineValidation();
      if (!lineValidation)
        return Swal.fire("Error.", "Lines could not be validated");
      loaderDispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          message: "Submitting...",
        },
      });
      let res: RequestResponse = {};
<<<<<<< HEAD
      if (isEditing || formData?.status === "Open") {
        if (knownSchema.currencyCode === "") knownSchema.currencyCode = "";
        const {
          currencyCode,
          imprestType,
          no,
          documentType,
          Purpose,
          phoneNo,
          paymentMethod,
        } = knownSchema;
=======
      if (knownSchema.currencyCode === "KES") {
        knownSchema.currencyCode = " ";
      };
      console.log('currency code after implicit mod: ', knownSchema.currencyCode);
      if (isEditing || formData?.status === 'Open') {
        const { currencyCode, imprestType, no, documentType, Purpose, phoneNo, paymentMethod } = knownSchema;
>>>>>>> 462b752 (update fixes)
        res = await putResource("imprest", {
          primaryKey: ["no", "documentType"],
          data: {
            currencyCode,
            imprestType,
            no,
            documentType,
            Purpose,
            phoneNo,
            paymentMethod,
          },
        });
      } else {
        res = await createResource("imprest", {
          data: knownSchema,
        });
      }
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
      loaderDispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          message: "Submitting advance lines...",
        },
      });
      await handleSubmittingAdvanceLine(lineValidation, res as FormData);
      Swal.fire(
        "Success",
        `${res.imprestType} advance was ${
          isEditing ? "updated" : "created"
        } successfully!`,
        "success"
      ).then(async (result) => {
        if (result.isConfirmed) {
          loaderDispatcher({
            type: "PATCH_LOADING_STATE",
            payload: {
              message: "Just a second...",
            },
          });
          await handleSendForApproval(res?.no);
          // await postResourceAction(res?.no);
        }
      });
    } catch (error: any) {
      loaderDispatcher({
        type: "PATCH_LOADING_STATE",
        payload: {
          loading: false,
          message: "",
        },
      });
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

  function handleLineValidation(): ValidateLine | undefined {
    try {
      const expenseRequestOption: batchRequestOptions[] = [];
      const patchBatchRequestOptions = [];
      expenses.forEach((expense: ExpenseItem, index: number) => {
        const operationCenterDimention = findObjectFromArray(
          OC,
          "code",
          expense.operationCenter
        );
        const costCenterDimension = findObjectFromArray(
          DEPARTMENTS,
          "code",
          expense.costCenter
        );
        const projectDimension = findObjectFromArray(
          PROJECT,
          "code",
          expense.project
        );
        const glAccount = findObjectFromArray(
          expenseCodes,
          "code",
          expense.expenseCode
        );
        if (safeTypechecker(glAccount) !== "Object")
          throw new Error(`line ${index + 1} is invalid!`);
        expense[constructDimension(operationCenterDimention)] =
          expense.operationCenter;
        expense[constructDimension(costCenterDimension)] = expense.costCenter;
        expense[constructDimension(projectDimension)] = expense.project;
        expense.description = glAccount.description as string;
        const linePayload = {
          ...expense,
          Quantity: 1,
          documentType: "Imprest",
        };
        for (const [key, value] of Object.entries(data?.user.profile)) {
          if (
            key
              .toLocaleLowerCase()
              .includes("shortcutDimension".toLocaleLowerCase())
          ) {
            const preservedUpdates = [
              constructDimension(operationCenterDimention),
              constructDimension(costCenterDimension),
              constructDimension(projectDimension),
            ];
            if (!preservedUpdates.includes(key)) {
              linePayload[key] = value;
            }
          }
        }
        const strippedLinePayload =
          removeNullAndUndefinedFromObject(linePayload);
        const validSchema = removeObjectProps(strippedLinePayload, [
          "operationCenter",
          "costCenter",
          "project",
        ]);
        const validateRequiredProps = checkIfMissingRequiredProperty(
          validSchema,
          ["documentType", "expenseCode", "unitCost", "Quantity"]
        );
        if (!validateRequiredProps)
          throw new Error(`Line ${index + 1} could noe be validated`);
        if (validateRequiredProps.missing) {
          throw new Error(
            `Line ${index + 1} is missing ${validateRequiredProps.prop.join(
              ","
            )} properties`
          );
        }
        if (
          (isEditing || formData?.status === "Open") &&
          validSchema?.lineNo >= 0
        ) {
          patchBatchRequestOptions.push(
            patchResource("imprestLine", {
              primaryKey: ["documentNo", "documentType", "lineNo"],
              data: validSchema,
            })
          );
        } else {
          expenseRequestOption.push({
            method: "POST",
            endpoint: "imprestLine",
            data: validSchema,
          } satisfies batchRequestOptions);
        }
      });
      return { expenseRequestOption, patchBatchRequestOptions };
    } catch (error: any) {
      throw new Error(`Error when validating advance lines. ${error.message}`);
    }
  }
  async function handleSubmittingAdvanceLine(
    validatedLine: ValidateLine,
    header: FormData
  ) {
    try {
      if (safeTypechecker(header) !== "Object" || !Object.keys(header).length) {
        throw new Error("We ran into an error!, Try again later!");
      }
      const defaults = {
        documentNo: header.no,
      };
      const res: RequestResponse = {};
      const { expenseRequestOption, patchBatchRequestOptions } = validatedLine;
      const batchRequestOption: batchRequestOptions[] = [];
      if (expenseRequestOption.length) {
        expenseRequestOption.forEach(
          (option: batchRequestOptions, index: number) => {
            option.data = {
              ...option.data,
              ...defaults,
            };
            const validateRequiredProps = checkIfMissingRequiredProperty(
              option.data,
              [
                "documentNo",
                "documentType",
                "expenseCode",
                "unitCost",
                "Quantity",
              ]
            );
            if (!validateRequiredProps)
              throw new Error(`Line ${index + 1} could noe be validated`);
            if (validateRequiredProps.missing) {
              throw new Error(
                `Line ${index + 1} is missing ${validateRequiredProps.prop.join(
                  ","
                )} properties`
              );
            }
            batchRequestOption.push(option);
          }
        );
      }

      const addedLines = expenses.length;
      const lineCaption = addedLines > 1 ? "lines" : "line";
      if (!isEditing || !formData?.status) {
        if (batchRequestOption.length) {
          if (batchRequestOption.length !== expenses.length)
            Swal.fire(
              "Alert!",
              `${
                addedLines > 1 ? "Some" : "The"
              } advance ${lineCaption} will not be submitted due to errors`,
              "info"
            );
          const res: BatchRequestResponse = await batchRequest({
            batch: batchRequestOption,
          });
          if (res.error) {
            throw new Error(res.error.message);
          } else {
            let failedLines = 0;
            for (const [, value] of Object.entries(res)) {
              if (value.error) {
                failedLines++;
              }
            }
            if (failedLines) {
              throw new Error(
                `${failedLines} ${
                  failedLines > 1 ? "lines" : "line"
                } did not save!`
              );
            }
          }
        } else {
          throw new Error(
            `The advance ${lineCaption} you added had errors and did not submit!. Navigate to your advances list and locate advance with SN #${header.no} and update lines!`
          );
        }
      } else {
        Promise.all([
          batchRequest({
            batch: batchRequestOption,
          }),
          Promise.all(patchBatchRequestOptions),
        ])
          .then((response) => {
            response.flat(Infinity).forEach((result: Record<string, any>) => {
              if (result?.imprestLine) {
                if (result["imprestLine"]?.error) {
                  res.error = result["imprestLine"]?.error;
                }
              }
              if (result.error) {
                res.error = result.error;
              }
            });
          })
          .catch((error: any) => {
            throw error;
          });
        if (res.error) {
          throw new Error(`${res.error.code}. ${res.error.message}`);
        }
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }
  const handleSendForApproval = async (no: string) => {
    try {
<<<<<<< HEAD
      if (formData.no) {
        const response = await codeUnit("SendAdvanceForApproval", {
          data: {
            docNo: formData.no,
          },
=======
      if (no) {
        const response = await codeUnit('SendAdvanceForApproval', {
          data: {
            docNo: no,
          }
>>>>>>> 462b752 (update fixes)
        });
        if (response.error) {
          return Swal.fire(
            response.error.code,
            response.error.message,
            "error"
          );
        }
<<<<<<< HEAD
        Swal.fire(
          "Success",
          `${formData.imprestType} advance successfully sent for approval`,
          "success"
        ).then(async (result) => {
          if (result.isConfirmed) {
            await postResourceAction(formData.no);
          }
        });
=======
        Swal.fire('Success', `${formData.imprestType} advance successfully sent for approval`, 'success')
          .then(async (result) => {
            if (result.isConfirmed) {
              await postResourceAction(no);
            }
          })
>>>>>>> 462b752 (update fixes)
      }
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleCancelApprovalRequest = async () => {
    try {
      if (formData.no) {
        const response = await codeUnit("CancelAdvanceApprovalRequest", {
          data: {
            docNo: formData.no,
          },
        });
        if (response.error) {
          return Swal.fire(
            response.error.code,
            response.error.message,
            "error"
          );
        }
        Swal.fire(
          "Success",
          `${formData.imprestType} advance approval request successfully cancelled`,
          "success"
        ).then(async (result) => {
          if (result.isConfirmed) {
            await postResourceAction(formData.no);
          }
        });
      }
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    }
  };
  const handleSettlementButton = () => {
    openSettlmentModalFactory(formData, "isSettlement");
  };
  const getConditionButtons = (condtion: any) => {
    const conditionalButtons = {
      default: [
        {
<<<<<<< HEAD
          id: "klkfrtrsjro",
          action: () => {},
          label: "Save & Continue",
=======
          id: 'klkfrtrsjro',
          action: () => { },
          label: 'View Expense Lines',
>>>>>>> 462b752 (update fixes)
          icon: <ArrowDown size={16} />,
          classes:
            "btn btn-primary d-flex align-items-center gap-2 fw-semibold",
          stepOne: true,
          stepTwo: false,
        },
      ],
      isNew: [
        {
          id: "ewrtyujhht",
          action: async () => await handleNext(),
<<<<<<< HEAD
          label: "Save & Continue",
=======
          label: 'View Expense Lines',
>>>>>>> 462b752 (update fixes)
          icon: <ArrowDown size={16} />,
          classes:
            "btn btn-primary d-flex align-items-center gap-2 fw-semibold",
          stepOne: true,
          stepTwo: false,
        },
        {
          id: "fghgjgttuyutr",
          action: async () => await handleSubmit(),
          label: "Submit Advance",
          icon: <Check size={16} />,
          classes: "btn btn-success  d-flex align-items-center gap-2",
          stepOne: false,
          stepTwo: true,
        },
      ],
      Open: [
        {
          id: "ggjifojoiejfefocnnei",
          action: async () => await handleSubmit(),
          label: "Update Advance",
          classes:
            "btn btn-outline-primary d-flex align-items-center gap-2 fw-semibold",
          icon: <RefreshCw size={16} />,
          stepOne: true,
          stepTwo: true,
        },
<<<<<<< HEAD
        {
          id: "rsgrthpokpoktr",
          action: async () => handleSendForApproval(),
          label: "Send For Approval",
          classes: "btn btn-info d-flex align-items-center gap-2 fw-semibold",
          icon: <ArrowRightCircle size={16} />,
          stepOne: true,
          stepTwo: true,
        },
=======
        // {
        //   id: 'rsgrthpokpoktr',
        //   action: async () => handleSendForApproval(),
        //   label: 'Send For Approval',
        //   classes: 'btn btn-info d-flex align-items-center gap-2 fw-semibold',
        //   icon: <ArrowRightCircle size={16} />,
        //   stepOne: true,
        //   stepTwo: true,
        // },
>>>>>>> 462b752 (update fixes)
        {
          id: "hoiyhjtoigjfoieje",
          action: async () => await handleNext(),
<<<<<<< HEAD
          label: "Save & Continue",
=======
          label: 'View Expense Lines',
>>>>>>> 462b752 (update fixes)
          icon: <ArrowDown size={16} />,
          classes:
            "btn btn-primary d-flex align-items-center gap-2 fw-semibold",
          stepOne: true,
          stepTwo: false,
        },
      ],
      "Pending Approval": [
        {
          id: "poeirtorwfnviwireu",
          action: async () => await handleCancelApprovalRequest(),
          label: "Cancel Approval Request",
          icon: <XCircle size={16} />,
          classes:
            "btn btn-outline-danger d-flex align-items-center gap-2 fw-semibold",
          stepOne: true,
          stepTwo: true,
        },
        {
          id: "qsfrgjorijioji",
          action: async () => await handleNext(),
<<<<<<< HEAD
          label: "Save & Continue",
=======
          label: 'View Expense Lines',
>>>>>>> 462b752 (update fixes)
          icon: <ArrowDown size={16} />,
          classes:
            "btn btn-primary d-flex align-items-center gap-2 fw-semibold",
          stepOne: true,
          stepTwo: false,
        },
      ],
      Issued: [
        {
          id: "yiourwivenunnuw",
          action: () => handleSettlementButton(),
          label: "Settle Advance",
          icon: <Undo2 size={16} />,
          classes: "btn btn-outline-warning d-flex align-items-center gap-2",
          stepOne: true,
          stepTwo: true,
        },
        {
          id: "iutieorvtrutnriewh",
          action: async () => await handleNext(),
<<<<<<< HEAD
          label: "Save & Continue",
=======
          label: 'View Expense Lines',
>>>>>>> 462b752 (update fixes)
          icon: <ArrowDown size={16} />,
          classes:
            "btn btn-primary d-flex align-items-center gap-2 fw-semibold",
          stepOne: true,
          stepTwo: false,
        },
      ],
    };
    return conditionalButtons[condtion];
  };

  const getProfileValues = async () => {
    if (!formData?.paymentMethod) return null;
    switch (paymentMethodType) {
      case "Mpesa": {
        updateMobileMoneyFields();
        updateEmployeeBank(true);
        updateCashFields(true);

        break;
      }
      case "Cheques":
      case "Bank_x0020_Transfer": {
        if (data.user?.profile?.type !== "Employee") return;
        Promise.allSettled([
          fetchSetups(["banks"]),
          fetchSetups(
            [
              {
                employeeBanks: {
                  filters: {
                    employee: data.user?.profile?.no,
                    default: true,
                  },
                },
              },
            ],
            true
          ),
        ]);
        break;
      }
      case "Cash": {
        updateMobileMoneyFields(true);
        updateEmployeeBank(true);
        break;
      }
    }
  };

  const getBankBranches = async () => {
    if (
      !formData?.bankNo ||
      formData?.bankNo === "undefined" ||
      formData?.bankNo === "null"
    )
      return null;
    await fetchSetups(
      [
        {
          bankBranches: {
            filters: {
              mainBank: formData?.bankNo,
            },
          },
        },
      ],
      true
    );
  };
  function updateMobileMoneyFields(clear: boolean = false) {
    if (clear) {
      handleFormChange("phoneNo", "");
      handleFormChange("idPassportNumber", "");
    } else {
      handleFormChange("phoneNo", String(data.user?.profile?.phoneNo));
      handleFormChange(
        "idPassportNumber",
        String(data.user?.profile?.identificationDocumentNo)
      );
    }
  }
  function updateEmployeeBank(clear: boolean = false) {
    if (clear) {
      handleFormChange("accountNo", "");
      handleFormChange("accountName", "");
      handleFormChange("bankNo", "");
      handleFormChange("branch", "");
      handleFormChange("swiftCode", "");
    } else {
      const bankDetails = employeeBanks[0];
      if (bankDetails && Object.keys(bankDetails).length) {
        handleFormChange("accountNo", bankDetails.accountNo);
        handleFormChange("accountName", bankDetails.name);
        handleFormChange("bankNo", bankDetails.bankCode);
        handleFormChange("branch", bankDetails.bankBranch);
        handleFormChange("swiftCode", bankDetails.swiftCode);
      }
    }
  }

  function updateCashFields(clear: boolean = false) {
    if (clear) {
      handleFormChange("cashCollectionDate", "");
      handleFormChange("cashHours", "");
    }
  }

  useEffect(() => {
    getProfileValues();
  }, [paymentMethodType]);

  useEffect(() => {
    getBankBranches();
  }, [formData?.bankNo]);

  useEffect(() => {
    updateEmployeeBank(
      paymentMethodType !== "Cheques" &&
        paymentMethodType !== "Bank_x0020_Transfer"
    );
    updateMobileMoneyFields(paymentMethodType !== "Mpesa");
    updateCashFields(paymentMethodType !== "Cash");
  }, [employeeBanks, formData?.paymentMethod, paymentMethodType]);

  return (
    <div className="container-fluid d-flex flex-column">
      <div className="row flex-grow-1 gx-1">
        <div className="col-md-8">
          {currentStep === 1 ? (
            <OperationalHeaderStep
              formData={formData}
              onFormChange={handleFormChange}
              buttonsArray={getConditionButtons}
            />
          ) : (
            <OperationalLineStep
              expenses={expenses}
              onExpenseChange={handleExpenseChange}
              onFileChange={handleFileChange}
              onRemoveExpense={removeExpenseLine}
              onAddExpense={addExpenseLine}
              onCancel={handlePrev}
              currency={formData?.currencyCode}
              buttonsArray={getConditionButtons}
            />
          )}
        </div>
        <div className="col-md-4">
          <VerticalProgressCard
            advance={
              isValidStatus(formData.status)
                ? { ...(formData as any), status: formData.status }
                : null
            }
          />
        </div>
      </div>
      <div className="d-flex justify-content-center align-items-center gap-2">
        {[1, 2].map((step) => (
          <div
            key={step}
            className={`rounded-circle ${
              currentStep === step ? "bg-danger" : "bg-secondary"
            }`}
            style={{
              width: "10px",
              height: "10px",
              opacity: currentStep === step ? 1 : 0.5,
              transition: "all 0.3s ease",
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
