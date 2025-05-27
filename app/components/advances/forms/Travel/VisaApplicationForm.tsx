import React, { useCallback, useEffect, useState } from "react";
import { TravelRequest } from "@/app/types/travel";
import { getResource, patchResource } from "@/app/lib/api/http";
import Swal from "sweetalert2";
import { useMySetups } from "@/app/context/SetupContext";
import { Save } from "lucide-react";
import { decodeValue, removeNullAndUndefinedFromObject } from "@/app/utils/helpers";
import { usePageLoader } from "@/app/context/PageLoaderContext";

interface VisaApplication {
  country: string;
  visaType: string;
  visaApplicationLines: VisaApplicationLine[];
  [key: string]: any;
}

interface VisaApplicationLine {
  documentType: string;
  requestNo: string;
  profileNo: string;
  visaType: string;
  lineNo: number;
  countryOfOrigin: string;
  validVisa: string;
  dateIssued: string;
  expiryDate: string;
  name?: string;
  [key: string]: any;
}

interface VisaApplicationFormProps {
  travelRequest: TravelRequest;
}

interface VisaApplicationLineCardProps {
  visaApplicationLine: VisaApplicationLine;
  countries: Array<Record<string, any>>;
}

const VisaApplicationLineCard: React.FC<VisaApplicationLineCardProps> = ({
  visaApplicationLine,
  countries
}) => {
  const [formData, setFormData] = useState({
    documentType: visaApplicationLine.documentType,
    requestNo: visaApplicationLine.requestNo,
    profileNo: visaApplicationLine.profileNo,
    visaType: visaApplicationLine.visaType,
    lineNo: visaApplicationLine.lineNo,
    countryOfOrigin: visaApplicationLine.countryOfOrigin,
    validVisa: decodeValue(visaApplicationLine.validVisa),
    dateIssued: visaApplicationLine.dateIssued !== '0001-01-01' ? visaApplicationLine.dateIssued : '',
    expiryDate: visaApplicationLine.expiryDate !== '0001-01-01' ? visaApplicationLine.expiryDate : '',
  });

  const [successMessage, setSuccessMessage] = useState('');
  const { loading, actions } = usePageLoader();
  const { dispatcher } = actions;

  const handleFormChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = removeNullAndUndefinedFromObject(formData);
      dispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: true,
          message: '',
        }
      });

      const res = await patchResource('visaApplicationLines', {
        data: payload,
        primaryKey: ['documentType', 'requestNo', 'profileNo', 'visaType', 'lineNo']
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      setSuccessMessage('Saved!');
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
    <div className="card bg-light border mt-2">
      <div className="card-body">
        <h5 className="card-title fs-14 fw-bold">
          Traveller: {visaApplicationLine.name || 'N/A'}
        </h5>

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label htmlFor="countryOfOrigin" className="form-label">Country of Origin</label>
            <select
              className="form-select"
              id="countryOfOrigin"
              value={formData.countryOfOrigin}
              onChange={(e) => handleFormChange('countryOfOrigin', e.target.value)}
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
            <label htmlFor="validVisa" className="form-label">Valid visa?</label>
            <select
              className="form-select"
              id="validVisa"
              value={formData.validVisa}
              onChange={(e) => handleFormChange('validVisa', e.target.value)}
              required
            >
              <option value="">-- Select Option --</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Not Need">Not Needed</option>
            </select>
          </div>

          {formData.validVisa === 'Yes' && (
            <>
              <div className="col-md-6">
                <label htmlFor="dateIssued" className="form-label">Date issued</label>
                <input
                  type="date"
                  className="form-control"
                  id="dateIssued"
                  value={formData.dateIssued}
                  onChange={(e) => handleFormChange('dateIssued', e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="expiryDate" className="form-label">Expiry Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="expiryDate"
                  value={formData.expiryDate}
                  onChange={(e) => handleFormChange('expiryDate', e.target.value)}
                />
              </div>
            </>
          )}

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

  useEffect(() => {
    fetchVisaApplications();
  }, [fetchVisaApplications]);

  return (
    <div className="row g-3">
      <div className="col-12">
        {
          visaApplications.map((application, key) => (
            <div key={`${application.country}-${key}`}>
              <div className="bg-danger p-2 rounded">
                <p className="text-white fw-bold m-0">
                  {`Country: ${application.country}, Visa: ${application.visaType}`}
                </p>
              </div>

              {application.visaApplicationLines.map((line, lineKey) => (
                <VisaApplicationLineCard
                  key={`${line.lineNo}-${lineKey}-${key}`}
                  visaApplicationLine={line}
                  countries={countries}
                />
              ))}
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default VisaApplicationForm;