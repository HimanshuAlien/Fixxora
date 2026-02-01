import { motion } from "framer-motion";
import { ChevronDown, Check, Star, Clock, Users, Smartphone, Shield, Camera, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg-new.png";
import applianceAc from "@/assets/appliance-ac.jpg";
import applianceFridge from "@/assets/appliance-fridge.jpg";
import applianceWashing from "@/assets/appliance-washing.jpg";
import applianceTv from "@/assets/appliance-tv.jpg";
import phoneMockup from "@/assets/phone-mockup.png";

const Hero = () => {
  const navigate = useNavigate();
  const [selectedAppliance, setSelectedAppliance] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showApplianceDropdown, setShowApplianceDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const appliances = [
    { name: "AC", icon: "❄️" },
    { name: "Washing Machine", icon: "🌀" },
    { name: "Refrigerator", icon: "🧊" },
    { name: "TV", icon: "📺" },
    { name: "Microwave", icon: "🔥" },
    { name: "Geyser", icon: "💧" },
  ];

  const locations = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata"];

  const services = [
    {
      name: "AC Servicing",
      desc: "Full Clean",
      image: applianceAc,
      rating: 4.9,
      reviews: "12.5k",
      duration: "45 min"
    },
    {
      name: "Washing Machine",
      desc: "Repair",
      image: applianceWashing,
      rating: 4.8,
      reviews: "8.2k",
      duration: "60 min"
    },
    {
      name: "Refrigerator Repair",
      desc: "Repair",
      image: applianceFridge,
      rating: 4.9,
      reviews: "6.8k",
      duration: "50 min"
    },
    {
      name: "TV Repair",
      desc: "Onwards",
      image: applianceTv,
      rating: 4.7,
      reviews: "4.5k",
      duration: "45 min"
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with background image */}
      <section className="relative overflow-visible min-h-[85vh]">
        {/* More Visible Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-blue-100 to-cyan-100" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/25 via-primary/12 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary/18 rounded-full blur-3xl" />

        {/* Background Image with more visible overlay */}
        <div className="absolute inset-0 h-full">
          <img
            src={heroBg}
            alt="Modern living room with appliances"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100/85 via-blue-50/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-100/60 via-transparent to-primary/5" />
        </div>

        <div className="container mx-auto px-4 pt-28 md:pt-36 pb-12 relative z-10">
          <div className="max-w-xl">
            {/* Main Heading - Restored italic style */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight"
            >
              <span className="text-foreground italic">Trust.</span>{" "}
              <span className="text-foreground italic">Proof.</span>
              <br />
              <span className="text-gradient italic">Fixed Pricing.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-lg md:text-xl text-muted-foreground mt-4 md:mt-6 font-medium"
            >
              India's first appliance truth platform.
            </motion.p>

            {/* Booking Form - Improved spacing for mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 md:mt-10 space-y-4 md:space-y-5 max-w-md"
            >
              {/* Appliance Dropdown */}
              <div className="relative z-40">
                <button
                  onClick={() => {
                    setShowApplianceDropdown(!showApplianceDropdown);
                    setShowLocationDropdown(false);
                  }}
                  className="w-full flex items-center justify-between px-5 py-4 md:py-5 bg-background rounded-xl shadow-lg border-2 border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {selectedAppliance && (
                      <span className="text-xl">
                        {appliances.find(a => a.name === selectedAppliance)?.icon}
                      </span>
                    )}
                    <span className={`font-medium ${selectedAppliance ? "text-foreground" : "text-muted-foreground"}`}>
                      {selectedAppliance || "Select Appliance"}
                    </span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showApplianceDropdown ? "rotate-180" : ""}`} />
                </button>
                {showApplianceDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-background rounded-xl shadow-2xl border border-border z-50 overflow-visible"
                  >
                    <div className="max-h-60 overflow-y-auto">
                      {appliances.map((appliance) => (
                        <button
                          key={appliance.name}
                          onClick={() => {
                            setSelectedAppliance(appliance.name);
                            setShowApplianceDropdown(false);
                          }}
                          className={`w-full px-5 py-3.5 text-left flex items-center gap-3 hover:bg-accent transition-colors ${selectedAppliance === appliance.name ? "bg-primary/10 text-primary" : "text-foreground"
                            }`}
                        >
                          <span className="text-xl">{appliance.icon}</span>
                          <span className="font-medium">{appliance.name}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Location Dropdown */}
              <div className="relative z-30">
                <button
                  onClick={() => {
                    setShowLocationDropdown(!showLocationDropdown);
                    setShowApplianceDropdown(false);
                  }}
                  className="w-full flex items-center justify-between px-5 py-4 md:py-5 bg-background rounded-xl shadow-lg border-2 border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {selectedLocation && <span className="text-xl">📍</span>}
                    <span className={`font-medium ${selectedLocation ? "text-foreground" : "text-muted-foreground"}`}>
                      {selectedLocation || "Choose Location"}
                    </span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showLocationDropdown ? "rotate-180" : ""}`} />
                </button>
                {showLocationDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-background rounded-xl shadow-2xl border border-border z-50 overflow-visible"
                  >
                    <div className="max-h-60 overflow-y-auto">
                      {locations.map((location) => (
                        <button
                          key={location}
                          onClick={() => {
                            setSelectedLocation(location);
                            setShowLocationDropdown(false);
                          }}
                          className={`w-full px-5 py-3.5 text-left flex items-center gap-3 hover:bg-accent transition-colors ${selectedLocation === location ? "bg-primary/10 text-primary" : "text-foreground"
                            }`}
                        >
                          <span className="text-lg">📍</span>
                          <span className="font-medium">{location}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Book Button - redirects to login with more spacing */}
              <div className="pt-2">
                <Button
                  onClick={() => {
                    const token = localStorage.getItem("token");
                    if (!token) {
                      navigate("/login", { replace: true });
                    } else {
                      navigate("/services", { replace: true });
                    }
                  }}
                  className="w-full h-12 md:h-14 text-sm md:text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Check className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Book Verified Technician
                </Button>
              </div>

              {/* Micro trust cue */}
              <div className="flex items-center justify-center gap-4 text-xs md:text-sm text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-success" />
                  No hidden charges
                </span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-primary" />
                  Photo proof mandatory
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Select Your Appliance Section - with richer gradient */}
      <section className="py-16 md:py-20 relative z-10">
        {/* Richer section gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-blue-100 to-cyan-100" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-accent/15 via-transparent to-transparent" />
        <div className="absolute top-10 right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-accent/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 italic">
              Select Your Appliance
            </h2>
            <p className="text-muted-foreground text-lg">
              Professional repair services at your doorstep
            </p>
          </motion.div>

          {/* Grid with gaps for separate module look */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative aspect-square overflow-hidden cursor-pointer rounded-2xl shadow-lg"
                onClick={() => {
                  const token = localStorage.getItem("token");
                  if (!token) {
                    navigate("/login", { replace: true });
                  } else {
                    navigate("/services", { replace: true });
                  }
                }}
              >
                {/* Full Image */}
                <div className="block w-full h-full">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
                  />
                  {/* Dark overlay - always visible at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/95 via-foreground/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Content container - positioned at bottom */}
                  <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                    {/* Rating Badge - shows on hover */}
                    <div className="absolute top-3 right-3 bg-background/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-semibold text-foreground">{service.rating}</span>
                    </div>

                    {/* Title - starts at bottom, moves up on hover */}
                    <h3 className="font-bold text-background text-base md:text-lg mb-0 group-hover:mb-2 transform translate-y-0 group-hover:-translate-y-1 transition-all duration-300">
                      {service.name}
                    </h3>

                    {/* Details - hidden by default, slides up on hover */}
                    <div className="max-h-0 overflow-hidden opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-300 ease-out">
                      <div className="flex items-center gap-2 text-[10px] md:text-xs text-background/80 mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {service.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {service.reviews}
                        </span>
                      </div>
                      <span className="inline-block px-2.5 py-1 md:px-3 md:py-1.5 bg-background text-foreground text-xs md:text-sm font-semibold rounded-lg">
                        Book Now
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Download Section - Compact Modern Design */}
      <section className="py-12 md:py-16 relative overflow-hidden">
        {/* Section background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full mb-4">
              <Smartphone className="w-4 h-4 text-white" />
              <span className="text-white/90 text-xs font-medium">COMING SOON</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Get the <span className="text-accent">TrustAC</span> App
            </h3>

            <p className="text-white/70 text-sm md:text-base mb-6 max-w-md mx-auto">
              Book instantly, track live & get exclusive app-only discounts
            </p>

            <div className="flex flex-row gap-3 justify-center">
              <a
                href="#"
                className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
              >
                <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <span className="text-foreground font-semibold text-sm">Google Play</span>
              </a>

              <a
                href="#"
                className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
              >
                <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <span className="text-foreground font-semibold text-sm">App Store</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
