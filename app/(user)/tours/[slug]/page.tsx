import { use } from "react";
import HotelDetailPage from "../../components/hotels/HotelDetailPage";
export default function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return <HotelDetailPage slug={slug} />;
}