import React, { useCallback, useEffect, useState } from "react";
import { TravelRequest } from "@/app/types/travel";
import { getResource, patchResource } from "@/app/lib/api/http";
import Swal from "sweetalert2";
import { useMySetups } from "@/app/context/SetupContext";
import { Loader, Save } from "lucide-react";
import { removeNullAndUndefinedFromObject } from "@/app/utils/helpers";

export default function VisaApplicationForm({travelRequest}: { travelRequest: TravelRequest }) {
  const [visaApplications, setVisaApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const getVisaApplications = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await getResource('visaApplications', {
        params: {
          filters: {
            requestNo: travelRequest.no,
            documentType: travelRequest.documentType,
            profileNo: travelRequest.travellerNo,
          },
          '$expand': 'visaApplicationLines',
        }
      })

      if (res.error) {
        setIsLoading(false)
        return Swal.fire('Error fetching Visa applications', res.error.message, 'error')
      }

      setVisaApplications(res.value)
      setIsLoading(false)
    } catch (error: any) {
      setIsLoading(false)
      return Swal.fire('Error fetching Visa applications', error.message, 'error')
    }
  }, [travelRequest]);

  useEffect(() => {
    getVisaApplications()
  }, [travelRequest, getVisaApplications]);

  const {
    countries,
  } = useMySetups();

  function VisaApplicationLineCard({visaApplicationLine, countries}: {
    visaApplicationLine: Record<string, any>,
    countries: Array<Record<string, any>>
  }) {
    const [formData, setFormData] = useState({
      documentType: visaApplicationLine.documentType,
      requestNo: visaApplicationLine.requestNo,
      profileNo: visaApplicationLine.profileNo,
      visaType: visaApplicationLine.visaType,
      lineNo: visaApplicationLine.lineNo,
      countryOfOrigin: visaApplicationLine.countryOfOrigin,
      validVisa: visaApplicationLine.validVisa,
      dateIssued: visaApplicationLine.dateIssued !== '0001-01-01' ? visaApplicationLine.dateIssued : '',
      expiryDate: visaApplicationLine.expiryDate !== '0001-01-01' ? visaApplicationLine.expiryDate : '',
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    const handleFormChange = useCallback((field: string, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        const payload = removeNullAndUndefinedFromObject(formData);

        setIsSubmitting(true)

        const res = await patchResource('visaApplicationLines', {
          data: payload,
          primaryKey: ['documentType', 'requestNo', 'profileNo', 'visaType', 'lineNo']
        })

        if (res.error) {
          setIsSubmitting(false)
          return Swal.fire('Error saving details', res.error.message, 'error')
        }

        setIsSubmitting(false)
        setSuccessMessage('Saved!')
      } catch (error: any) {
        setIsSubmitting(false)
        console.log('Error saving visa application line', error.message)
      }
    }

    useEffect(() => {
      if (successMessage) {
        const timer = setTimeout(() => {
          setSuccessMessage('');
        }, 3000);

        return () => clearTimeout(timer);
      }
    }, [successMessage]);
    return (
      <>
        <div className={'card bg-light border mt-2'}>
          <div className="card-body">
            <h5 className="card-title fs-14 fw-bold">Traveller: {visaApplicationLine.name || 'N/A'}</h5>
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label htmlFor="countryOfOrigin" className="form-label">Nationality</label>
                <select
                  className="form-select"
                  id="countryOfOrigin"
                  value={formData.countryOfOrigin}
                  onChange={async (e) => {
                    handleFormChange('countryOfOrigin', e.target.value)
                  }}
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
                  onChange={async (e) => {
                    handleFormChange('validVisa', e.target.value)
                  }}
                  required
                >
                  <option value=''>-- Select Option --</option>
                  <option value='Yes'>Yes</option>
                  <option value='No'>No</option>
                  <option value='Not Need'>Not Needed</option>
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
                      onChange={(e) =>
                        handleFormChange('dateIssued', e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="expiryDate" className="form-label">Expiry Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="expiryDate"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        handleFormChange('expiryDate', e.target.value)
                      }
                    />
                  </div>
                </>
              )}

              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-outline-success btn-sm"
                  title="Save"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? <Loader size={16} className="button-icon blink-animation"/>
                    : <Save size={16}/>}
                  Save
                </button>

                {successMessage && (
                  <span className={'text-success mx-1'}>{successMessage}</span>
                )}
              </div>
            </form>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className='row g-3'>
        <div className={'col-12'}>
          {isLoading
            ? (
              <div className={'col-12 text-center'}>
                <Loader size={32} className={'blink-animation'}/>
              </div>
            )
            : visaApplications.map((application: Record<string, any>, key: number) => (
            <div key={`${application.country}-${key}`}>
              <div className="bg-danger p-2 rounded">
                <p
                  className="text-white fw-bold m-0">{`Country: ${application.country}, Visa: ${application.visaType}`}</p>
              </div>

              {application.visaApplicationLines.map((line: Record<string, any>, lineKey: number) => (
                <VisaApplicationLineCard
                  key={`${line.lineNo}-${lineKey}-${key}`}
                  visaApplicationLine={line}
                  countries={countries}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}