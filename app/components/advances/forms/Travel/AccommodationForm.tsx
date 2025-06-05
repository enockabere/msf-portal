import { TravelRequest } from "@/app/types/travel";
import React, { useCallback, useEffect, useState } from "react";
import { usePageLoader } from "@/app/context/PageLoaderContext";
import Swal from "sweetalert2";
import { patchResource } from "@/app/lib/api/http";
import { decodeValue, removeNullAndUndefinedFromObject } from "@/app/utils/helpers";
import FormSelect from "@/app/components/inputs/FormSelect";
import { useMySetups } from "@/app/context/SetupContext";
import { Save } from "lucide-react";

const ACCOMMODATION_TYPES = [
  { code: "Self-Arranged", description: "Self Arranged" },
  { code: "Full Board", description: "Full Board" },
  { code: "Half Board", description: "Half Board" },
  { code: "Bed & Breakfast", description: "Bed & Breakfast" },
];

const FCM_TRAVEL_LINK = "https://fcmtravel.co.ke/msf/";

interface Props {
  travelHeaderRequest: TravelRequest;
  isReadOnly?: boolean;
  onSubmit: () => void;
}

interface FormData {
  no: string;
  documentType: string;
  accommodationType: string;
  requirePerDiem: boolean;
  missionType: string;
  bookingComplete: boolean;
}

const AccommodationForm: React.FC<Props> = ({travelHeaderRequest, isReadOnly = false, onSubmit}) => {
  const initialFormData: FormData = {
    no: travelHeaderRequest.no,
    documentType: travelHeaderRequest.documentType,
    accommodationType: travelHeaderRequest.accommodationType || "",
    requirePerDiem: travelHeaderRequest.requirePerDiem || false,
    missionType: travelHeaderRequest.missionType || "",
    bookingComplete: travelHeaderRequest.bookingComplete || false,
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const {dispatcher} = usePageLoader().actions;

  const {
    perDiemAllotments,
    missionTypes,
    fetchSetups,
  } = useMySetups();

  const requiresPerDiemChecker = useCallback((accommodationType: string) => {
    const allotment = perDiemAllotments.find(
      (item: Record<string, any>) => decodeValue(item.accommodationType) === accommodationType
    );
    return allotment?.perDiemAllocated > 0;
  }, [perDiemAllotments]);

  const handleFormChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      dispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: true,
          message: 'Saving accommodation details...',
        }
      });

      const res = await patchResource("travelRequests", {
        data: removeNullAndUndefinedFromObject(formData),
        primaryKey: ["no", "documentType"],
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      onSubmit();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save accommodation";
      await Swal.fire("Error saving record", message, "error");
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
    const loadData = async () => {
      try {
        await fetchSetups([
          "perDiemAllotments",
          {
            missionTypes: {
              filters: { inActive: false }
            }
          },
        ]);
      } catch (error: any) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [fetchSetups]);

  return (
    <div className="row">
      <div className="col-12">
        <div className="alert alert-info">
          <p className="mb-0">
            Click this link to request for your travel voucher: {' '}
            <a
              href={FCM_TRAVEL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary fw-bold"
            >
              fcmtravel.co.ke/msf
            </a>
          </p>
        </div>
      </div>

      <div className="col-12">
        <form onSubmit={handleSubmit} className="border rounded p-3 bg-light-subtle mt-3">
          <div className="row g-3">
            <div className="col-md-6">
              <FormSelect
                label="Accommodation Type"
                value={decodeValue(formData.accommodationType)}
                onChange={(value) => {
                  handleFormChange("accommodationType", value);
                  if (!requiresPerDiemChecker(value)) {
                    handleFormChange("requirePerDiem", false);
                  }
                }}
                options={ACCOMMODATION_TYPES}
                required
                disabled={isReadOnly}
                showAsterisk
              />
            </div>

            <div className="col-md-6">
              <FormSelect
                label="Type of Mission"
                value={formData.missionType}
                onChange={(value) => handleFormChange("missionType", value)}
                options={missionTypes.map(item => ({ code: item.code, description: item.description }))}
                required
                disabled={isReadOnly || !formData.requirePerDiem}
                showAsterisk={formData.requirePerDiem}
              />
            </div>

            <div className="col-md-6">
              <div className="form-group form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="requirePerDiem"
                  role="switch"
                  checked={formData.requirePerDiem}
                  onChange={(e) => handleFormChange("requirePerDiem", e.target.checked)}
                  disabled={isReadOnly || !requiresPerDiemChecker(decodeValue(formData.accommodationType))}
                />
                <label
                  className="form-check-label"
                  htmlFor="requirePerDiem">
                  Require Per Diem
                </label>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="requirePerDiem"
                  role="switch"
                  checked={formData.bookingComplete}
                  onChange={(e) => handleFormChange("bookingComplete", e.target.checked)}
                  disabled={isReadOnly}
                />
                <label
                  className="form-check-label"
                  htmlFor="requirePerDiem">
                  Have completed booking
                </label>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12">
              <button
                type="submit"
                className="primary-button"
              >
                <Save size={16} className="button-icon" />
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccommodationForm;