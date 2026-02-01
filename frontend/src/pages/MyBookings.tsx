import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, MapPin, Phone, CheckCircle2,
  Star, MessageCircle, ChevronRight,
  Package, Filter, Search, AlertTriangle, Headphones, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingDetailsModal from "@/components/BookingDetailsModal";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

// Time slot mapping for display
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

interface Booking {
  id: string;
  fullId: string;
  service: string;
  category: string;
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
  userRating?: number;
}

const MyBookings = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  // Report/Support modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportBooking, setReportBooking] = useState<Booking | null>(null);
  const [reportType, setReportType] = useState<"support" | "issue">("support");
  const [reportDescription, setReportDescription] = useState("");

  // Filter modal state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });

  // Function to fetch bookings (can be called from modal)
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await res.json();

      const mapped: Booking[] = data.map((b: any) => ({
        id: b._id?.slice(-8).toUpperCase() || "N/A",
        fullId: b._id?.toString() || "",
        service: b.service?.name || "Service",
        category: b.service?.category || "Service",
        status: b.status,

        date: b.schedule?.date || "N/A",
        time: b.schedule?.timeSlot || "N/A",
        address: `${b.address?.address || ""}, ${b.address?.pincode || ""}`.trim() || "N/A",
        price: b.service?.price || 0,
        technician: b.mechanic
          ? {
            name: b.mechanic.name || "Technician",
            phone: b.mechanic.phone || "N/A",
            rating: b.mechanic.rating?.average ?? 0,
            image:
              b.mechanic.image ||
              `https://ui-avatars.com/api/?name=${b.mechanic.name}&size=100&background=3b82f6&color=fff`,
          }
          : undefined,
        trackingSteps: [
          { label: "Booking Placed", completed: true },
          { label: "Technician Assigned", completed: b.status !== "pending" },
          { label: "Work In Progress", completed: b.status === "in-progress" || b.status === "completed" },
          { label: "Completed", completed: b.status === "completed" },
        ],

        userRating: b.userRating,
      }));

      setBookings(mapped);

    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Failed to load bookings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookings on mount
  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed": return "bg-blue-500";
      case "assigned": return "bg-amber-500";
      case "in-progress": return "bg-purple-500";
      case "completed": return "bg-green-500";
      case "cancelled": return "bg-red-500";

    }
  };

  const getStatusLabel = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed": return "Pending";
      case "assigned": return "Technician Assigned";
      case "in-progress": return "Work In Progress";
      case "completed": return "Completed";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };


  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleOpenRating = (booking: Booking) => {
    setRatingBooking(booking);
    setSelectedRating(booking.userRating || 0);
    setHoverRating(0);
    setReviewText("");
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    if (selectedRating === 0) {
      toast({
        title: "Please select a rating",
        description: "Tap on the stars to rate your experience",
        variant: "destructive"
      });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings/${ratingBooking?.fullId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: selectedRating,
          review: reviewText,
        }),
      });
      toast({
        title: "Thank you for your feedback!",
        description: `You rated this service ${selectedRating} stars`,
      });
      // Update the local bookings state so the UI reflects the rating immediately
      setBookings((prev) =>
        prev.map((b) =>
          b.fullId === ratingBooking?.fullId
            ? { ...b, userRating: selectedRating }
            : b
        )
      );
      setShowRatingModal(false);
      setSelectedRating(0);
      setReviewText("");
    } catch {
      toast({
        title: "Failed to submit rating",
        variant: "destructive",
      });
    }
  };

  const handleOpenReport = (booking: Booking, type: "support" | "issue") => {
    setReportBooking(booking);
    setReportType(type);
    setReportDescription("");
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!reportDescription.trim()) {
      toast({
        title: "Please describe your issue",
        description: "Tell us what went wrong so we can help you",
        variant: "destructive"
      });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/issues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: reportBooking?.fullId,
          issueType: reportType === "issue" ? "quality" : "other",
          title: `${reportType === "issue" ? "Issue" : "Support Request"} - ${reportBooking?.service}`,
          description: reportDescription,
          severity: "medium",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      const data = await response.json();

      toast({
        title: reportType === "issue" ? "Issue Reported" : "Support Request Sent",
        description: reportType === "issue"
          ? `Ticket ID: ${data.ticket.ticketId}. Our team will investigate and get back to you soon`
          : "Our support team will contact you shortly"
      });
      setShowReportModal(false);
      setReportDescription("");
      setReportType("support");
    } catch (error) {
      toast({
        title: "Failed to submit report",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    }
  };

  const upcomingBookings = bookings.filter(b => b.status !== "completed" && b.status !== "cancelled");
  const pastBookings = bookings.filter(b => b.status === "completed" || b.status === "cancelled");

  const filteredBookings = (activeTab === "upcoming" ? upcomingBookings : pastBookings)
    .filter(b =>
      b.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(b => {
      // Apply status filter
      if (selectedStatus.length > 0) {
        return selectedStatus.includes(b.status);
      }
      return true;
    })
    .filter(b => {
      // Apply price range filter
      return b.price >= priceRange.min && b.price <= priceRange.max;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100/80 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Enhanced Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-blue-100/80 to-cyan-50" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/25 via-transparent to-transparent" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
      <div className="fixed top-20 left-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10">
        <Navbar />

        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                My Bookings
              </h1>
              <p className="text-muted-foreground">
                Track and manage all your service bookings
              </p>
            </motion.div>

            {/* Search and Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col sm:flex-row gap-4 mb-6"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by booking ID or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button
                variant="outline"
                className="h-12 gap-2"
                onClick={() => setShowFilterModal(true)}
              >
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-2 mb-8 p-1 bg-card/80 backdrop-blur-sm rounded-xl w-fit shadow-sm"
            >
              {[
                { id: "upcoming" as const, label: "Upcoming", count: upcomingBookings.length },
                { id: "past" as const, label: "Past", count: pastBookings.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {tab.label}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted-foreground/20"
                    }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </motion.div>

            {/* Bookings List */}
            <div className="max-w-4xl">
              <AnimatePresence mode="wait">
                {filteredBookings.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16 bg-card/80 backdrop-blur-sm rounded-2xl shadow-sm"
                  >
                    <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No bookings found</h3>
                    <p className="text-muted-foreground mb-6">
                      {activeTab === "upcoming"
                        ? "You don't have any upcoming bookings"
                        : "You don't have any past bookings"}
                    </p>
                    <Link to="/services">
                      <Button variant="hero">Book a Service</Button>
                    </Link>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-border/50"
                      >
                        {/* Rest of your exact UI remains 100% same */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-foreground">{booking.service}</h3>
                              <Badge className={`${getStatusColor(booking.status)} text-white text-xs`}>
                                {getStatusLabel(booking.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Booking ID: {booking.id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">₹{booking.price}</p>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{booking.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{formatTimeSlot(booking.time)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span className="truncate">{booking.address}</span>
                          </div>
                        </div>

                        {booking.technician && booking.status !== "completed" && (
                          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={booking.technician.image}
                                alt={booking.technician.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-medium text-foreground">{booking.technician.name}</p>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span>{booking.technician.rating}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="gap-1">
                                <Phone className="w-3 h-3" />
                                Call
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1">
                                <MessageCircle className="w-3 h-3" />
                                Chat
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Completed Booking Actions */}
                        {booking.status === "completed" && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button
                                size="sm"
                                className="gap-2 bg-amber-500 hover:bg-amber-600 flex-1"
                                onClick={() => handleOpenRating(booking)}
                                disabled={!!booking.userRating}
                              >
                                <Star className="w-4 h-4" />
                                {booking.userRating ? "Rated" : "Rate Service"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 flex-1"
                                onClick={() => handleOpenReport(booking, "support")}
                              >
                                <Headphones className="w-4 h-4" />
                                Contact Support
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 border-destructive text-destructive hover:bg-destructive/10 flex-1"
                                onClick={() => handleOpenReport(booking, "issue")}
                              >
                                <AlertTriangle className="w-4 h-4" />
                                Report Issue
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Active Booking Support */}
                        {booking.status !== "completed" && booking.status !== "cancelled" && (
                          <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1 text-muted-foreground hover:text-foreground"
                              onClick={() => handleOpenReport(booking, "support")}
                            >
                              <Headphones className="w-4 h-4" />
                              Need Help?
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1 text-destructive hover:text-destructive"
                              onClick={() => handleOpenReport(booking, "issue")}
                            >
                              <AlertTriangle className="w-4 h-4" />
                              Report Issue
                            </Button>
                          </div>
                        )}

                        <div className="mt-4 flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-primary"
                            onClick={() => handleViewDetails(booking)}
                          >
                            View Details <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* All your modals remain EXACTLY the same */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookingChange={fetchBookings}
      />

      {/* Rating Modal - 100% same */}
      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Rate Your Experience
            </DialogTitle>
          </DialogHeader>

          {ratingBooking && (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="font-medium text-foreground">{ratingBooking.service}</p>
                <p className="text-sm text-muted-foreground">
                  {ratingBooking.date} • {ratingBooking.technician?.name}
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">Tap to rate</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${star <= (hoverRating || selectedRating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                          }`}
                      />
                    </button>
                  ))}
                </div>
                {selectedRating > 0 && (
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {selectedRating === 5 ? "Excellent!" :
                      selectedRating === 4 ? "Great!" :
                        selectedRating === 3 ? "Good" :
                          selectedRating === 2 ? "Fair" : "Poor"}
                  </p>
                )}
              </div>

              <div>
                <Label>Write a review (optional)</Label>
                <Textarea
                  placeholder="Tell us about your experience..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRating} className="bg-amber-500 hover:bg-amber-600">
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report/Support Modal - 100% same */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reportType === "issue" ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Report an Issue
                </>
              ) : (
                <>
                  <Headphones className="w-5 h-5 text-primary" />
                  Contact Support
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {reportBooking && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="font-medium text-foreground">{reportBooking.service}</p>
                <p className="text-sm text-muted-foreground">Booking ID: {reportBooking.id}</p>
              </div>

              {reportType === "issue" && (
                <div className="bg-destructive/10 rounded-lg p-3">
                  <p className="text-sm text-destructive">
                    Your issue will be sent to our admin team for immediate review.
                    We take all complaints seriously.
                  </p>
                </div>
              )}

              <div>
                <Label>
                  {reportType === "issue" ? "Describe the issue" : "How can we help?"}
                </Label>
                <Textarea
                  placeholder={reportType === "issue"
                    ? "Tell us what went wrong..."
                    : "Describe your query or concern..."
                  }
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-foreground">Prefer to call?</p>
                  <p className="text-xs text-muted-foreground">24/7 support available</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1">
                  <Phone className="w-4 h-4" />
                  1800-XXX-XXXX
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReport}
              className={reportType === "issue" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {reportType === "issue" ? "Submit Report" : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Modal */}
      <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Filter Bookings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status Filter */}
            <div className="space-y-3">
              <Label className="font-semibold">Status</Label>
              <div className="space-y-2">
                {["confirmed", "assigned", "in-progress", "completed", "cancelled"].map((status) => (
                  <label key={status} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStatus.includes(status)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStatus([...selectedStatus, status]);
                        } else {
                          setSelectedStatus(selectedStatus.filter(s => s !== status));
                        }
                      }}
                      className="w-4 h-4 rounded border-input"
                    />
                    <span className="text-sm capitalize">{status.replace("-", " ")}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3">
              <Label className="font-semibold">Price Range</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                    className="flex-1 h-9"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    className="flex-1 h-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  ₹{priceRange.min} - ₹{priceRange.max}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowFilterModal(false);
                setSelectedStatus([]);
                setPriceRange({ min: 0, max: 10000 });
              }}
            >
              Reset
            </Button>
            <Button onClick={() => setShowFilterModal(false)}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyBookings;
