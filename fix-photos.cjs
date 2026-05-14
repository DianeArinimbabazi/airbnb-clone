const fs = require("fs");

// Fix 1: ListingDetail - only show photo slots that have real photos
const detailFile = "src/features/listings/pages/ListingDetail.tsx";
let c = fs.readFileSync(detailFile, "utf8");

c = c.replace(
  `          {[1,2,3,4].map(i => (
            <div key={i} style={{ overflow:"hidden", background: detailBg, cursor:"pointer" }} onClick={() => { setPhotoIndex(i); setShowCarousel(true); }}>
              {photos[i] ? <img src={photos[i]} alt={"photo " + i} style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : <div style={{ width:"100%", height:"100%", background: detailBg }} />}
            </div>
          ))}`,
  `          {[1,2,3,4].map(i => (
            <div key={i} style={{ overflow:"hidden", background: detailBg, cursor:"pointer" }} onClick={() => { if (photos[i]) { setPhotoIndex(i); setShowCarousel(true); } }}>
              {photos[i]
                ? <img src={photos[i]} alt={"Photo " + (i+1)} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                : <div style={{ width:"100%", height:"100%", background: detailBg, display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ color:"#ccc", fontSize:"13px" }}>No photo</span></div>
              }
            </div>
          ))}`
);

fs.writeFileSync(detailFile, c, "utf8");
console.log("ListingDetail fixed!");

// Fix 2: ListingCard - hide listings with no photos (use filter in listings page)
const listingsPageFile = "src/features/listings/pages/ListingsPage.tsx";
let lp = fs.readFileSync(listingsPageFile, "utf8");
console.log("ListingsPage first 200 chars:", lp.slice(0, 200));
