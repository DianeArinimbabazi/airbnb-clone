import { useState } from "react";
import type { DatesData, PersonalData, PaymentData, BookingFormData } from "../schemas/booking";

export type { DatesData, PersonalData, PaymentData, BookingFormData };

export function useBooking() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<BookingFormData>>({});

  const next = (stepData: Partial<BookingFormData>) => {
    setData((p) => ({ ...p, ...stepData }));
    setStep((s) => s + 1);
  };
  const back = () => setStep((s) => s - 1);

  return { step, data, next, back };
}
