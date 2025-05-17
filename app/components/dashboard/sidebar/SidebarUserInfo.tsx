"use client";

import {useSession} from "next-auth/react"
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function SidebarUserInfo() {
    const {data: session} = useSession();

    if (!session) {
        return (
            <div className="update-msg text-center">
                <div
                    className="d-flex justify-content-center align-items-center thumb-lg update-icon-box rounded-circle mx-auto">
                    <Skeleton circle width={48} height={48}/>
                </div>
                <h5 className="mt-3">
                    <Skeleton width={150}/>
                </h5>
                <p className="text-muted text-small">
                    <Skeleton width={200}/>
                </p>

                <div className="p-3 text-center">
                    {[...Array(4)].map((_, i) => (
                        <div
                            className="d-flex align-items-center mb-2 justify-content-center"
                            key={i}
                        >
                            <Skeleton width={180} height={12}/>
                        </div>
                    ))}
                </div>

                <Skeleton
                    width={160}
                    height={36}
                    className="rounded-pill mx-auto d-block"
                />
            </div>
        );
    }

    return (
        <div className="update-msg text-center">
            <div
                className="d-flex justify-content-center align-items-center thumb-lg update-icon-box rounded-circle mx-auto">
                <i className="iconoir-user h3 align-self-center mb-0 text-danger"></i>
            </div>
            <h5 className="mt-3">{`${session?.user?.profile?.searchName}`}</h5>
            <p className="text-muted text-small">{session?.user?.profile?.eMail}</p>

            <div className="my-2 text-center">
                <div className="d-flex align-items-center mb-2">
                    <i className="iconoir-user me-2 text-danger"></i>
                    <span className="text-muted">{session?.user?.profile?.no}</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                    <i className="iconoir-phone me-2 text-danger"></i>
                    <span className="text-muted">
                    {session?.user?.profile?.phoneNo || "N/A"}
                  </span>
                </div>
                <div className="d-flex align-items-center">
                    <i className="iconoir-female me-2 text-danger"></i>
                    <span className="text-muted">
                        {session?.user?.profile?.gender || "N/A"}
                    </span>
                </div>
            </div>

            <a
                href="javascript:void(0);"
                className="btn text-danger shadow-sm rounded-pill"
            >
                View Account <i className="iconoir-arrow-right me-2 text-danger"></i>
            </a>
        </div>
    );
}
