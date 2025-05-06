"use client";

import React, { useState, useCallback } from "react";
import {
  useJsApiLoader,
  Autocomplete,
  DistanceMatrixService,
} from "@react-google-maps/api";

interface MileagePickerProps {
  value: string;
  onChange: (distanceKm: string) => void;
}

export default function MileagePicker({ value, onChange }: MileagePickerProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });

  const [startAuto, setStartAuto] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [endAuto, setEndAuto] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [startAddr, setStartAddr] = useState<string>("");
  const [endAddr, setEndAddr] = useState<string>("");

  // whenever both addresses change, re‑calculate with DistanceMatrixService
  const matrixCallback = useCallback(
    (response: any) => {
      if (
        response &&
        response.rows?.[0]?.elements?.[0]?.distance?.value != null
      ) {
        // value is meters
        const km = (response.rows[0].elements[0].distance.value / 1000).toFixed(
          1
        );
        onChange(km);
      }
    },
    [onChange]
  );

  if (!isLoaded) return <div>Loading map…</div>;

  return (
    <div className="d-flex gap-2">
      <div>
        <label className="form-label">From</label>
        <Autocomplete onLoad={(auto) => setStartAuto(auto)}>
          <input
            type="text"
            className="form-control"
            placeholder="Start address"
            onBlur={() =>
              setStartAddr(startAuto?.getPlace()?.formatted_address || "")
            }
          />
        </Autocomplete>
      </div>
      <div>
        <label className="form-label">To</label>
        <Autocomplete onLoad={(auto) => setEndAuto(auto)}>
          <input
            type="text"
            className="form-control"
            placeholder="End address"
            onBlur={() =>
              setEndAddr(endAuto?.getPlace()?.formatted_address || "")
            }
          />
        </Autocomplete>
      </div>
      {startAddr && endAddr && (
        <DistanceMatrixService
          options={{
            origins: [startAddr],
            destinations: [endAddr],
            travelMode: google.maps.TravelMode.DRIVING,
          }}
          callback={matrixCallback}
        />
      )}
      <div className="align-self-end">
        <label className="form-label">Distance (km)</label>
        <div className="form-control">{value || "–"}</div>
      </div>
    </div>
  );
}
