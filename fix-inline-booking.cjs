const fs = require("fs");
const file = "src/features/listings/pages/ListingDetail.tsx";
let c = fs.readFileSync(file, "utf8");

// Add missing imports for useMutation and toast
c = c.replace(
  `import { useParams, useNavigate } from "react-router-dom";`,
  `import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";`
);

// Replace the Book button with inline booking logic
c = c.replace(
  `            <button onClick={() => navigate("/listings/" + listing.id + "/book")}
              style={{ width:"100%", padding:"14px", background:"#FF385C", color:"#fff", border:"none", borderRadius:"10px", fontSize:"16px", fontWeight:700, cursor:"pointer", fontFamily:"inherit", marginBottom:"12px" }}>
              Book
            </button>`,
  `            <button onClick={handleBook} disabled={bookMutation.isPending || !checkIn || !checkOut}
              style={{ width:"100%", padding:"14px", background: (!checkIn || !checkOut) ? "#ccc" : "#FF385C", color:"#fff", border:"none", borderRadius:"10px", fontSize:"16px", fontWeight:700, cursor: (!checkIn || !checkOut) ? "default" : "pointer", fontFamily:"inherit", marginBottom:"12px" }}>
              {bookMutation.isPending ? "Booking..." : "Book"}
            </button>`
);

// Add handleBook function and mutation before the return statement
c = c.replace(
  `  const prevPhoto = () => setPhotoIndex(i => (i - 1 + photos.length) % photos.length);
  const nextPhoto = () => setPhotoIndex(i => (i + 1) % photos.length);`,
  `  const qc = useQueryClient();

  const bookMutation = useMutation({
    mutationFn: () => api.post("/bookings", {
      listingId: listing!.id,
      checkIn: new Date(checkIn + "T14:00:00.000Z").toISOString(),
      checkOut: new Date(checkOut + "T14:00:00.000Z").toISOString(),
    }),
    onSuccess: () => {
      toast.success("Booking confirmed!");
      qc.invalidateQueries({ queryKey: ["bookings"] });
      navigate("/guest");
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? "Booking failed"),
  });

  function handleBook() {
    if (!checkIn || !checkOut) return toast.error("Select check-in and check-out dates");
    if (new Date(checkOut) <= new Date(checkIn)) return toast.error("Check-out must be after check-in");
    bookMutation.mutate();
  }

  const prevPhoto = () => setPhotoIndex(i => (i - 1 + photos.length) % photos.length);
  const nextPhoto = () => setPhotoIndex(i => (i + 1) % photos.length);`
);

fs.writeFileSync(file, c, "utf8");
console.log("Done! handleBook:", c.includes("handleBook"), "mutation:", c.includes("bookMutation"));
