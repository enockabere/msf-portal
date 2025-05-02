"use client";

import { signIn } from "next-auth/react"
import Image from "next/image";

export default function LoginClient() {
  const handleSSORedirect = () => {
    signIn()
  };

  return (
    <div className="bg-light container-fluid min-vh-100 d-flex flex-column">
      {/* Header */}
      <header className="py-3 ">
        <div className="container d-flex justify-content-between align-items-center">
          <Image
            src="/assets/images/logo-light.png"
            alt="logo-light"
            width={140}
            height={40}
            className="logo-lg"
          />
          <button className="btn btn-primary" onClick={handleSSORedirect}>
            Staff Login
          </button>
        </div>
      </header>

      <div className="container d-flex justify-content-between align-items-center flex-grow-1">
        <div className="row">
          <div className="col-7">
            <div className="d-flex flex-column justify-content-between">
              {/* Hero */}
              <section className="text-center pb-5 flex-grow-1 d-flex flex-column justify-content-center">
                <h2 className="display-3 mb-0 text-black fw-semibold mb-5">
                  Self-Service Portal
                </h2>
                <h2 className="display-6 fw-medium mb-3">
                  Empowering Employees & Managers
                </h2>
                <p className="lead text-muted mb-4">
                  Access HR, Finance, Leave, and Workflow features in one
                  integrated portal.
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <button
                    onClick={() => signIn()}
                    className="btn bg-black text-white btn-lg rounded-pill d-flex justify-content-center align-items-center w-25"
                    style={{ fontSize: "14px" }}
                  >
                    Get Started
                  </button>
                </div>
              </section>

              {/* Features Overview */}
              <section className="bg-light pt-5">
                <div className="container">
                  <h3 className="text-center mb-3 fw-medium">
                    What You Can Do
                  </h3>
                  <div className="row g-4 text-center">
                    <div className="col-md-4">
                      <div className="p-4 bg-white rounded shadow-sm h-100 rounded-5">
                        <i className="fas fa-calendar-check fa-2x text-primary mb-3"></i>
                        <h5>Leave Management</h5>
                        <p className="text-muted small">
                          Request, approve, or view leave balances and history.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-4 bg-white rounded shadow-sm h-100 rounded-5">
                        <i className="fas fa-wallet fa-2x text-success mb-3"></i>
                        <h5>Advances & Claims</h5>
                        <p className="text-muted small">
                          Submit advance requests and expense claims with full
                          tracking.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-4 bg-white rounded shadow-sm h-100 rounded-5">
                        <i className="fas fa-user-cog fa-2x text-warning mb-3"></i>
                        <h5>Workflow Approvals</h5>
                        <p className="text-muted small">
                          Managers can approve requests from their team in
                          real-time.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <footer className="text-center pt-5 text-muted small mt-auto">
                &copy; {new Date().getFullYear()}{" "}
                {process.env.ORG_NAME ?? "MSF"} · ERP Portal
              </footer>
            </div>
          </div>

          <div className="col-5">
            <div
              className="rounded-5"
              style={{ height: "100%", width: "100%", backgroundColor: "red" }}
            >
              <img
                src="/assets/images/auth-banner.png"
                alt="msf"
                style={{ height: "100%", width: "100%" }}
                className="rounded-5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
