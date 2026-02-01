import { useState, useEffect, useRef } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Phone, Calendar, Clock, CreditCard, Wallet, Smartphone, Check, ChevronRight, Shield, Star, User, Home, Building2, Navigation, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isLoggedIn } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import L from "leaflet";







interface ServiceDetails {
  name: string;
  price: number;
  originalPrice: number;
  duration: string;
  image: string;
  rating: number;
  reviews: number;
  includes: string[];
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceDetails;
}

const timeSlots = [
  { id: "morning-1", time: "8:00 AM", label: "8:00 - 9:00 AM" },
  { id: "morning-2", time: "9:00 AM", label: "9:00 - 10:00 AM" },
  { id: "morning-3", time: "10:00 AM", label: "10:00 - 11:00 AM" },
  { id: "morning-4", time: "11:00 AM", label: "11:00 - 12:00 PM" },
  { id: "afternoon-1", time: "12:00 PM", label: "12:00 - 1:00 PM" },
  { id: "afternoon-2", time: "2:00 PM", label: "2:00 - 3:00 PM" },
  { id: "afternoon-3", time: "3:00 PM", label: "3:00 - 4:00 PM" },
  { id: "afternoon-4", time: "4:00 PM", label: "4:00 - 5:00 PM" },
  { id: "evening-1", time: "5:00 PM", label: "5:00 - 6:00 PM" },
  { id: "evening-2", time: "6:00 PM", label: "6:00 - 7:00 PM" },
];

const paymentMethods = [
  { id: "card", name: "Credit/Debit Card", icon: CreditCard, description: "Visa, Mastercard, RuPay" },
  { id: "upi", name: "UPI", icon: Smartphone, description: "GPay, PhonePe, Paytm" },
  { id: "wallet", name: "Wallet", icon: Wallet, description: "Paytm, Amazon Pay" },
  { id: "cod", name: "Pay on Service", icon: Wallet, description: "Cash after completion" },
];

const BookingModal = ({ isOpen, onClose, service }: BookingModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    landmark: "",
    pincode: "",
    addressType: "home",
    selectedDate: "",
    selectedSlot: "",
    paymentMethod: "upi",
    instructions: "",
  });

  // Restore booking draft if user returns after login
  useEffect(() => {
    if (isOpen) {
      const bookingDraft = localStorage.getItem("bookingDraft");
      if (bookingDraft) {
        try {
          const draft = JSON.parse(bookingDraft);
          setFormData(draft.formData);
          setStep(draft.step);
          localStorage.removeItem("bookingDraft");
        } catch (err) {
          console.error("Failed to restore booking draft", err);
        }
      }
    }
  }, [isOpen]);

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      date: date.toISOString().split("T")[0],
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      isToday: i === 0,
    };
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUseCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation not supported");
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lng: longitude });

          // Initialize or update map
          if (mapRef.current && !mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView([latitude, longitude], 13);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: "© OpenStreetMap contributors",
              maxZoom: 19,
            }).addTo(mapInstanceRef.current);
          } else if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 13);
          }

          // Add or update marker
          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          } else {
            markerRef.current = L.marker([latitude, longitude]).addTo(mapInstanceRef.current!);
          }

          // Reverse geocode using Nominatim (OpenStreetMap free service)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            const addr = data.address || {};

            // Build complete address with better component extraction
            const addressParts = {
              address: [
                addr.house_number,
                addr.road || addr.street || addr.path,
                addr.residential,
                addr.neighbourhood
              ].filter(Boolean).join(", ") ||
                [addr.village, addr.town, addr.city].filter(Boolean).join(", ") ||
                data.display_name?.split(",").slice(0, 3).join(",").trim() ||
                "Current Location",

              // Priority: neighbourhood > locality > suburb > village (skip administrative names like corporation/municipality)
              landmark:
                addr.neighbourhood ||
                addr.locality ||
                addr.suburb ||
                addr.village ||
                addr.town ||
                "Area",

              pincode: addr.postcode || addr.postal_code || "",
            };

            setFormData((prev) => ({
              ...prev,
              address: addressParts.address,
              landmark: addressParts.landmark,
              pincode: addressParts.pincode,
            }));

            toast({
              title: "Location Loaded ✓",
              description: "Address fields have been auto-filled",
              className: "bg-green-50 border-green-200"
            });
          } catch (err) {
            console.error("Geocoding error:", err);
            setFormData((prev) => ({
              ...prev,
              address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
            }));
            toast({
              title: "Location Captured",
              description: "Please verify and complete the address manually",
              className: "bg-blue-50 border-blue-200"
            });
          }
        },
        () => {
          toast({
            title: "Location Access Denied",
            description: "Please enable location permissions in your browser",
            variant: "destructive"
          });
        }
      );
    } catch (err) {
      toast({
        title: "Error",
        description: "Unable to get your location. Please enter manually.",
        variant: "destructive"
      });
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };
  const handleSubmit = async () => {
    if (!isLoggedIn()) {
      localStorage.setItem(
        "bookingDraft",
        JSON.stringify({
          service,
          formData,
          step,
        })
      );

      navigate("/login", {
        replace: true,
        state: { from: "booking" },
      });

      return;
    }


    // ✅ Logged in → create booking
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          service: {
            name: service.name,
            price: service.price,
            originalPrice: service.originalPrice,
            duration: service.duration,
          },
          schedule: {
            date: formData.selectedDate,
            timeSlot: formData.selectedSlot,
          },
          address: {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            landmark: formData.landmark,
            pincode: formData.pincode,
            addressType: formData.addressType,
          },
          paymentMethod: formData.paymentMethod,
          instructions: formData.instructions,
        }),
      });

      if (!res.ok) throw new Error("Booking failed");

      localStorage.removeItem("bookingDraft");

      toast({
        title: "Booking Confirmed! ✓",
        description: "Your booking has been successfully confirmed. Check your bookings for details.",
        className: "bg-green-50 border-green-200"
      });
      onClose();
      setStep(1);

    } catch (err) {
      toast({
        title: "Booking Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };




  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name && formData.phone && formData.address && formData.pincode;
      case 2:
        return formData.selectedDate && formData.selectedSlot;
      case 3:
        return formData.paymentMethod;
      default:
        return true;
    }
  };

  const serviceFee = 49;
  const discount = service.originalPrice - service.price;
  const total = service.price + serviceFee;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-primary p-4 md:p-6 text-primary-foreground">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Service Info - Responsive */}
              <div className="flex items-center gap-3 md:gap-4 pr-10">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-base md:text-xl font-bold truncate">{service.name}</h2>
                  <div className="flex items-center gap-2 md:gap-3 mt-0.5 md:mt-1 text-primary-foreground/80 text-xs md:text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                      {service.rating}
                    </span>
                    <span>•</span>
                    <span>{service.duration}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg md:text-2xl font-bold">₹{service.price}</div>
                  <div className="text-xs md:text-sm text-primary-foreground/60 line-through">₹{service.originalPrice}</div>
                </div>
              </div>

              {/* Progress Steps - Mobile Optimized */}
              <div className="flex items-center justify-between mt-4 md:mt-6">
                {[
                  { num: 1, label: "Address", shortLabel: "1" },
                  { num: 2, label: "Time", shortLabel: "2" },
                  { num: 3, label: "Payment", shortLabel: "3" },
                  { num: 4, label: "Confirm", shortLabel: "4" },
                ].map((s, i) => (
                  <div key={s.num} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-colors ${step >= s.num
                          ? "bg-white text-primary"
                          : "bg-primary-foreground/20 text-primary-foreground/60"
                          }`}
                      >
                        {step > s.num ? <Check className="w-3 h-3 md:w-4 md:h-4" /> : s.num}
                      </div>
                      <span className="text-[10px] md:text-xs mt-1 text-primary-foreground/80 hidden sm:block">{s.label}</span>
                    </div>
                    {i < 3 && (
                      <div
                        className={`flex-1 h-0.5 mx-1 md:mx-2 min-w-[20px] md:min-w-[40px] ${step > s.num ? "bg-white" : "bg-primary-foreground/20"
                          }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <AnimatePresence mode="wait">
                {/* Step 1: Address */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Service Location
                      </h3>

                      {/* Map Container */}
                      <div className="relative rounded-xl overflow-hidden mb-4 bg-muted border border-border">
                        <div
                          ref={mapRef}
                          className="h-40 bg-gradient-to-br from-blue-100 to-blue-50 w-full"
                          id="map"
                        />
                        <button
                          onClick={handleUseCurrentLocation}
                          disabled={loadingLocation}
                          className="absolute bottom-3 right-3 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg flex items-center gap-1 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingLocation ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-4" />
                              Use Current Location
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                          <div className="relative mt-1">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Enter your name"
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                          <div className="relative mt-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="+91 98765 43210"
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Label htmlFor="address" className="text-sm font-medium">Complete Address *</Label>
                        <Textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="House/Flat No., Building, Street, Area"
                          className="mt-1 min-h-[80px]"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label htmlFor="landmark" className="text-sm font-medium">Landmark (Optional)</Label>
                          <Input
                            id="landmark"
                            name="landmark"
                            value={formData.landmark}
                            onChange={handleInputChange}
                            placeholder="Near metro station, mall, etc."
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="pincode" className="text-sm font-medium">Pincode *</Label>
                          <Input
                            id="pincode"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            placeholder="Enter 6-digit pincode"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <Label className="text-sm font-medium">Address Type</Label>
                        <div className="flex gap-3 mt-2">
                          {[
                            { id: "home", label: "Home", icon: Home },
                            { id: "office", label: "Office", icon: Building2 },
                          ].map((type) => (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, addressType: type.id })}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${formData.addressType === type.id
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/50"
                                }`}
                            >
                              <type.icon className="w-4 h-4" />
                              {type.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Time Slot */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Select Date
                      </h3>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {dates.map((d) => (
                          <button
                            key={d.date}
                            onClick={() => setFormData({ ...formData, selectedDate: d.date })}
                            className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl border-2 min-w-[70px] transition-all ${formData.selectedDate === d.date
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/50"
                              }`}
                          >
                            <span className="text-xs font-medium">{d.isToday ? "Today" : d.day}</span>
                            <span className="text-2xl font-bold mt-1">{d.dayNum}</span>
                            <span className="text-xs">{d.month}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Select Time Slot
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setFormData({ ...formData, selectedSlot: slot.id })}
                            className={`p-3 rounded-xl border-2 text-center transition-all ${formData.selectedSlot === slot.id
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/50"
                              }`}
                          >
                            <span className="text-sm font-medium">{slot.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="instructions" className="text-sm font-medium">Special Instructions (Optional)</Label>
                      <Textarea
                        id="instructions"
                        name="instructions"
                        value={formData.instructions}
                        onChange={handleInputChange}
                        placeholder="Any specific requirements or instructions for the technician..."
                        className="mt-1"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Payment Method
                      </h3>

                      <RadioGroup
                        value={formData.paymentMethod}
                        onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                        className="space-y-3"
                      >
                        {paymentMethods.map((method) => (
                          <div
                            key={method.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === method.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                              }`}
                            onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                          >
                            <RadioGroupItem value={method.id} id={method.id} />
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <method.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <Label htmlFor={method.id} className="font-medium cursor-pointer">
                                {method.name}
                              </Label>
                              <p className="text-sm text-muted-foreground">{method.description}</p>
                            </div>
                            {method.id === "upi" && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                Recommended
                              </span>
                            )}
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Promo Code */}
                    <div>
                      <Label className="text-sm font-medium">Have a promo code?</Label>
                      <div className="flex gap-2 mt-2">
                        <Input placeholder="Enter promo code" className="flex-1" />
                        <Button variant="outline">Apply</Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Confirmation */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      Booking Summary
                    </h3>

                    {/* Service Summary */}
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex gap-4">
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">{service.duration}</p>
                          <div className="mt-2">
                            {service.includes.slice(0, 3).map((item, i) => (
                              <span key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-500" />
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4" />
                          Service Address
                        </div>
                        <p className="font-medium text-foreground">{formData.name}</p>
                        <p className="text-sm text-muted-foreground">{formData.address}</p>
                        <p className="text-sm text-muted-foreground">{formData.landmark && `Near ${formData.landmark}, `}PIN: {formData.pincode}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" />
                          {formData.phone}
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Calendar className="w-4 h-4" />
                          Scheduled Date & Time
                        </div>
                        <p className="font-medium text-foreground">
                          {new Date(formData.selectedDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {timeSlots.find((s) => s.id === formData.selectedSlot)?.label}
                        </p>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-muted/50 rounded-xl p-4">
                      <h4 className="font-semibold text-foreground mb-3">Price Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Service Price</span>
                          <span className="text-foreground">₹{service.originalPrice}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount</span>
                          <span>-₹{discount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Convenience Fee</span>
                          <span className="text-foreground">₹{serviceFee}</span>
                        </div>
                        <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold">
                          <span>Total Amount</span>
                          <span className="text-primary">₹{total}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">Payment via:</span>
                      <span className="font-medium text-foreground">
                        {paymentMethods.find((m) => m.id === formData.paymentMethod)?.name}
                      </span>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-green-500" />
                        100% Secure Payment
                      </span>
                      <span className="flex items-center gap-1">
                        <Check className="w-4 h-4 text-green-500" />
                        30-Day Warranty
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Verified Professionals
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-border p-4 flex items-center justify-between bg-muted/30">
              <div>
                {step > 1 && (
                  <Button variant="ghost" onClick={handleBack}>
                    Back
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-bold text-primary">₹{total}</p>
                </div>
                {step < 4 ? (
                  <Button onClick={handleNext} disabled={!isStepValid()} className="px-8">
                    Continue
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} className="px-8 bg-green-600 hover:bg-green-700">
                    <Check className="w-4 h-4 mr-2" />
                    Confirm Booking
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
