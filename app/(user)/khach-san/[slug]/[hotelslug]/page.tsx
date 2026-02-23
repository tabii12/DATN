import HotelDetailPage from "@/app/(user)/components/layout/HotelDetailPage";

interface Props {
  params: { slug: string };
}

export default function HotelSlugPage({ params }: Props) {
  return <HotelDetailPage />;
}