import SummaryCards from "@/app/components/cards/SummaryCards";
import TabbedRequisitionRequests from "@/app/components/requisitions/TabbedRequisitionRequests";

export default function RequisitionClient() {
    return (
        <div className="page-content dashboard-container p-3">
                <div className="row gx-1 mb-1">
                    <div className="col-12">
                        {/*<SummaryCards*/}
                        {/*    cards={cards}*/}
                        {/*    layout="horizontal"*/}
                        {/*    currentPlacement="top"*/}
                        {/*    onPlacementChange={handleChangePlacement}*/}
                        {/*    actionButton={*/}
                        {/*        <button*/}
                        {/*            className="btn bg-danger text-white btn-md"*/}
                        {/*            onClick={handleNewRequestClick}*/}
                        {/*        >*/}
                        {/*            <i className="fa fa-plus me-1" />*/}
                        {/*            New Travel Request*/}
                        {/*        </button>*/}
                        {/*    }*/}
                        {/*/>*/}
                    </div>
                </div>

            <div className="col-lg-12">
                <div className="card h-100 p-2">
                    <TabbedRequisitionRequests records={[]} />
                </div>
            </div>
        </div>
    );
}
