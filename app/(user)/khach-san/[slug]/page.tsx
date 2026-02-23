import HotelListingPage from "../../components/layout/HotelListingPage";

interface Props {
  params: { slug: string };
}

export default function HotelSlugPage({ params }: Props) {
  return <HotelListingPage />;
}