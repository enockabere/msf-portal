"use client";

import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  BadgeCheck,
  Users,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import "./tailwind.css";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import type { ISourceOptions } from "tsparticles-engine";

export default function LandingPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const particlesInit = async (main: any) => {
    await loadSlim(main);
  };

  const particleOptions: ISourceOptions = {
    fullScreen: { enable: false },
    background: { color: "transparent" },
    particles: {
      number: { value: 30 },
      color: { value: "#e52129" },
      size: { value: 1.5 },
      opacity: {
        value: 0.2,
        random: true,
        anim: { enable: false },
      },
      move: {
        enable: true,
        speed: 0.4,
        direction: "none" as const,
        outModes: { default: "out" },
      },
    },
  };

  const features = [
    {
      icon: <ShieldCheck size={24} className="text-white" />,
      title: "Leave Management",
      description:
        "Apply for leave, check balances, and get approvals in real-time.",
      color: "from-[#e52129] to-[#c11a22]",
    },
    {
      icon: <BadgeCheck size={24} className="text-white" />,
      title: "Advances & Claims",
      description:
        "Submit and track salary advances, travel reimbursements, and more.",
      color: "from-[#e52129] to-[#a8151c]",
    },
    {
      icon: <Users size={24} className="text-white" />,
      title: "Workflow Approvals",
      description: "Managers can approve requests from anywhere, anytime.",
      color: "from-[#c11a22] to-[#e52129]",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
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

  const handleSSORedirect = () => {
    setIsLoggingIn(true);
    signIn("azure-ad", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-black to-[#111] text-white flex flex-col">
      {/* Enhanced background elements */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particleOptions}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute inset-0 bg-[url('/assets/images/grid-pattern.svg')] opacity-10" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,#e5212930,transparent_70%)] animate-pulse-glow-slow" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_70%,#e5212920,transparent_70%)] animate-pulse-glow-delay" />

        {/* Floating elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-[#e5212915] blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-[#e5212915] blur-3xl animate-float-medium" />
        <div className="absolute top-2/3 left-1/2 w-24 h-24 rounded-full bg-[#e5212915] blur-2xl animate-float-fast" />
      </div>

      {/* Simplified topbar that shrinks on scroll */}
      <header
        className={`fixed top-0 z-50 w-full flex justify-between items-center px-6 md:px-12 transition-all duration-300
    ${
      isScrolled
        ? "py-3 bg-white/90 backdrop-blur-sm shadow-xl"
        : "py-5 bg-white shadow"
    }
    ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
  `}
      >
        <div className="flex items-center gap-3 transition-all duration-300">
          <Image
            src="/assets/images/logo-light.png"
            alt="MSF Logo"
            width={isScrolled ? 120 : 140}
            height={isScrolled ? 30 : 40}
            className="transition-all duration-300"
          />
        </div>

        <Button
          onClick={handleSSORedirect}
          disabled={isLoggingIn}
          className={`relative overflow-hidden group bg-[#e52129] hover:bg-[#c11a22] text-white rounded-lg font-medium tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 ${
            isScrolled ? "px-4 py-1.5 text-sm" : "px-5 py-2"
          }`}
        >
          <span className="relative z-10 flex items-center">
            {isLoggingIn ? (
              "Redirecting..."
            ) : (
              <>
                <span>Staff Login</span>
                <ArrowRight
                  size={isScrolled ? 14 : 16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </>
            )}
          </span>
          <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        </Button>
      </header>

      {/* Add padding to main content to account for fixed header */}
      <div className={isScrolled ? "pt-20" : "pt-24"}></div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center px-6 md:px-12 gap-8 md:gap-16 py-12">
        {/* Left side: Text Content with enhanced styling */}
        <div
          className={`md:w-1/2 space-y-8 transition-all duration-700 delay-100 ${
            isLoaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
          }`}
        >
          <div className="relative">
            <div className="absolute -left-4 top-0 h-full w-1 bg-[#e52129] rounded-full" />
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              <span className="text-white/90">Empowering Staff</span>
              <span className="block text-white/90">Across Regions With</span>
              <span className="block text-[#e52129] font-extrabold mt-2">
                Employee Self Service
              </span>
            </h3>
          </div>

          <p className="text-lg text-white/70 leading-relaxed max-w-xl">
            Built on Ubuntu values — a unified, respectful, and accessible
            system for everyone. Seamlessly integrated with Microsoft Business
            Central.
          </p>

          {/* Enhanced CTA button */}
          <div className="pt-4">
            <Button
              onClick={handleSSORedirect}
              className="group relative overflow-hidden mt-6 bg-[#e52129] hover:bg-[#c11a22] text-white px-8 py-6 rounded-xl font-medium transition-all duration-500 shadow-lg hover:shadow-xl"
            >
              <span className="absolute inset-0 w-full h-full bg-white/10 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <span className="relative z-10 flex items-center gap-3">
                <LayoutDashboard
                  size={22}
                  className="transition-transform group-hover:rotate-12 group-hover:scale-110 duration-300"
                />
                <span className="text-base">Access Your Dashboard</span>
              </span>
            </Button>
          </div>

          {/* Info badges */}
          <div className="flex flex-wrap gap-4 pt-6">
            <div className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 bg-[#e52129] rounded-full animate-pulse"></span>
              <span className="text-sm text-white/80">SSO Enabled</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span className="text-sm text-white/80">24/7 Accessibility</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 bg-[#e52129] rounded-full animate-pulse"></span>
              <span className="text-sm text-white/80">Mobile Responsive</span>
            </div>
          </div>
        </div>

        {/* Right side: Enhanced Feature Cards - now responsive */}
        <div
          className={`md:w-1/2 h-full flex items-center justify-center transition-all duration-700 delay-200 ${
            isLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
          }`}
        >
          <div className="relative w-full max-w-md min-h-[400px]">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`absolute inset-0 bg-black/50 p-6 w-full h-full transition-all duration-500 ease-out rounded-xl ${
                  activeFeature === index
                    ? "opacity-100 scale-100 z-10 translate-y-0 shadow-[0_10px_50px_rgba(229,33,41,0.3)]"
                    : index < activeFeature
                    ? "opacity-0 scale-95 -z-10 -translate-y-8"
                    : "opacity-0 scale-95 -z-10 translate-y-8"
                }`}
              >
                <div className="pb-4">
                  <div
                    className={`w-16 h-16 flex items-center justify-center rounded-2xl bg-[#e52129] mb-4 transition-all duration-500 hover:scale-110 shadow-lg relative group overflow-hidden`}
                  >
                    <span className="absolute inset-0 w-full h-full bg-white/10 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
                    <span className="relative">{feature.icon}</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white">
                    {feature.title}
                  </h3>
                </div>
                <div className="text-white/70 leading-relaxed text-lg">
                  {feature.description}
                </div>

                <div className="pt-6">
                  <div className="flex justify-center gap-2 w-full">
                    {features.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveFeature(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          activeFeature === i
                            ? "bg-[#e52129] w-8"
                            : "bg-white/30 hover:bg-white/50 w-2"
                        }`}
                        aria-label={`View feature ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer
        className={`relative z-10 w-full text-center py-6 text-sm text-white/60 border-t border-white/10 bg-black/50 transition-all duration-700 delay-300 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="mx-auto max-w-screen-lg flex flex-col md:flex-row justify-between items-center gap-4 px-4">
          <div>&copy; {new Date().getFullYear()} MSF-EA · ERP Portal</div>
          <div className="text-white/60">Powered by Kinetics Technologies</div>
        </div>
      </footer>

      {/* Enhanced Animations */}
      <style jsx global>{`
        @keyframes pulse-glow-slow {
          0%,
          100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.25;
          }
        }
        @keyframes pulse-glow-delay {
          0%,
          100% {
            opacity: 0.08;
          }
          50% {
            opacity: 0.2;
          }
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-15px) translateX(15px);
          }
          50% {
            transform: translateY(0) translateX(30px);
          }
          75% {
            transform: translateY(15px) translateX(15px);
          }
        }
        @keyframes float-medium {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-25px) translateX(10px);
          }
          66% {
            transform: translateY(15px) translateX(-15px);
          }
        }
        @keyframes float-fast {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(-20px);
          }
        }
        .animate-pulse-glow-slow {
          animation: pulse-glow-slow 8s ease-in-out infinite;
        }
        .animate-pulse-glow-delay {
          animation: pulse-glow-delay 10s ease-in-out infinite 2s;
        }
        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 15s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 12s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
