const fs = require("fs");
const file = "src/features/listings/pages/ListingDetail.tsx";
let c = fs.readFileSync(file, "utf8");

// Fix "Show all 1 photos" - hide button when only 1 photo
c = c.replace(
  `        <button onClick={() => setShowCarousel(true)} style={{ position:"absolute", bottom:"16px", right:"16px", background: cardBg, border:"1.5px solid " + text, borderRadius:"8px", padding:"8px 16px", fontWeight:600, fontSize:"13px", cursor:"pointer", fontFamily:"inherit", color: text }}>
          Show all {photos.length} photos
        </button>`,
  `        {photos.length > 1 && (
          <button onClick={() => setShowCarousel(true)} style={{ position:"absolute", bottom:"16px", right:"16px", background: cardBg, border:"1.5px solid " + text, borderRadius:"8px", padding:"8px 16px", fontWeight:600, fontSize:"13px", cursor:"pointer", fontFamily:"inherit", color: text }}>
            Show all {photos.length} photos
          </button>
        )}`
);

// Fix rating showing 0 - only show if rating exists and is > 0
c = c.replace(
  `              {listing.rating && (
                <span style={{ display:"flex", alignItems:"center", gap:"4px", fontSize:"14px", fontWeight:600, color: text }}>
                  <FaStar size={12} color="#FF385C" /> {numeral(listing.rating).format("0.0")}
                </span>
              )}`,
  `              {listing.rating && Number(listing.rating) > 0 && (
                <span style={{ display:"flex", alignItems:"center", gap:"4px", fontSize:"14px", fontWeight:600, color: text }}>
                  <FaStar size={12} color="#FF385C" /> {numeral(listing.rating).format("0.0")}
                </span>
              )}`
);

fs.writeFileSync(file, c, "utf8");
console.log("Fixed!");
