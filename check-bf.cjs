const fs = require("fs");

// Check what those files actually say about BookingForm
const files = [
  "src/features/bookings/components/StepConfirmation.tsx",
  "src/features/bookings/hooks/useBooking.ts",
  "src/features/bookings/pages/BookingPage.tsx",
  "src/features/bookings/schemas/booking.ts",
  "src/features/bookings/types.ts",
];
for (const f of files) {
  const lines = fs.readFileSync(f, "utf8").split("\n");
  lines.forEach((l, i) => {
    if (l.includes("BookingForm")) console.log(f + ":" + (i+1) + ": " + l.trim());
  });
}
