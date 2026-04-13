"use client";

import { Suspense } from "react";
import HotelListingPage from "../../components/tours/ToursListingPage";

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