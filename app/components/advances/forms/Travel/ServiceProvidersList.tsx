"use client";

import React, { useCallback, useEffect, useState } from "react";
import { TravelRequest } from "../../../../types/travel";
import { getResource } from "../../../../lib/api/http";
import Swal from "sweetalert2";
import { usePageLoader } from "../../../../context/PageLoaderContext";

interface ServiceProvider {
  serviceCode: string;
  serviceDescription: string;
  vendorName: string;
  vehicleRegistrationNo: string;
  phoneNo: string;
}

type GroupedProviders = Record<string, ServiceProvider[]>;

export default function ServiceProvidersList({ travelRequest }: { travelRequest: TravelRequest }) {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const { actions } = usePageLoader();
  const { dispatcher } = actions;

  const getServiceProviders = useCallback(async () => {
    try {
      dispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: true,
          message: '',
        }
      });
      const res = await getResource('travelRequestProviders', {
        params: {
          filters: {
            documentNo: travelRequest.no,
            documentType: travelRequest.documentType,
          },
        }
      });

      if (res.error) {
        dispatcher({
          type: 'PATCH_LOADING_STATE',
          payload: {
            loading: false,
            message: '',
          }
        });
        return Swal.fire('Error fetching service providers', res.error.message, 'error');
      }

      setProviders(res.value);
      dispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: false,
          message: '',
        }
      });
    } catch (error: any) {
      dispatcher({
        type: 'PATCH_LOADING_STATE',
        payload: {
          loading: false,
          message: '',
        }
      });
      return Swal.fire('Error fetching service providers', error.message, 'error');
    }
  }, [travelRequest, dispatcher]);

  useEffect(() => {
    getServiceProviders();
  }, [travelRequest, getServiceProviders]);

  const groupedProviders = providers.reduce((acc: GroupedProviders, item) => {
    const key = item.serviceDescription;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});



  return (
    <div className='row g-3'>
      <div className="col-12">
        {providers.length === 0 ? (
          <div className="card mb-4">
            <div className="card-body">
              <div className="text-center text-muted py-4">
                No available services providers at the moment.
              </div>
            </div>
          </div>
        ) : (
          Object.entries(groupedProviders).map(([group, groupProviders]) => (
            <div key={group} className="mb-4">
              <div className="bg-danger p-2 rounded">
                <p className="text-white fw-bold m-0">{group}</p>
              </div>
              <table className="table table-bordered mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Vendor</th>
                    <th>Phone Number</th>
                    <th>Vehicle Number</th>
                  </tr>
                </thead>
                <tbody>
                  {groupProviders.map((provider, idx) => (
                    <tr key={`${group}-${idx}`}>
                      <td>{idx + 1}</td>
                      <td>{provider.vendorName || 'N/A'}</td>
                      <td>{provider.phoneNo || 'N/A'}</td>
                      <td>{provider.vehicleRegistrationNo || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
