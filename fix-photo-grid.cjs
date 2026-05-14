const fs = require("fs");
const file = "src/features/listings/pages/ListingDetail.tsx";
let c = fs.readFileSync(file, "utf8");

const before = `          {[1,2,3,4].map(i => (
            <div key={i} style={{ overflow:"hidden", background: detailBg, cursor:"pointer" }} onClick={() => { if (photos[i]) { setPhotoIndex(i); setShowCarousel(true); } }}>
              {photos[i]
                ? <img src={photos[i]} alt={"Photo " + (i+1)} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                : <div style={{ width:"100%", height:"100%", background: detailBg, display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ color:"#ccc", fontSize:"13px" }}>No photo</span></div>
              }
            </div>
          ))}`;

const after = `          {[1,2,3,4].filter(i => photos[i]).map(i => (
            <div key={i} style={{ overflow:"hidden", background: detailBg, cursor:"pointer" }} onClick={() => { setPhotoIndex(i); setShowCarousel(true); }}>
              <img src={photos[i]} alt={"Photo " + (i+1)} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            </div>
          ))}`;

if (c.includes(before)) {
  c = c.replace(before, after);
  fs.writeFileSync(file, c, "utf8");
  console.log("Fixed!");
} else {
  console.log("No match - check spacing");
}
