import React, { useCallback, useEffect, useState } from "react";
import { TravelRequest } from "@/app/types/travel";
import { createResource, getResource, patchResource } from "@/app/lib/api/http";
import Swal from "sweetalert2";
import { useMySetups } from "@/app/context/SetupContext";
import { Save } from "lucide-react";
import { decodeValue, removeNullAndUndefinedFromObject } from "@/app/utils/helpers";
import { usePageLoader } from "@/app/context/PageLoaderContext";

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
  [key: string]: any;
}

interface VisaApplicationFormProps {
  travelRequest: TravelRequest;
}

interface VisaApplicationCardProps {
  visaApplication: VisaApplication;
  countries: Array<Record<string, any>>;
}

const VisaApplicationCard: React.FC<VisaApplicationCardProps> = ({
  visaApplication,
  countries
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

      // First check if visa application header exists
      const header = await getResource('visaApplications', {
        params: {
          filters: {
            documentType: formData.documentType,
            requestNo: formData.requestNo,
            profileNo: formData.profileNo,
            visaType: formData.visaType
          }
        }
      })

      if (header.error) {
        throw new Error(header.error.message)
      }

      if (!header.value.length) {
        // If no header, create one first
        const newHeader = await createResource('visaApplications', {
          data: {
            documentType: formData.documentType,
            requestNo: formData.requestNo,
            profileNo: formData.profileNo,
            visaType: formData.visaType,
            country: formData.country,
          }
        })

        if (newHeader.error) {
          throw new Error(newHeader.error.message)
        }
      }

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
        <p className="text-white fw-bold m-0">
          {`Country: ${visaApplication.country}, Visa: ${visaApplication.visaType}`}
        </p>
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
                  <label htmlFor={`countryOfOrigin-${lineIndex}`} className="form-label">
                    Country of Origin
                  </label>
                  <select
                    className="form-select"
                    id={`countryOfOrigin-${lineIndex}`}
                    value={decodeValue(line.countryOfOrigin)}
                    onChange={(e) => handleFormChange(lineIndex, 'countryOfOrigin', e.target.value)}
                    required
                  >
                    <option value="">-- Select Country --</option>
                    {countries.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor={`validVisa-${lineIndex}`} className="form-label">
                    Valid visa?
                  </label>
                  <select
                    className="form-select"
                    id={`validVisa-${lineIndex}`}
                    value={decodeValue(line.validVisa)}
                    onChange={(e) => handleFormChange(lineIndex, 'validVisa', e.target.value)}
                    required
                  >
                    <option value="">-- Select Option --</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Not Need">Not Needed</option>
                  </select>
                </div>

                {line.validVisa === 'Yes' && (
                  <>
                    <div className="col-md-6">
                      <label htmlFor={`dateIssued-${lineIndex}`} className="form-label">
                        Date issued
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id={`dateIssued-${lineIndex}`}
                        value={decodeValue(line.dateIssued)}
                        onChange={(e) => handleFormChange(lineIndex, 'dateIssued', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor={`expiryDate-${lineIndex}`} className="form-label">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id={`expiryDate-${lineIndex}`}
                        value={decodeValue(line.expiryDate)}
                        onChange={(e) => handleFormChange(lineIndex, 'expiryDate', e.target.value)}
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

      setVisaApplications(res.value);
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
  }, [travelRequest, dispatcher]);



  const prepareVisaApplications = useCallback(async () => {
    const applications: VisaApplication[] = []
    travelRequest.travelRequestRoutes.forEach((route: Record<string, any>) => {
      if (route.visaRequired) {
        const application = {
          documentType: route.documentType,
          requestNo:  route.documentNo,
          profileNo: travelRequest.travellerNo,
          visaType: route.visaRequired,
          country: route.destinationCountryCode,
          visaApplicationLines: [],
        };

        travelRequest.travellers.forEach((traveller: Record<string, any>) => {
          application.visaApplicationLines.push({
            documentType: traveller.documentType,
            requestNo: traveller.documentNo,
            profileNo: traveller.travellerNo,
            visaType: route.visaRequired,
            countryOfOrigin: traveller.countryOfOrigin,
            validVisa: 'No',
            dateIssued: '',
            expiryDate: '',
            name: traveller.travellerName,
            exemptFromTravelling: false,
          });
        });

        applications.push(application)
      }
    })

    setVisaApplications(applications);
  }, [travelRequest.travelRequestRoutes, travelRequest.travellerNo, travelRequest.travellers]);

  useEffect(() => {
    if (travelRequest.approvalStatus === 'Open') {
      prepareVisaApplications();
    } else {
      fetchVisaApplications();
    }
  }, [fetchVisaApplications, prepareVisaApplications, travelRequest.approvalStatus]);

  return (
    <div className="row g-3">
      <div className="col-12">
        {
          visaApplications.map((application, key) => (
            <VisaApplicationCard
              key={`${application.country}-${key}`}
              visaApplication={application}
              countries={countries}
            />
          ))
        }
      </div>
    </div>
  );
};

export default VisaApplicationForm;