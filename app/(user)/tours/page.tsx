import HotelListingPage from "../components/hotels/HotelListingPage";

interface Props {
  params: { slug: string };
}

export default function HotelSlugPage({ params }: Props) {
  return <HotelListingPage />;
}