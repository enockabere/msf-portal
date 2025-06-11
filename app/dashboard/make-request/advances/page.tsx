import AdvancesClient from "../../../dashboard/make-request/advances/AdvancesClient";
import {AdvanceContextProvider} from "../../../context/AdvanceContext";

export const metadata = {
  title: "Médecins Sans Frontières - Travel Request",
};

export default function AdvancesPage() {
 return <>
   <AdvanceContextProvider>
     <AdvancesClient />
   </AdvanceContextProvider>
 </>
}
