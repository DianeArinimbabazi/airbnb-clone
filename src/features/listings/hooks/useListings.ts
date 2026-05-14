import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import type { Listing } from "../types";

const PHOTOS: Record<string, string[]> = {
  VILLA: [
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    "https://images.unsplash.com/photo-1602343168117-bb8a12d7c180?w=800",
    "https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d?w=800",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    "https://images.unsplash.com/photo-1520637836993-5e6a2a71e4db?w=800",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800",
    "https://images.unsplash.com/photo-1582610116397-edb72a45cb75?w=800",
  ],
  CABIN: [
    "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800",
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800",
    "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800",
    "https://images.unsplash.com/photo-1520984032042-162d526883ef?w=800",
    "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=800",
    "https://images.unsplash.com/photo-1482192505345-5852310af207?w=800",
    "https://images.unsplash.com/photo-1525113990976-399835c43838?w=800",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800",
  ],
  APARTMENT: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800",
    "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800",
    "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800",
  ],
  HOUSE: [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
    "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800",
    "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800",
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
    "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800",
    "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800",
    "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800",
  ],
};

const FALLBACK = [
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
  "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=800",
  "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800",
];

function hashId(id: string): number {
  return id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function assignPhoto(listing: Listing): Listing {
  if (listing.photos && listing.photos.length > 0) return listing;
  const pool = PHOTOS[listing.type] ?? FALLBACK;
  const url = pool[hashId(listing.id) % pool.length];
  return { ...listing, photos: [{ url }] };
}

export function useListings() {
  return useQuery<Listing[]>({
    queryKey: ["listings"],
    queryFn: async () => {
      const res = await api.get<{ data: Listing[] }>("/listings?limit=50");
      return (res.data ?? []).map(assignPhoto);
    },
  });
}