import { AdvanceContextProvider } from "../../context/AdvanceContext";
import MakeRequestClient from "../../dashboard/make-request/MakeRequestClient";

export const metadata = {
  title: "Médecins Sans Frontières - Make Request",
};

export default function MakeRequestPage() {
  return (
    <>
      <AdvanceContextProvider>
        <MakeRequestClient />
      </AdvanceContextProvider>
    </>
  );
}
