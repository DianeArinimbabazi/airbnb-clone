const fs = require("fs");
const file = "src/features/listings/pages/ListingDetail.tsx";
let c = fs.readFileSync(file, "utf8");

// Move useQueryClient and bookMutation BEFORE the early returns
// Remove them from where they were added after early returns
c = c.replace(
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
  const nextPhoto = () => setPhotoIndex(i => (i + 1) % photos.length);`,
  `  const prevPhoto = () => setPhotoIndex(i => (i - 1 + photos.length) % photos.length);
  const nextPhoto = () => setPhotoIndex(i => (i + 1) % photos.length);`
);

// Add all hooks right after the useState declarations, before any early returns
c = c.replace(
  `  const [showCarousel, setShowCarousel] = useState(false);`,
  `  const [showCarousel, setShowCarousel] = useState(false);

  const qc = useQueryClient();
  const bookMutation = useMutation({
    mutationFn: () => api.post("/bookings", {
      listingId: id!,
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
  }`
);

fs.writeFileSync(file, c, "utf8");
console.log("Done! hooks before early return:", c.indexOf("useQueryClient") < c.indexOf("if (isLoading)"));
