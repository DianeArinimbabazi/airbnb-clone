import { useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { FaHeart, FaRegHeart, FaStar, FaMapMarkerAlt } from "react-icons/fa";
import { FiHome } from "react-icons/fi";
import { useFavorites } from "../hooks/useFavorites";
import styles from "./ListingCard.module.css";

import { config } from "../../../config/env";
const BASE_URL = config.apiUrl.replace(/\/api\/?$/, "");

function getImg(listing: any): string {
  if (listing.photos?.length > 0) {
    const url = listing.photos[0].url ?? listing.photos[0];
    if (typeof url === "string" && url.startsWith("http")) return url;
    if (typeof url === "string" && url.startsWith("/")) return `${BASE_URL}${url}`;
  }
  if (listing.img?.trim()) {
    if (listing.img.startsWith("http")) return listing.img;
    return `${BASE_URL}${listing.img}`;
  }
  return "";
}

export function ListingCard({ listing }: { listing: any }) {
  const title = listing.title;
  const location = listing.location;
  const price = listing.pricePerNight ?? listing.price ?? 0;
  const rating = listing.rating ?? 0;
  const category = listing.type ?? listing.category ?? "APARTMENT";
  const available = listing.available ?? true;
  const superhost = listing.superhost ?? false;

  const { toggle, isSaved } = useFavorites();
  const saved = isSaved(listing.id);
  const navigate = useNavigate();
  const [err, setErr] = useState(false);
  const imgUrl = getImg(listing);

  return (
    <div
      className={clsx(styles.card, { [styles.saved]: saved, [styles.luxury]: price > 300, [styles.booked]: !available, [styles.superhost]: superhost })}
      onClick={() => navigate(`/listings/${listing.id}`)}
    >
      <div className={styles.imgWrapper}>
        {imgUrl && !err
          ? <img className={styles.img} src={imgUrl} alt={title} loading="lazy" onError={() => setErr(true)} />
          : <div className={styles.imgFallback}><FiHome size={32} color="#9ca3af" /></div>
        }
        <span className={styles.category}>{category}</span>
        <button className={styles.heartBtn} onClick={(e) => { e.stopPropagation(); toggle(listing.id, title); }} aria-label="Toggle save">
          {saved ? <FaHeart className={styles.heartSaved} /> : <FaRegHeart className={styles.heartUnsaved} />}
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.topRow}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.rating}><FaStar />{Number(rating).toFixed(1)}</div>
        </div>
        <div className={styles.location}><FaMapMarkerAlt />{location}</div>
        <div className={styles.meta}>
          {superhost && <span className={styles.badgeSuperhost}>Superhost</span>}
          {price > 300 && <span className={styles.badgeLuxury}>Luxury</span>}
          {available ? <span className={styles.badgeAvailable}>Available</span> : <span className={styles.badgeBooked}>Booked</span>}
        </div>
        <div className={styles.footer}>
          <div className={styles.price}>${price.toLocaleString()} <span>/ night</span></div>
          <div className={styles.date}>{listing.guests ? `Up to ${listing.guests} guests` : ""}</div>
        </div>
      </div>
    </div>
  );
}

export default ListingCard;


