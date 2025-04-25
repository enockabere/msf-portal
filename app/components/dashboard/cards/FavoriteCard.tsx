import Link from "next/link";

export interface FavoriteCardProps {
  data: {
    title: string;
    icon: string;
    pending: number;
    completed: number;
    pendingUrl: string;
    completedUrl: string;
  };
}

export default function FavoriteCard({ data }: FavoriteCardProps) {
  return (
    <div className="mb-4">
      <div className="row g-2">
        <div className="col-6">
          <Link
            href={data.pendingUrl}
            className="card bg-light-warning text-center text-decoration-none d-flex justify-content-center align-items-center p-3 h-100"
          >
            <div>
              <h4 className="fw-bold text-warning mb-1">{data.pending}</h4>
              <p className="mb-0 text-muted fs-12">
                Open <i className="iconoir-plus ms-1 text-warning" />
              </p>
            </div>
          </Link>
        </div>

        <div className="col-6">
          <Link
            href={data.completedUrl}
            className="card bg-light-success text-center text-decoration-none d-flex justify-content-center align-items-center p-3 h-100"
          >
            <div>
              <h4 className="fw-bold text-success mb-1">{data.completed}</h4>
              <p className="mb-0 text-muted fs-12">
                Completed <i className="iconoir-eye ms-1 text-success" />
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
