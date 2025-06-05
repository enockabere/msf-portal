import SkeletonDataTable from "../tables/SkeletonDataTable";
import {Advance} from "@/app/types/advance";
import {Eye} from "lucide-react";
import {useRouter} from "next/navigation";

interface TravelAdvanceGLTableProps {
    advances: Record<string, any>[];
    loading?: boolean;
    type?: string
}

const TravelAdvanceGLTable: React.FC<TravelAdvanceGLTableProps> = ({ advances, loading, type }) => {
    const router = useRouter();

    const handleNav = (e: React.MouseEvent, advanceNo: string) => {
        e.preventDefault();
        router.push(`/dashboard/make-request/otherAdvances?advanceNo=${advanceNo}`);
    };

    const columns = [
        { name: "Number", selector: (row: Advance) => row.no, sortable: true },
        { name: "Description", selector: (row: Advance) => row.description, sortable: true },
        { name: "status", selector: (row: Advance) => row.status, sortable: true },
        {
            name: "Amount",
            selector: (row: Advance) =>
                `${row.currencyCode || "KES"
                } ${row.amount.toLocaleString()}`,
            sortable: true, },
        { name: "Actions",
            cell: (row: Advance) => (
                <button
                    className="btn btn-sm btn-success"
                    onClick={(e) => handleNav(e, row.no)}
                    title="View"
                >
                    <Eye size={16} />
                </button>
            ),
        },
    ];



    return (
        <SkeletonDataTable
            title={type === 'visa' ? "Visa Advance Lines" : "Travel Advance Lines"}
            columns={columns}
            data={advances}
            loading={loading}
            searchPlaceholder="Search GL lines..."
        />
    );
};

export default TravelAdvanceGLTable;
