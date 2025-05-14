"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import { useSession } from "next-auth/react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const greetings = [
  { greeting: "Jambo 👋", welcome: "Karibu Tena!" },
  { greeting: "Hola 👋", welcome: "¡Bienvenido de nuevo!" },
  { greeting: "Bonjour 👋", welcome: "Bienvenue encore!" },
  { greeting: "Hallo 👋", welcome: "Willkommen zurück!" },
  { greeting: "Ciao 👋", welcome: "Benvenuto di nuovo!" },
  { greeting: "Olá 👋", welcome: "Bem-vindo novamente!" },
  { greeting: "Salam 👋", welcome: "Selamat datang kembali!" },
  { greeting: "Namaste 👋", welcome: "Phir se swagat hai!" },
  { greeting: "Konnichiwa 👋", welcome: "Okaerinasai!" },
  { greeting: "Annyeong 👋", welcome: "다시 오신 것을 환영합니다!" },
];

type Quote = {
  content: string;
  author: string;
};

export default function BreadcrumbNav() {
  const { breadcrumb } = useBreadcrumb();
  const { data: session } = useSession();
  // const isLoading = !session;
  const [currentGreeting, setCurrentGreeting] = useState(greetings[0]);
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    const randomizeGreeting = () => {
      const randomIndex = Math.floor(Math.random() * greetings.length);
      setCurrentGreeting(greetings[randomIndex]);
    };

    const interval = setInterval(randomizeGreeting, 20000);
    randomizeGreeting();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await fetch("/api/quote");
        const data = await res.json();
        setQuote({ content: data.content, author: data.author });
      } catch (err) {
        console.error("❌ Failed to fetch quote:", err);
        setQuote({
          content: "Your limitation—it’s only your imagination.",
          author: "Unknown",
        });
      }
    };

    fetchQuote();
  }, []);

  const quoteText = quote
    ? `"${quote.content}" – ${quote.author}`
    : "Fetching a quote for you...";

  if (breadcrumb.length === 0) {
    return (
      <li className="mx-3 welcome-text">
        <h3 className="mb-0 fw-bold text-truncate">
          {currentGreeting.greeting},{" "}
          {session?.user?.profile?.firstName ? (
              session?.user?.profile?.firstName
          ) : (
            <Skeleton width={100} />
          )}
        </h3>
        <h6 className="mb-0 fw-normal text-muted text-truncate fs-14">
          {quoteText}
        </h6>
      </li>
    );
  }

  return (
    <li className="mx-3">
      <h3 className="mb-0 fw-bold text-truncate">
        {currentGreeting.greeting},{" "}
        {session?.user?.profile?.firstName || <Skeleton width={100} />}
      </h3>
      <div className="d-flex align-items-center py-2 rounded-3">
        <Link
          href="/dashboard"
          className="text-primary d-flex align-items-center text-decoration-none"
        >
          <div
            className="bg-danger rounded-circle d-flex align-items-center justify-content-center me-2"
            style={{ width: 20, height: 20 }}
          >
            <Home size={12} className="text-white" />
          </div>
        </Link>

        {breadcrumb.map((item, index) => {
          const isLast = index === breadcrumb.length - 1;
          return (
            <div key={index} className="d-flex align-items-center">
              <ChevronRight className="text-danger" size={15} />
              <Link
                href={item.path}
                className={`text-decoration-none ${
                  isLast ? "text-danger" : "text-dark"
                }`}
                style={{ fontSize: ".7rem" }}
              >
                {item.label}
              </Link>
            </div>
          );
        })}
      </div>
    </li>
  );
}
