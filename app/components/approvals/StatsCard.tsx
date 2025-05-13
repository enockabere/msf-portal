import {Bell} from "lucide-react";


interface StatsProps {
    header: string;
    headerCount: number

}
export default function ApprovalStatsCard({
    header,
    headerCount,}: StatsProps) {

    return (
        <>
            <div className="col-sm-3">
                <div className="status-card bg-light text-center rounded p-4 d-flex flex-column justify-content-center align-items-center h-100">
                    <Bell className="mb-2 text-success" size={28} />
                    <h6 className="mb-1 fw-bold text-success">{headerCount}</h6>
                    <small className="text-muted">{header}</small>
                </div>
            </div>
        </>
    )
}