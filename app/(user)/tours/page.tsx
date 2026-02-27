"use client";

import { Suspense } from "react";
import HotelListingPage from "../components/hotels/HotelListingPage";

export default function HotelSlugPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HotelListingPage />
    </Suspense>
  );
}