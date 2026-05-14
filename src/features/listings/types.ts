export interface Listing {
  id: string;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  guests: number;
  type: string;
  amenities: string;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
  hostId: string;
  host: { name: string; avatar: string | null };
  superhost?: boolean;
  available?: boolean;
  availableFrom?: string;
  img?: string;
  category?: string;
  photos?: { url: string }[];
}