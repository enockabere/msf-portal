import { Geist, Geist_Mono } from "next/font/google";
import BootstrapClient from "./components/bootstrap/BootstrapClient";
import { MySetupsProvider } from "./context/SetupContext";
import SessionProvider from "./context/SessionProvider";
import "../styles/bootstrap.min.css";
import "../styles/icons.min.css";
import "../styles/app.min.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Médecins Sans Frontières - Self Service",
    template: "Médecins Sans Frontières - %s",
  },
  description: "Employee Self Service Portal",
  icons: {
    icon: "/assets/images/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {" "}
          <MySetupsProvider>
            <BootstrapClient />
            {children}
          </MySetupsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
