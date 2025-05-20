import { AdvanceContextProvider } from "@/app/context/AdvanceContext";
import OtherAdvancesClient from "@/app/dashboard/make-request/otherAdvances/OtherAdvancesClient";

export const metadata = {
  title: "Médecins Sans Frontières - Other Advances",
};

export default function OtherAdvancesPage() {
  return (
    <>
      <AdvanceContextProvider>
        <OtherAdvancesClient />
      </AdvanceContextProvider>
    </>
  );

}
