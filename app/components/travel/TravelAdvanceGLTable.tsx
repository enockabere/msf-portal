import React, { ReactNode } from "react";
import SkeletonDataTable from "../tables/SkeletonDataTable";

interface GLLine {
    documentNo	: string;
    billingCode: string;
    billingDescription	: string;
    quantity: number;
    unitAmount: string;
    lineAmount: string;
    project: string;
}

interface TravelAdvanceGLTableProps {
    glLines: GLLine[];
    loading?: boolean;
}

const columns = [
    { name: "documentNo", selector: (row: GLLine) => row.documentNo, sortable: true },
    { name: "billingCode", selector: (row: GLLine) => row.billingCode, sortable: true },
    { name: "Description", selector: (row: GLLine) => row.billingDescription, sortable: true },
    { name: "quantity", selector: (row: GLLine) => row.quantity, sortable: true, right: true },
    { name: "unit Amount", selector: (row: GLLine) => row.unitAmount, sortable: true },
    { name: "Amount", selector: (row: GLLine) => row.lineAmount, sortable: true },
];

const TravelAdvanceGLTable: React.FC<TravelAdvanceGLTableProps> = ({ glLines, loading }) => {
    return (
        <SkeletonDataTable
            title="Travel Advance Lines"
            columns={columns}
            data={glLines}
            loading={loading}
            searchPlaceholder="Search GL lines..."
        />
    );
};

export default TravelAdvanceGLTable;
