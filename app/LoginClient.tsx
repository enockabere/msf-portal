"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import {
  ShieldCheck,
  BadgeCheck,
  Users,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";
import PageLoader from "./components/loaders/PageLoader";
import type { ISourceOptions } from "tsparticles-engine";
import "./LandingPage.css";

export default function LandingPage() {
  const { status } = useSession();
  const { data: session } = useSession();
  const errorMessage = session?.error;

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <ShieldCheck size={24} className="text-white" />,
      title: "Leave Management",
      description:
        "Apply for leave, check balances, and get approvals in real-time.",
    },
    {
      icon: <BadgeCheck size={24} className="text-white" />,
      title: "Advances & Claims",
      description:
        "Submit and track salary advances, travel reimbursements, and more.",
    },
    {
      icon: <Users size={24} className="text-white" />,
      title: "Workflow Approvals",
      description: "Managers can approve requests from anywhere, anytime.",
    },
  ];

  const particlesInit = async (main: any) => await loadSlim(main);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [features.length]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSSORedirect = async () => {
    sessionStorage.setItem("loginAttempt", "true");
    setIsLoggingIn(true);
    await signIn("azure-ad", {
      callbackUrl: "/dashboard",
    });
  };

  if (status === "loading") {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <PageLoader />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="alert alert-danger text-center w-50">
          <h5 className="mb-3">Login Failed</h5>
          <p>{errorMessage}</p>
          <button
            className="btn btn-outline-danger mt-3"
            onClick={() => signIn("azure-ad")}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const particleOptions: ISourceOptions = {
    fullScreen: { enable: false },
    background: { color: "transparent" },
    particles: {
      number: { value: 30 },
      color: { value: "#e52129" },
      size: { value: 1.5 },
      opacity: { value: 0.2, random: true },
      move: {
        enable: true,
        speed: 0.4,
        direction: "none",
        outModes: { default: "out" },
      },
    },
  };

  return (
    <div className="landing-container">
      <Particles
        id="particles"
        init={particlesInit}
        options={particleOptions}
        className="particles-layer"
      />

      <header
        className={`navbar fixed-top ${isScrolled ? "scrolled shadow-sm" : ""}`}
      >
        <div className="container-fluid d-flex justify-content-between align-items-center px-4">
          <Image
            src="/assets/images/logo-light.png"
            alt="Logo"
            width={120}
            height={50}
          />
          <button
            className="btn btn-danger d-flex align-items-center gap-2"
            onClick={handleSSORedirect}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              "Redirecting..."
            ) : (
              <>
                Staff Login <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </header>

      <main className="container d-flex flex-column flex-md-row align-items-center justify-content-center min-vh-100 gap-5 pt-5">
        <div
          className={`col-md-6 text-white animate-left ${
            isLoaded ? "loaded" : ""
          }`}
        >
          <h1 className="display-5 fw-bold mb-4">
            Empowering Staff Across Regions With <br />
            <span className="text-danger">Employee Self Service</span>
          </h1>
          <p className="lead text-light">
            Built on Ubuntu values — a unified, respectful, and accessible
            system for everyone. Integrated with Microsoft Business Central.
          </p>
          <button
            className="btn btn-danger btn-lg mt-4"
            onClick={handleSSORedirect}
          >
            <LayoutDashboard className="me-2" size={20} />
            Access Your Dashboard
          </button>
        </div>

        <div className={`col-md-6 animate-right ${isLoaded ? "loaded" : ""}`}>
          <div className="card bg-dark text-white p-4 rounded shadow feature-card">
            <div className="mb-3">
              {features[activeFeature].icon}
              <h4 className="mt-2">{features[activeFeature].title}</h4>
            </div>
            <p>{features[activeFeature].description}</p>
            <div className="d-flex gap-2 pt-3">
              {features.map((_, i) => (
                <span
                  key={i}
                  className={`dot ${activeFeature === i ? "active" : ""}`}
                  onClick={() => setActiveFeature(i)}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="footer text-center text-white-50 py-4 bg-dark border-top border-light">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div>&copy; {new Date().getFullYear()} MSF-EA · ERP Portal</div>
          <div>Powered by Kinetics Technologies</div>
        </div>
      </footer>
    </div>
  );
}
