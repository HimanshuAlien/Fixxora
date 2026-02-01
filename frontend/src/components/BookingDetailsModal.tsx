import { useState } from "react";
import {
  X, Calendar, Clock, MapPin, Phone, CheckCircle2,
  Truck, Wrench, Star, MessageCircle, Package, User, Timer, Shield, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ReportIssueModal from "@/components/ReportIssueModal";

interface Booking {
  id: string; // Display ID (shortened)
  fullId: string; // Full MongoDB ObjectId for API calls
  service: string;
  category?: string;
  status: "confirmed" | "assigned" | "in-progress" | "completed" | "cancelled";
  date: string;
  time: string;
  address: string;
  technician?: {
    name: string;
    phone: string;
    rating: number;
    image: string;
  };
  price: number;
  trackingSteps: {
    label: string;
    completed: boolean;
    time?: string;
  }[];
}

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingChange?: () => void;
}

const timeSlots = [
  { id: "morning-1", label: "8:00 - 9:00 AM" },
  { id: "morning-2", label: "9:00 - 10:00 AM" },
  { id: "morning-3", label: "10:00 - 11:00 AM" },
  { id: "morning-4", label: "11:00 - 12:00 PM" },
  { id: "afternoon-1", label: "12:00 - 1:00 PM" },
  { id: "afternoon-2", label: "2:00 - 3:00 PM" },
  { id: "afternoon-3", label: "3:00 - 4:00 PM" },
  { id: "afternoon-4", label: "4:00 - 5:00 PM" },
  { id: "evening-1", label: "5:00 - 6:00 PM" },
  { id: "evening-2", label: "6:00 - 7:00 PM" },
];

const timeSlotMap: Record<string, string> = {
  "morning-1": "8:00 AM",
  "morning-2": "9:00 AM",
  "morning-3": "10:00 AM",
  "morning-4": "11:00 AM",
  "afternoon-1": "12:00 PM",
  "afternoon-2": "2:00 PM",
  "afternoon-3": "3:00 PM",
  "afternoon-4": "4:00 PM",
  "evening-1": "5:00 PM",
  "evening-2": "6:00 PM",
};

const formatTimeSlot = (timeSlotId: string): string => {
  return timeSlotMap[timeSlotId] || timeSlotId;
};

const cancelReasons = [
  "Found alternative service",
  "Changed my mind",
  "Issue with technician",
  "Scheduling conflict",
  "Other reason",
];

const BookingDetailsModal = ({ booking, isOpen, onClose, onBookingChange }: BookingDetailsModalProps) => {
  const { toast } = useToast();
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReportIssueModal, setShowReportIssueModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reschedule form state
  const [newDate, setNewDate] = useState("");
  const [newTimeSlot, setNewTimeSlot] = useState("");

  // Cancel form state
  const [cancelReason, setCancelReason] = useState("");
  const [cancelDescription, setCancelDescription] = useState("");

  if (!booking) return null;

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const handleRescheduleSubmit = async () => {
    if (!newDate || !newTimeSlot) {
      toast({
        title: "Please select both date and time",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings/${booking.fullId}/reschedule`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: newDate,
          timeSlot: newTimeSlot,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reschedule");
      }

      toast({
        title: "✅ Booking Rescheduled",
        description: `New date: ${newDate}, Time: ${newTimeSlot}`,
        className: "bg-green-50 border-green-200"
      });

      setShowRescheduleModal(false);
      setNewDate("");
      setNewTimeSlot("");
      onBookingChange?.();
      onClose();
    } catch (error) {
      toast({
        title: "Reschedule Failed",
        description: error instanceof Error ? error.message : "Unable to reschedule booking",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubmit = async () => {
    if (!cancelReason) {
      toast({
        title: "Please select a reason",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings/${booking.fullId}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: cancelReason,
          description: cancelDescription,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to cancel");
      }

      toast({
        title: "✅ Booking Cancelled",
        description: "Your booking has been cancelled successfully",
        className: "bg-green-50 border-green-200"
      });

      setShowCancelModal(false);
      setCancelReason("");
      setCancelDescription("");
      onBookingChange?.();
      onClose();
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: error instanceof Error ? error.message : "Unable to cancel booking",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-500";
      case "assigned":
        return "bg-amber-500";
      case "in-progress":
        return "bg-purple-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-muted";
    }
  };

  const getStatusLabel = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "assigned":
        return "On The Way";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Booking Details</span>
              <Badge className={`${getStatusColor(booking.status)} text-white`}>
                {getStatusLabel(booking.status)}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Service Info */}
            <div className="bg-muted/50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {booking.service}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Booking ID: {booking.id}
              </p>
              <p className="text-2xl font-bold text-primary">
                ₹{booking.price}
              </p>
            </div>

            {/* Date, Time, Address */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-foreground">{booking.date}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-foreground">{formatTimeSlot(booking.time)}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span className="text-foreground">{booking.address}</span>
              </div>
            </div>

            {/* Tracking Steps */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">
                Live Tracking
              </h4>

              <div className="space-y-1">
                {booking.trackingSteps.map((step, index) => (
                  <div key={step.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed
                          ? "bg-green-500 text-white"
                          : index === booking.trackingSteps.findIndex(s => !s.completed)
                            ? "bg-primary text-primary-foreground animate-pulse"
                            : "bg-muted text-muted-foreground"
                          }`}
                      >
                        {step.completed ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : index === 0 ? (
                          <Package className="w-4 h-4" />
                        ) : index === 1 ? (
                          <User className="w-4 h-4" />
                        ) : index === 2 ? (
                          <Truck className="w-4 h-4" />
                        ) : index === 3 ? (
                          <Wrench className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </div>

                      {index < booking.trackingSteps.length - 1 && (
                        <div
                          className={`w-0.5 h-10 ${step.completed ? "bg-green-500" : "bg-muted"
                            }`}
                        />
                      )}
                    </div>

                    <div className="pt-1">
                      <p
                        className={`font-medium ${step.completed
                          ? "text-foreground"
                          : "text-muted-foreground"
                          }`}
                      >
                        {step.label}
                      </p>

                      {step.time && (
                        <p className="text-xs text-muted-foreground">
                          {step.time}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technician Card */}
            {booking.technician && (
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Your Technician
                </p>

                <div className="flex items-center gap-3">
                  <img
                    src={booking.technician.image}
                    alt={booking.technician.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-primary"
                  />

                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {booking.technician.name}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{booking.technician.rating} Rating</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="flex-1 gap-2">
                    <Phone className="w-4 h-4" />
                    Call Now
                  </Button>

                  <Button size="sm" variant="outline" className="flex-1 gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Timer className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">
                  Estimated arrival in 15 mins
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">
                  30-day service warranty
                </span>
              </div>
            </div>

            {/* Actions */}
            {booking.status !== "completed" && booking.status !== "cancelled" && (
              <div className="pt-4 border-t border-border space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowRescheduleModal(true)}
                  disabled={isLoading}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Reschedule Booking
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive hover:bg-red-50"
                  onClick={() => setShowCancelModal(true)}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Booking
                </Button>
              </div>
            )}

            {/* Report Issue Button */}
            <Button
              variant="outline"
              className="w-full text-amber-600 border-amber-200 hover:bg-amber-50 mt-2"
              onClick={() => setShowReportIssueModal(true)}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report an Issue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal */}
      <Dialog open={showRescheduleModal} onOpenChange={setShowRescheduleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Reschedule Booking
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Booking Info */}
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground mb-1">Current Schedule</p>
              <p className="font-semibold text-foreground">
                {booking.date} at {formatTimeSlot(booking.time)}
              </p>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="new-date">Select New Date *</Label>
              <Input
                id="new-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={today}
                max={maxDateStr}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                You can reschedule up to 30 days in advance
              </p>
            </div>

            {/* Time Slot Selection */}
            <div className="space-y-2">
              <Label>Select New Time Slot *</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setNewTimeSlot(slot.id)}
                    className={`p-2 rounded-lg border-2 transition-all text-sm font-medium ${newTimeSlot === slot.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground hover:border-primary/50"
                      }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowRescheduleModal(false);
                setNewDate("");
                setNewTimeSlot("");
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRescheduleSubmit}
              disabled={isLoading || !newDate || !newTimeSlot}
            >
              {isLoading ? "Rescheduling..." : "Confirm Reschedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <X className="w-5 h-5" />
              Cancel Booking
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">
                This action cannot be undone. You can reschedule instead if needed.
              </p>
            </div>

            {/* Booking Info */}
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground mb-1">{booking.service}</p>
              <p className="font-semibold text-foreground">
                {booking.date} at {formatTimeSlot(booking.time)}
              </p>
            </div>

            {/* Cancel Reason */}
            <div className="space-y-2">
              <Label>Reason for Cancellation *</Label>
              <RadioGroup value={cancelReason} onValueChange={setCancelReason}>
                {cancelReasons.map((reason) => (
                  <div key={reason} className="flex items-center space-x-2">
                    <RadioGroupItem value={reason} id={reason} />
                    <Label htmlFor={reason} className="cursor-pointer font-normal">
                      {reason}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Additional Details */}
            {cancelReason === "Other reason" && (
              <div className="space-y-2">
                <Label htmlFor="cancel-desc">Please explain (optional)</Label>
                <Textarea
                  id="cancel-desc"
                  placeholder="Tell us why you're cancelling..."
                  value={cancelDescription}
                  onChange={(e) => setCancelDescription(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelModal(false);
                setCancelReason("");
                setCancelDescription("");
              }}
              disabled={isLoading}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubmit}
              disabled={isLoading || !cancelReason}
            >
              {isLoading ? "Cancelling..." : "Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Issue Modal */}
      <ReportIssueModal
        isOpen={showReportIssueModal}
        onClose={() => setShowReportIssueModal(false)}
        bookingId={booking.fullId}
        bookingService={booking.service}
      />
    </>
  );
};

export default BookingDetailsModal;
