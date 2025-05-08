import React, { ReactNode } from "react";
import SkeletonDataTable from "../tables/SkeletonDataTable";

interface GLLine {
    account: string;
    description: string;
    amount: number;
    currency: string;
    department: string;
    project: string;
}

interface TravelAdvanceGLTableProps {
    glLines: GLLine[];
    loading?: boolean;
}

const columns = [
    { name: "Account", selector: (row: GLLine) => row.account, sortable: true },
    { name: "Description", selector: (row: GLLine) => row.description, sortable: true },
    { name: "Amount", selector: (row: GLLine) => row.amount, sortable: true, right: true },
    { name: "Currency", selector: (row: GLLine) => row.currency, sortable: true },
    { name: "Department", selector: (row: GLLine) => row.department, sortable: true },
    { name: "Project", selector: (row: GLLine) => row.project, sortable: true },
];

const TravelAdvanceGLTable: React.FC<TravelAdvanceGLTableProps> = ({ glLines, loading }) => {
    return (
        <SkeletonDataTable
            title="Travel Advance Lines"
            columns={columns}
            data={glLines}
            loading={loading}
            filters={'f' as ReactNode}
            actions={'f' as ReactNode}
            searchPlaceholder="Search GL lines..."
        />
    );
};

export default TravelAdvanceGLTable;
