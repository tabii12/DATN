"use client";

import { useState } from "react";

type Props = {
  tour_id: string;
  initialFavorite: boolean;
};

export default function FavoriteButton({ tour_id, initialFavorite }: Props) {
  const [isFavorite, setIsFavorite] = useState<boolean>(initialFavorite);
  const [loading, setLoading] = useState<boolean>(false);

  const token = localStorage.getItem("token");

  const handleToggle = async () => {
    if (loading) return;

    setIsFavorite((prev) => !prev);
    setLoading(true);

    try {
      const res = await fetch("https://db-datn-six.vercel.app/api/favorites/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tour_id }),
      });

      const data: { success: boolean; isFavorite: boolean } = await res.json();

      setIsFavorite(data.isFavorite);
    } catch (error) {
      setIsFavorite((prev) => !prev);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleToggle} disabled={loading}>
      {isFavorite ? "❤️" : "🤍"}
    </button>
  );
}
