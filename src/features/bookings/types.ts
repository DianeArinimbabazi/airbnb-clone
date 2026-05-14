export type {
  DatesData,
  PersonalData,
  PaymentData,
  BookingFormData,
} from "./schemas/booking";

// Aliases used by older files
export type DatesFormData    = import("./schemas/booking").DatesData;
export type PersonalFormData = import("./schemas/booking").PersonalData;
export type PaymentFormData  = import("./schemas/booking").PaymentData;
export type BookingData      = import("./schemas/booking").BookingFormData;
