"use client";

import { Suspense } from "react";
import HotelListingPage from "../../components/hotels/HotelListingPage";

function SearchContent() {
  return <HotelListingPage />;
}

export default function ToursSearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}