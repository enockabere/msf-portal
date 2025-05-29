import React, { useCallback, useEffect, useState } from "react";
import { TravelRequest } from "@/app/types/travel";
import { createResource, getResource, patchResource } from "@/app/lib/api/http";
import Swal from "sweetalert2";
import { useMySetups } from "@/app/context/SetupContext";
import { Save } from "lucide-react";
import { decodeValue, removeNullAndUndefinedFromObject } from "@/app/utils/helpers";
import { usePageLoader } from "@/app/context/PageLoaderContext";
import FormSelect from "@/app/components/inputs/FormSelect";
import FormInput from "@/app/components/inputs/FormInput";

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
}

interface VisaApplicationCardProps {
  visaApplication: VisaApplication;
  countries: Array<Record<string, any>>;
  isReadOnly: boolean;
}

const VisaApplicationCard: React.FC<VisaApplicationCardProps> = ({
  visaApplication,
  countries,
  isReadOnly,
}) => {
  const [formData, setFormData] = useState({
    documentType: visaApplication.documentType,
    requestNo: visaApplication.requestNo,
    profileNo: visaApplication.profileNo,
    visaType: visaApplication.visaType,
    country: visaApplication.country,
    visaApplicationLines: visaApplication.visaApplicationLines,
  });

  const [successMessage, setSuccessMessage] = useState('');
  const { loading, actions } = usePageLoader();
  const { dispatcher } = actions;

  const handleFormChange = useCallback((lineIndex: number, field: string, value: string) => {
    setFormData(prev => {
      const updatedLines = [...prev.visaApplicationLines];
      updatedLines[lineIndex] = {
        ...updatedLines[lineIndex],
        [field]: value
      };

      return {
        ...prev,
        visaApplicationLines: updatedLines
      };
    });
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

      // Process each line individually
      const operations = await Promise.all(
        formData.visaApplicationLines.map(async (line: VisaApplicationLine, key: number) => {
          const payload = removeNullAndUndefinedFromObject(line);

          return line.lineNo
            ? await patchResource('visaApplicationLines', {
              data: payload,
              primaryKey: ['documentType', 'requestNo', 'profileNo', 'visaType', 'lineNo']
            })
            : await createResource('visaApplicationLines', { data: { ...payload, lineNo: (key + 1)} });
        })
      );

      let hasError = false;
      formData.visaApplicationLines.forEach((line: VisaApplicationLine, index: number) => {
        if (operations[index].error) {
          hasError = true;
        } else {
          handleFormChange(index, 'lineNo', operations[index].lineNo);
        }
      });

      if (hasError) {
        throw new Error('Some operations failed');
      }

      setSuccessMessage('Saved successfully!');
    } catch (error: any) {
      Swal.fire('Error saving details', error.message, 'error');
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
    <div className="visa-application-container">
      <div className="bg-danger p-2 rounded">
        <h5 className="text-white fw-bold m-0">
          {`Country: ${visaApplication.country}, Visa: ${visaApplication.visaType}`}
        </h5>
      </div>

      <div className="card bg-light border mt-2">
        <form onSubmit={handleSubmit} className="card-body">
          {formData.visaApplicationLines.map((line, lineIndex) => (
            <div key={lineIndex} className="traveller-section">
              <h5 className="card-title fs-14 fw-bold">
                Traveller: {line.name || 'N/A'}
              </h5>

              <div className="row g-3 border-bottom pb-2 mb-2">
                <div className="col-md-6">
                  <FormSelect
                    label="Country of Origin"
                    id={`countryOfOrigin-${lineIndex}`}
                    value={line.countryOfOrigin}
                    onChange={(value) => handleFormChange(lineIndex, 'countryOfOrigin', value)}
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
                    value={decodeValue(line.validVisa)}
                    onChange={(value) => handleFormChange(lineIndex, 'validVisa', value)}
                    options={VALID_VISA_OPTIONS}
                    required
                    disabled={isReadOnly}
                    showAsterisk
                  />
                </div>

                {line.validVisa === 'Yes' && (
                  <>
                    <div className="col-md-4">
                      <FormInput
                        label="ID/Passport Number"
                        id={`passportNo-${lineIndex}`}
                        value={line.passportNo}
                        onChange={(value) => handleFormChange(lineIndex, 'passportNo', value)}
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
                        value={line.dateIssued}
                        onChange={(value) => handleFormChange(lineIndex, 'dateIssued', value)}
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
                        value={line.expiryDate}
                        onChange={(value) => handleFormChange(lineIndex, 'expiryDate', value)}
                        type="date"
                        required
                        disabled={isReadOnly}
                        showAsterisk
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

          <div className="row g-3">
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
    </div>
  );
};

const VisaApplicationForm: React.FC<VisaApplicationFormProps> = ({ travelRequest }) => {
  const [visaApplications, setVisaApplications] = useState<VisaApplication[]>([]);
  const { countries } = useMySetups();
  const { actions } = usePageLoader();
  const { dispatcher } = actions;

  const fetchVisaApplications = useCallback(async () => {
    try {
      dispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: true,
          message: '',
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

  useEffect(() => {
    fetchVisaApplications();
  }, [fetchVisaApplications]);

  return (
    <div className="row g-3">
      <div className="col-12">
        {visaApplications.map((application, key) => (
          <VisaApplicationCard
            key={`${application.country}-${key}`}
            visaApplication={application}
            countries={countries}
            isReadOnly={travelRequest.hasValidVisa}
          />
        ))}
      </div>
    </div>
  );
};

export default VisaApplicationForm;