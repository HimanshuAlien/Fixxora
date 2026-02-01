import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Shield,
  Star,
  Check,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingModal from "@/components/BookingModal";
import serviceAc from "@/assets/service-ac.jpg";
import serviceFridge from "@/assets/service-fridge.jpg";
import serviceWashing from "@/assets/service-washing.jpg";
import ServiceCard from "@/components/ServiceCard";

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

const serviceCategories = [
  {
    id: "ac",
    title: "AC Services",
    image: serviceAc,
    bookings: "12,500+",
    subServices: [
      {
        name: "AC Deep Cleaning",
        price: 399,
        originalPrice: 599,
        duration: "1.5 hrs",
        rating: 4.8,
        reviews: 2340,
        image: serviceAc,
        includes: ["Jet spray cleaning", "Foam wash", "Filter cleaning", "Drain cleaning", "Final sanitization"],
      },
      {
        name: "AC Gas Refill (R22)",
        price: 1499,
        originalPrice: 1999,
        duration: "1 hr",
        rating: 4.9,
        reviews: 1890,
        image: serviceAc,
        includes: ["Gas pressure check", "Leak detection", "R22 gas refill", "Cooling performance test", "30-day warranty"],
      },
      {
        name: "AC Installation",
        price: 499,
        originalPrice: 799,
        duration: "2-3 hrs",
        rating: 4.7,
        reviews: 1560,
        image: serviceAc,
        includes: ["Wall mounting", "Copper piping (up to 3ft)", "Drainage setup", "Electrical connection", "Test run"],
      },
      {
        name: "AC Compressor Repair",
        price: 2999,
        originalPrice: 3999,
        duration: "3-4 hrs",
        rating: 4.8,
        reviews: 980,
        image: serviceAc,
        includes: ["Diagnosis", "Compressor repair/replace", "Gas top-up", "Performance test", "90-day warranty"],
      },
      {
        name: "AC PCB Repair",
        price: 899,
        originalPrice: 1299,
        duration: "2 hrs",
        rating: 4.6,
        reviews: 750,
        image: serviceAc,
        includes: ["PCB diagnosis", "Component repair", "Wiring check", "Remote sync", "30-day warranty"],
      },
    ],
  },
  {
    id: "refrigerator",
    title: "Refrigerator",
    image: serviceFridge,
    bookings: "8,200+",
    subServices: [
      {
        name: "Cooling Issue Fix",
        price: 349,
        originalPrice: 499,
        duration: "1-2 hrs",
        rating: 4.8,
        reviews: 1890,
        image: serviceFridge,
        includes: ["Thermostat check", "Gas level check", "Fan motor inspection", "Coil cleaning", "Performance test"],
      },
      {
        name: "Gas Leak Fix & Refill",
        price: 1999,
        originalPrice: 2499,
        duration: "2 hrs",
        rating: 4.9,
        reviews: 1450,
        image: serviceFridge,
        includes: ["Leak detection", "Leak sealing", "Complete gas refill", "Cooling test", "60-day warranty"],
      },
      {
        name: "Compressor Replacement",
        price: 3499,
        originalPrice: 4499,
        duration: "3-4 hrs",
        rating: 4.7,
        reviews: 890,
        image: serviceFridge,
        includes: ["Old compressor removal", "New compressor fitting", "Gas charging", "Wiring setup", "90-day warranty"],
      },
      {
        name: "Thermostat Repair",
        price: 599,
        originalPrice: 799,
        duration: "1 hr",
        rating: 4.8,
        reviews: 1120,
        image: serviceFridge,
        includes: ["Thermostat testing", "Calibration/replacement", "Temperature check", "Door seal inspection", "30-day warranty"],
      },
      {
        name: "Door Seal Replacement",
        price: 449,
        originalPrice: 599,
        duration: "30 mins",
        rating: 4.6,
        reviews: 670,
        image: serviceFridge,
        includes: ["Old seal removal", "New gasket fitting", "Alignment check", "Cooling efficiency test", "Seal warranty"],
      },
    ],
  },
  {
    id: "washing",
    title: "Washing Machine",
    image: serviceWashing,
    bookings: "9,800+",
    subServices: [
      {
        name: "Drum Repair",
        price: 799,
        originalPrice: 1099,
        duration: "2 hrs",
        rating: 4.8,
        reviews: 1650,
        image: serviceWashing,
        includes: ["Drum inspection", "Bearing check", "Belt replacement", "Balance calibration", "Test wash"],
      },
      {
        name: "Motor Replacement",
        price: 2499,
        originalPrice: 3299,
        duration: "2-3 hrs",
        rating: 4.7,
        reviews: 980,
        image: serviceWashing,
        includes: ["Motor diagnosis", "Old motor removal", "New motor installation", "Wiring connection", "90-day warranty"],
      },
      {
        name: "PCB/Control Panel Repair",
        price: 1299,
        originalPrice: 1699,
        duration: "1.5 hrs",
        rating: 4.6,
        reviews: 720,
        image: serviceWashing,
        includes: ["PCB diagnosis", "Component repair", "Display fix", "Button calibration", "30-day warranty"],
      },
      {
        name: "Drainage Issue Fix",
        price: 399,
        originalPrice: 549,
        duration: "1 hr",
        rating: 4.9,
        reviews: 2100,
        image: serviceWashing,
        includes: ["Drain pipe cleaning", "Pump inspection", "Filter cleaning", "Flow test", "Blockage removal"],
      },
      {
        name: "Installation & Demo",
        price: 349,
        originalPrice: 499,
        duration: "1 hr",
        rating: 4.9,
        reviews: 3200,
        image: serviceWashing,
        includes: ["Unboxing", "Water inlet connection", "Drain setup", "Demo wash cycle", "Usage guidance"],
      },
    ],
  },
  {
    id: "appliances",
    title: "Other Appliances",
    image: serviceAc,
    bookings: "6,400+",
    subServices: [
      {
        name: "Microwave Repair",
        price: 449,
        originalPrice: 599,
        duration: "1 hr",
        rating: 4.7,
        reviews: 980,
        image: serviceAc,
        includes: ["Heating element check", "Magnetron inspection", "Door switch repair", "Turntable fix", "30-day warranty"],
      },
      {
        name: "Geyser Installation",
        price: 399,
        originalPrice: 549,
        duration: "1 hr",
        rating: 4.8,
        reviews: 1450,
        image: serviceFridge,
        includes: ["Wall mounting", "Pipe connections", "Electrical wiring", "Safety valve setup", "Test run"],
      },
      {
        name: "Geyser Repair",
        price: 349,
        originalPrice: 499,
        duration: "1 hr",
        rating: 4.6,
        reviews: 890,
        image: serviceFridge,
        includes: ["Element check", "Thermostat repair", "Leakage fix", "Pressure valve check", "30-day warranty"],
      },
      {
        name: "Chimney Deep Cleaning",
        price: 599,
        originalPrice: 799,
        duration: "1.5 hrs",
        rating: 4.9,
        reviews: 1670,
        image: serviceWashing,
        includes: ["Filter removal", "Degreasing wash", "Motor cleaning", "Duct cleaning", "Performance test"],
      },
      {
        name: "Dishwasher Repair",
        price: 699,
        originalPrice: 899,
        duration: "1.5 hrs",
        rating: 4.8,
        reviews: 540,
        image: serviceWashing,
        includes: ["Spray arm check", "Pump inspection", "Door seal repair", "Drainage fix", "30-day warranty"],
      },
    ],
  },
];

const ServicesPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const draft = localStorage.getItem("bookingDraft");
    if (!draft) return;

    try {
      const parsed = JSON.parse(draft) as {
        service?: ServiceDetails;
      };

      if (parsed.service) {
        setSelectedService(parsed.service);
        setIsBookingOpen(true);
      }
    } catch (e) {
      console.error("Invalid booking draft");
      localStorage.removeItem("bookingDraft");
    }
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceDetails | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const currentCategory = serviceCategories.find(c => c.id === selectedCategory);

  const handleBookNow = (service: ServiceDetails) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setSelectedService(service);
    setIsBookingOpen(true);
  };



  return (
    <div className="min-h-screen relative">
      {/* Full Page Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-blue-100/80 to-cyan-50" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      <div className="fixed top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        <Navbar />

        {/* Booking Modal */}
        {selectedService && (
          <BookingModal
            isOpen={isBookingOpen}
            onClose={() => setIsBookingOpen(false)}
            service={selectedService}
          />
        )}

        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            /* Category Grid */
            <motion.section
              key="categories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-28 pb-20"
            >
              <div className="container mx-auto px-4">
                {/* Section Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-12"
                >
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
                    Choose Your <span className="text-gradient">Appliance</span>
                  </h1>
                  <p className="text-muted-foreground text-lg">Expert technicians for all major brands</p>
                </motion.div>

                {/* Service Cards Grid - Netflix Style with gaps */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
                  {serviceCategories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      onClick={() => setSelectedCategory(category.id)}
                      className="group cursor-pointer relative aspect-square overflow-hidden rounded-2xl shadow-lg"
                    >
                      {/* Full Image */}
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
                      />
                      {/* Dark overlay - always visible at bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/95 via-foreground/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Content container - positioned at bottom */}
                      <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                        {/* Rating Badge - shows on hover */}
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-background/95 backdrop-blur-sm rounded-full shadow-lg flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold text-foreground">4.8</span>
                        </div>

                        {/* Title - starts at bottom, moves up on hover */}
                        <h3 className="text-lg md:text-xl font-bold text-background mb-0 group-hover:mb-2 transform translate-y-0 group-hover:-translate-y-1 transition-all duration-300">
                          {category.title}
                        </h3>

                        {/* Details - hidden by default, slides up on hover */}
                        <div className="max-h-0 overflow-hidden opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-300 ease-out">
                          <p className="text-xs md:text-sm text-background/80 flex items-center gap-1.5 mb-2">
                            <Users className="w-3 h-3 md:w-4 md:h-4" />
                            {category.bookings} bookings
                          </p>
                          <span className="inline-block px-2.5 py-1 md:px-3 md:py-1.5 bg-background text-foreground text-xs md:text-sm font-semibold rounded-lg">
                            View Services
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          ) : (
            /* Sub-Services Grid */
            <motion.section
              key="services"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="pt-20 pb-20"
            >
              <div className="container mx-auto px-4">
                {/* Back Button & Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 md:mb-10"
                >
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Categories
                  </button>
                  <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
                    {currentCategory?.title}
                  </h1>
                </motion.div>

                <div className="max-w-6xl mx-auto">
                  {/* Services Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {currentCategory?.subServices.map((service, index) => (
                      <ServiceCard
                        key={service.name}
                        service={service}
                        onBook={handleBookNow}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </div>
  );
};

export default ServicesPage;
