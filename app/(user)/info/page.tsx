import { Suspense } from "react";
import TourInfoPage from "../components/Tourinfopage";

export default function Page() {
  return (
    <Suspense>
      <TourInfoPage />
    </Suspense>
  );
}