"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import HotelListingPage from "../../components/hotels/HotelListingPage";

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");

  useEffect(() => {
    if (!q) window.location.href = "/tours";
  }, [q]);

  if (!q) return null;

  return <HotelListingPage />;
}

export default function ToursSearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}