"use client";

import HotelDetailPage from "../../components/hotels/HotelDetailPage";

// Page nhận params từ Next.js App Router → truyền slug xuống client component
export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <HotelDetailPage slug={slug} />;
}