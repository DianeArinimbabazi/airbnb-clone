const fs = require("fs");
const file = "src/features/listings/pages/ListingDetail.tsx";
let c = fs.readFileSync(file, "utf8");

c = c.replace(
  `              <img src={photos[i]} alt={"Photo " + (i+1)} style={{ width:"100%", height:"100%", objectFit:"cover" }} />`,
  `              <img src={photos[i]} alt={"Photo " + (i+1)} style={{ width:"100%", height:"100%", objectFit:"cover" }}
                onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />`
);

fs.writeFileSync(file, c, "utf8");
console.log("Fixed:", c.includes("onError"));
