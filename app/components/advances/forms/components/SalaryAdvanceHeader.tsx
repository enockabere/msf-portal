import React from "react";

interface Props {
  advanceNo?: string;
  status?: string;
}

export default function SalaryAdvanceHeader({ advanceNo, status }: Props) {
  if (!advanceNo) return null;
  return (
    <div className="row mb-3">
      <div className="col-12">
        <div className="alert alert-info">
          <strong>Advance No:</strong> {advanceNo}
          {status && (
            <>
              <span className="mx-2">|</span>
              <strong>Status:</strong> {status}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
