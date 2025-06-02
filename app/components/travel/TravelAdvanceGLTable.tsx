import React, {useEffect, useState} from "react";
import SkeletonDataTable from "../tables/SkeletonDataTable";
import {getResource} from "@/app/lib/api/http";
import {TravelRequest} from "@/app/types/travel";
import {Advance} from "@/app/types/advance";
import Swal from "sweetalert2";
import {Eye} from "lucide-react";
import {useRouter} from "next/navigation";



interface TravelAdvanceGLTableProps {
    travelInfo: TravelRequest;
    loading?: boolean;
    type?: string
}

const TravelAdvanceGLTable: React.FC<TravelAdvanceGLTableProps> = ({ travelInfo, loading, type }) => {
    const [advances, setAdvances] = useState<Advance[]>([]);
    const router = useRouter();

    const handleNav = (e: React.MouseEvent, advanceNo: string) => {
        e.preventDefault();
        router.push(`/dashboard/make-request/otherAdvances?advanceNo=${advanceNo}`);
    };

    const columns = [
        { name: "Number", selector: (row: Advance) => row.no, sortable: true },
        { name: "currency", selector: (row: Advance) => row.currencyCode, sortable: true },
        { name: "Description", selector: (row: Advance) => row.description, sortable: true },
        { name: "status", selector: (row: Advance) => row.status, sortable: true },
        { name: "Amount", selector: (row: Advance) => row.amount, sortable: true },
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


    useEffect(() => {
        const getImprest = async ()=> {
            try {
                const res = await getResource('imprest', {
                    params: {
                        filters: {
                            referenceNo	: travelInfo.no,
                        }
                    }
                })

                if (res.error) {
                    return Swal.fire(res.error.code, res.error.message, 'error');
                }

                setAdvances(res.value)
            } catch (error) {
                return Swal.fire(error.code, error.message, 'error');
            }
        }

        getImprest()

    }, []);


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
