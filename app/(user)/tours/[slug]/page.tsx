import { use } from "react";
import HotelDetailPage from "../../components/tours/TourslDetailPage";
export default function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return <HotelDetailPage slug={slug} />;
}