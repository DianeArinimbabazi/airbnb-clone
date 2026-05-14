const fs = require("fs");
const file = "src/features/listings/pages/ListingDetail.tsx";
let c = fs.readFileSync(file, "utf8");

const before = `        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gridTemplateRows:"240px 240px", gap:"8px", borderRadius:"16px", overflow:"hidden" }}>
          <div style={{ gridRow:"1 / 3", position:"relative", overflow:"hidden", cursor:"pointer" }} onClick={() => { setPhotoIndex(0); setShowCarousel(true); }}>
            <img src={photos[0]} alt={listing.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
          {[1,2,3,4].filter(i => photos[i]).map(i => (
            <div key={i} style={{ overflow:"hidden", background: detailBg, cursor:"pointer" }} onClick={() => { setPhotoIndex(i); setShowCarousel(true); }}>
              <img src={photos[i]} alt={"Photo " + (i+1)} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            </div>
          ))}
        </div>`;

const after = `        {photos.length === 1 ? (
          <div style={{ height:"480px", borderRadius:"16px", overflow:"hidden", cursor:"pointer" }} onClick={() => setShowCarousel(true)}>
            <img src={photos[0]} alt={listing.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gridTemplateRows:"240px 240px", gap:"8px", borderRadius:"16px", overflow:"hidden" }}>
            <div style={{ gridRow:"1 / 3", position:"relative", overflow:"hidden", cursor:"pointer" }} onClick={() => { setPhotoIndex(0); setShowCarousel(true); }}>
              <img src={photos[0]} alt={listing.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            </div>
            {[1,2,3,4].filter(i => photos[i]).map(i => (
              <div key={i} style={{ overflow:"hidden", cursor:"pointer" }} onClick={() => { setPhotoIndex(i); setShowCarousel(true); }}>
                <img src={photos[i]} alt={"Photo " + (i+1)} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              </div>
            ))}
          </div>
        )}`;

if (c.includes(before)) {
  fs.writeFileSync(file, c.replace(before, after), "utf8");
  console.log("Photo grid fixed!");
} else {
  console.log("No match - paste lines 130-144 from the file");
}
