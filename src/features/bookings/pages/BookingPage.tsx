import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../../lib/api";
import { useListing } from "../../listings/hooks/useListing";
import { StepDates } from "../components/StepDates";
import { StepPersonal } from "../components/StepPersonal";
import { StepPayment } from "../components/StepPayment";
import { StepConfirmation } from "../components/StepConfirmation";
import { Spinner } from "../../../shared/components/Spinner";
import { useTheme } from "../../../shared/context/ThemeContext";
import type { BookingFormData } from "../schemas/booking";

type Step = 1|2|3|4;
const LABELS: Record<Step,string> = { 1:"Dates", 2:"Your details", 3:"Payment", 4:"Confirm" };

function toISO(dateStr: string): string {
  const d = new Date(dateStr + "T14:00:00.000Z");
  return d.toISOString();
}

export function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { dark } = useTheme();
  const { data: listing, isLoading } = useListing(id!);
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const qCheckIn = sp.get("checkIn") ?? undefined;
  const qCheckOut = sp.get("checkOut") ?? undefined;
  const qRescheduleId = sp.get("rescheduleBookingId") ?? undefined;
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<Partial<BookingFormData>>(() => ({ checkIn: qCheckIn, checkOut: qCheckOut }));

  const bg    = dark ? "#1a1a1a" : "#ffffff";
  const card  = dark ? "#2a2a2a" : "#f9f9f9";
  const text  = dark ? "#f0f0f0" : "#222222";
  const sub   = dark ? "#aaaaaa" : "#717171";
  const border= dark ? "#444444" : "#e0e0e0";

  const mutation = useMutation({
    mutationFn: (data: BookingFormData) =>
      api.post("/bookings", { listingId: id, checkIn: toISO(data.checkIn), checkOut: toISO(data.checkOut) }),
    onSuccess: () => {
      toast.success("Booking confirmed!");
      qc.invalidateQueries({ queryKey: ["bookings", "me"] });
      qc.invalidateQueries({ queryKey: ["listing", id] });
      if (qRescheduleId) {
        api.delete(`/bookings/${qRescheduleId}`).then(() => {
          toast.success("Previous booking cancelled — rescheduled.");
          qc.invalidateQueries({ queryKey: ["bookings", "mine"] });
          navigate("/guest");
        }).catch(() => {
          navigate("/guest");
        });
      } else {
        navigate("/guest");
      }
    },
    onError: (e: Error) => toast.error(e.message || "Booking failed"),
  });

  if (isLoading) return <Spinner />;
  if (!listing) return (
    <div style={{ textAlign:"center", padding:"80px 24px" }}>
      <p style={{ fontSize:"48px", color: text, marginBottom: 24 }}>Listing not found</p>
      <h2 style={{ color: text }}>Listing not found</h2>
      <button onClick={() => navigate(-1)} style={{ marginTop:"16px", background:"#10B981", color:"#fff", border:"none", borderRadius:"10px", padding:"12px 24px", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
        Go Back
      </button>
    </div>
  );

  const stepTitles: Record<Step,string> = {
    1: "When are you staying?",
    2: "Tell us about yourself",
    3: "Payment details",
    4: "Confirm your booking",
  };

  return (
    <div style={{ minHeight:"100vh", background: bg, paddingBottom:"80px" }}>
      <div style={{ maxWidth:"560px", margin:"0 auto", padding:"40px 24px" }}>
        <button onClick={() => navigate(`/listings/${id}`)}
          style={{ background:"none", border:`1.5px solid ${border}`, borderRadius:"10px", padding:"10px 20px", fontWeight:600, fontSize:"14px", color: sub, cursor:"pointer", fontFamily:"inherit", marginBottom:"32px" }}>
          &larr; {listing.title}
        </button>

        <div style={{ background: card, borderRadius:"16px", padding:"20px 24px", marginBottom:"32px", border:`1px solid ${border}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <p style={{ margin:0, fontWeight:600, color: sub }}>{listing.location}</p>
            <p style={{ margin:0, fontWeight:800, fontSize:"20px", color: text }}>
              ${listing.pricePerNight}
              <span style={{ fontSize:"14px", fontWeight:400, color: sub }}>/night</span>
            </p>
          </div>
        </div>

        {/* Step progress */}
        <div style={{ display:"flex", gap:"8px", marginBottom:"32px" }}>
          {([1,2,3,4] as Step[]).map(s => (
            <div key={s} style={{ flex:1 }}>
              <div style={{ height:"4px", borderRadius:"4px", background: s<=step ? "#10B981" : border, marginBottom:"6px" }} />
              <p style={{ margin:0, fontSize:"11px", fontWeight: s===step ? 700 : 400, color: s===step ? "#10B981" : sub }}>
                {LABELS[s]}
              </p>
            </div>
          ))}
        </div>

        <h1 style={{ fontSize:"22px", fontWeight:800, color: text, marginBottom:"28px" }}>
          {stepTitles[step]}
        </h1>

        {step===1 && <StepDates defaultValues={formData} onNext={d => { setFormData(p => ({...p,...d})); setStep(2); }} />}
        {step===2 && <StepPersonal defaultValues={formData} onNext={d => { setFormData(p => ({...p,...d})); setStep(3); }} onBack={() => setStep(1)} />}
        {step===3 && <StepPayment defaultValues={formData} isPending={false} onSubmit={d => { setFormData(p => ({...p,...d})); setStep(4); }} onBack={() => setStep(2)} />}
        {step===4 && <StepConfirmation data={formData as BookingFormData} listingTitle={listing.title} pricePerNight={listing.pricePerNight} isPending={mutation.isPending} onConfirm={() => mutation.mutate(formData as BookingFormData)} onBack={() => setStep(3)} />}
      </div>
    </div>
  );
}
export default BookingPage;
