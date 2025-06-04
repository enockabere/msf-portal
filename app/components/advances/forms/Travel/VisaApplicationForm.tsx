import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TravelRequest } from "@/app/types/travel";
import {codeUnit, createResource, getResource, patchResource} from "@/app/lib/api/http";
import Swal from "sweetalert2";
import { useMySetups } from "@/app/context/SetupContext";
import { Save, Wallet } from "lucide-react";
import { decodeValue, removeNullAndUndefinedFromObject } from "@/app/utils/helpers";
import { usePageLoader } from "@/app/context/PageLoaderContext";
import FormSelect from "@/app/components/inputs/FormSelect";
import FormInput from "@/app/components/inputs/FormInput";
import TravelAdvanceGLTable from "@/app/components/travel/TravelAdvanceGLTable";

const VALID_VISA_OPTIONS = [
  { code: 'Yes', description: 'Yes' },
  { code: 'No', description: 'No' },
  { code: 'Not Need', description: 'No Needed' },
];

interface VisaApplication {
  documentType: string,
  requestNo: string,
  profileNo: string,
  visaType: string;
  country: string;
  visaApplicationLines: VisaApplicationLine[];
  [key: string]: any;
}

interface VisaApplicationLine {
  documentType: string;
  requestNo: string;
  profileNo: string;
  visaType: string;
  lineNo?: number;
  countryOfOrigin: string;
  validVisa: string;
  dateIssued: string;
  expiryDate: string;
  name?: string;
  exemptFromTravelling: boolean;
  passportNo: string;
  [key: string]: any;
}

interface VisaApplicationFormProps {
  travelRequest: TravelRequest;
  onSubmit: () => void;
  expenseCodes: Record<string, any>
}

interface VisaApplicationLineProps {
  line: VisaApplicationLine;
  lineIndex: number;
  isReadOnly: boolean;
  countries: Array<Record<string, any>>;
}

const VisaApplicationLine: React.FC<VisaApplicationLineProps> = ({line, lineIndex, isReadOnly, countries}) => {
  const [formData, setFormData] = useState({
    documentType: line.documentType,
    requestNo: line.requestNo,
    profileNo: line.profileNo,
    visaType: line.visaType,
    lineNo: line.lineNo,
    exemptFromTravelling: line.exemptFromTravelling,
    countryOfOrigin: line.countryOfOrigin,
    validVisa: line.validVisa,
    dateIssued: line.dateIssued,
    expiryDate: line.expiryDate,
    passportNo: line.passportNo,
  });
  const [successMessage, setSuccessMessage] = useState('');
  const { loading, actions } = usePageLoader();
  const { dispatcher } = actions;
  const [hasValidVisa, setHasValidVisa] = useState(line.validVisa === 'Yes')

  const canExemptFromTravelling = useMemo(() => !hasValidVisa, [hasValidVisa])

  const handleExemptChange = async (value: boolean) => {
    setFormData((prev) => ({...prev, exemptFromTravelling: value}));

    try {
      const res = await patchResource("visaApplicationLines", {
        data: removeNullAndUndefinedFromObject(formData),
        primaryKey: ['documentType', 'requestNo', 'profileNo', 'visaType', 'lineNo']
      });

      if (res.error) {
        throw new Error(res.error.message);
      }
    } catch (error: any) {
      await Swal.fire("Error updating Visa application line", error.message, "error");
    }
  };

  const handleFormChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      dispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: true,
          message: '',
        }
      });

      const operation = formData.lineNo
        ? await patchResource('visaApplicationLines', {
          data: removeNullAndUndefinedFromObject(formData),
          primaryKey: ['documentType', 'requestNo', 'profileNo', 'visaType', 'lineNo']
        })
        : await createResource('visaApplicationLines', { data: formData });

      if (operation.error) {
        throw new Error(operation.error.message);
      }

      setHasValidVisa(formData.validVisa === 'Yes');
      setSuccessMessage('Saved!');
    } catch (error: any) {
      await Swal.fire('Error saving details', error.message, 'error');
    } finally {
      dispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: false,
          message: '',
        }
      });
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="card bg-light border mt-2">
      <form onSubmit={handleSubmit} className="card-body">
        <div className="d-flex justify-content-between">
          <h5 className="card-title fs-14 fw-bold">
            Traveller: {line.name || 'N/A'}
          </h5>
          {canExemptFromTravelling && (
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id={`exempt-switch-${line.lineNo}`}
                checked={formData.exemptFromTravelling}
                onChange={(e) => handleExemptChange(e.target.checked)}
              />
              <label
                className="form-check-label"
                htmlFor={`exempt-switch-${line.lineNo}`}>
                Exempt from travelling
              </label>
            </div>
          )}
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <FormSelect
              label="Country of Origin"
              id='countryOfOrigin'
              value={formData.countryOfOrigin}
              onChange={(value) => handleFormChange( 'countryOfOrigin', value)}
              options={countries.map(item => ({ code: item.code, description: item.displayName }))}
              required
              disabled={isReadOnly}
              showAsterisk
            />
          </div>

          <div className="col-md-6">
            <FormSelect
              label="Valid visa?"
              id={`validVisa-${lineIndex}`}
              value={decodeValue(formData.validVisa)}
              onChange={(value) => handleFormChange( 'validVisa', value)}
              options={VALID_VISA_OPTIONS}
              required
              disabled={isReadOnly}
              showAsterisk
            />
          </div>

          {formData.validVisa === 'Yes' && (
            <>
              <div className="col-md-4">
                <FormInput
                  label="ID/Passport Number"
                  id={`passportNo-${lineIndex}`}
                  value={formData.passportNo}
                  onChange={(value) => handleFormChange( 'passportNo', value)}
                  placeholder="Enter Passport number"
                  required
                  disabled={isReadOnly}
                  showAsterisk
                />
              </div>
              <div className="col-md-4">
                <FormInput
                  label="Date issued"
                  id={`dateIssued-${lineIndex}`}
                  value={formData.dateIssued}
                  onChange={(value) => handleFormChange( 'dateIssued', value)}
                  type="date"
                  required
                  disabled={isReadOnly}
                  showAsterisk
                />
              </div>
              <div className="col-md-4">
                <FormInput
                  label="Expiry Date"
                  id={`expiryDate-${lineIndex}`}
                  value={formData.expiryDate}
                  onChange={(value) => handleFormChange( 'expiryDate', value)}
                  type="date"
                  required
                  disabled={isReadOnly}
                  showAsterisk
                />
              </div>
            </>
          )}
        </div>

        <div className="row">
          <div className="col-12">
            <button
              type="submit"
              className="btn btn-outline-success btn-sm"
              title="Save"
              disabled={loading}
            >
              <Save size={16} />
              Save
            </button>

            {successMessage && (
              <span className="text-success mx-1">{successMessage}</span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

const VisaApplicationForm: React.FC<VisaApplicationFormProps> = ({ travelRequest, onSubmit, expenseCodes }) => {
  const [visaApplications, setVisaApplications] = useState<VisaApplication[]>([]);
  const [visaAmount, setVisaAmount] = useState<number>(0);
  const { countries, fetchSetups } = useMySetups();
  const { actions, loading } = usePageLoader();
  const { dispatcher } = actions;

  const fetchVisaApplications = useCallback(async () => {
    try {
      dispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: true,
          message: 'Fetching required visas...',
        }
      });

      const res = await getResource('visaApplications', {
        params: {
          filters: {
            requestNo: travelRequest.no,
            documentType: travelRequest.documentType,
            profileNo: travelRequest.travellerNo,
          },
          '$expand': 'visaApplicationLines',
        }
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      const applications = res.value;

      const formattedApplications = applications.map((application: VisaApplication) => ({
        ...application,
        visaApplicationLines: application.visaApplicationLines?.map((line: VisaApplicationLine) => ({
          ...line,
          dateIssued: line.dateIssued === "0001-01-01" ? "" : line.dateIssued,
          expiryDate: line.expiryDate === "0001-01-01" ? "" : line.expiryDate,
        })) || []
      }));

      setVisaApplications(formattedApplications);
    } catch (error: any) {
      Swal.fire('Error fetching Visa applications', error.message, 'error');
    } finally {
      dispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: false,
          message: '',
        }
      });
    }
  }, [
    dispatcher,
    travelRequest.no,
    travelRequest.documentType,
    travelRequest.travellerNo,
  ]);


  const createVisaAdvance = useCallback(async () => {
    try {
      const res = await codeUnit("createTravelAdvanceFromTravel", {
        data: { no: travelRequest.no },
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      await Swal.fire("Success", "Visa advance created successfully!");
    } catch (error: any) {
      await Swal.fire("Error creating visa advance", error.message);
    }
  }, [travelRequest.no]);

  const createVisaRequestLine = async () => {
    try {
      dispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: true,
          message: '',
        }
      });

      const visaCode = expenseCodes.find(item => item.isVisaFee ).code

      const res = await createResource('travelRequestLine', {
        data: {
          documentType: travelRequest.documentType,
          documentNo: travelRequest.no,
          billingCode: visaCode,
          unitAmount: visaAmount
        },
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      await createVisaAdvance()
      onSubmit()
    } catch (error) {
      await Swal.fire("Error creating visa advance", error.message);
    } finally {
      dispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: false,
          message: '',
        }
      });
    }

  }

  useEffect(() => {
    fetchSetups([
       "countries",
      {
        expenseCodes: {
          $filter: `isVisaFee eq true`
        }
      }
    ]);

    fetchVisaApplications();
  }, [fetchSetups, fetchVisaApplications, travelRequest.no]);

  return (
    <div className="row g-3">
      <div className="col-12">
        {!travelRequest.hasValidVisa && (
            <div className="d-flex align-items-center justify-content-end mb-3">
              <div className="">
                <label className="form-label">
                  Create Visa advance
                </label>
                <input
                    type="number"
                    className="form-control"
                    id="abcd"
                    placeholder="Enter Amount needed"
                    onChange={(e) => setVisaAmount(Number(e.target.value))}
                />
              </div>
              <div className="mt-3">
                <button
                    className="primary-button ms-2"
                    onClick={createVisaRequestLine}
                    disabled={!visaAmount ||  loading }
                >
                  <Wallet className="me-1" size={16} />
                  Create Visa Advance
                </button>
              </div>
            </div>
        )}

        <TravelAdvanceGLTable
            type="visa"
            travelInfo={travelRequest}
        />
        {visaApplications.map((application, key) => (
          <div key={`${application.country}-${key}`} className="visa-application-container">
            <div className="bg-danger p-2 rounded">
              <h5 className="text-white fw-bold m-0">
                {`Country: ${application.country}, Visa: ${application.visaType}`}
              </h5>
            </div>

            {application.visaApplicationLines.map((line, lineIndex) => (
              <VisaApplicationLine key={lineIndex} line={line} lineIndex={lineIndex} isReadOnly={travelRequest.hasValidVisa} countries={countries}/>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisaApplicationForm;