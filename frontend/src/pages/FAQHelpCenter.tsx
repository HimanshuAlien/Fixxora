import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown, Search, HelpCircle, MessageCircle, Phone, Mail,
    BookOpen, AlertCircle, CheckCircle2, Clock, MapPin, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

interface FAQItem {
    id: string;
    category: string;
    question: string;
    answer: string;
    icon: React.ReactNode;
}

const FAQHelpCenter = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState("all");

    const faqItems: FAQItem[] = [
        // Booking Related
        {
            id: "booking-1",
            category: "booking",
            question: "How do I book a service?",
            answer: "Navigate to the Services page, select your desired service category, choose your preferred date and time slot, provide your address details, and confirm the booking. You'll receive a confirmation with your Booking ID and technician details.",
            icon: <BookOpen className="w-5 h-5" />
        },
        {
            id: "booking-2",
            category: "booking",
            question: "Can I reschedule my booking?",
            answer: "Yes! You can reschedule your booking up to 30 days in advance. Go to 'My Bookings', click on the booking you want to reschedule, and select the new date and time slot from the available options.",
            icon: <Clock className="w-5 h-5" />
        },
        {
            id: "booking-3",
            category: "booking",
            question: "What if I need to cancel my booking?",
            answer: "You can cancel your booking from 'My Bookings' section. Click on the booking, select 'Cancel Booking', and provide a reason. Cancellations made 24 hours in advance are fully refundable.",
            icon: <AlertCircle className="w-5 h-5" />
        },
        {
            id: "booking-4",
            category: "booking",
            question: "Can I modify the service scope after booking?",
            answer: "Yes, you can contact the technician or our support team before they arrive to discuss any modifications. Some changes may affect the final price.",
            icon: <Phone className="w-5 h-5" />
        },

        // Technician Related
        {
            id: "tech-1",
            category: "technician",
            question: "How are technicians selected for my booking?",
            answer: "We match you with the best available technician based on their expertise, location, ratings, and availability. All our technicians are verified professionals with proper certifications.",
            icon: <CheckCircle2 className="w-5 h-5" />
        },
        {
            id: "tech-2",
            category: "technician",
            question: "Can I request a specific technician?",
            answer: "If you've had a good experience with a technician, you can request them for your next booking. We'll try to accommodate your request based on their availability.",
            icon: <Phone className="w-5 h-5" />
        },
        {
            id: "tech-3",
            category: "technician",
            question: "What if the technician doesn't show up?",
            answer: "If your technician doesn't arrive within 30 minutes of the scheduled time, immediately contact our support team. We'll send a replacement technician or offer a full refund. Your safety and satisfaction are our priority.",
            icon: <AlertCircle className="w-5 h-5" />
        },

        // Payment Related
        {
            id: "payment-1",
            category: "payment",
            question: "What payment methods do you accept?",
            answer: "We accept all major credit/debit cards, UPI, digital wallets, and net banking. Online payments are secure and encrypted. You can also pay cash to the technician upon service completion.",
            icon: <DollarSign className="w-5 h-5" />
        },
        {
            id: "payment-2",
            category: "payment",
            question: "Is there a refund policy?",
            answer: "Yes! Cancellations made 24 hours before the scheduled time are fully refundable. Partial refunds are available for cancellations made within 24 hours. Service issues are resolved with full/partial refunds based on investigation.",
            icon: <CheckCircle2 className="w-5 h-5" />
        },
        {
            id: "payment-3",
            category: "payment",
            question: "Why is there a price difference for the same service?",
            answer: "Pricing varies based on several factors: service complexity, location, time slot, technician expertise level, and travel distance. You'll see the exact price before confirming your booking.",
            icon: <DollarSign className="w-5 h-5" />
        },

        // Account & Security
        {
            id: "account-1",
            category: "account",
            question: "How do I create an account?",
            answer: "Click on 'Sign Up', enter your name, email, and phone number, set a password, and verify your phone number. You'll receive an OTP via SMS for verification. Once verified, your account is ready to use!",
            icon: <Mail className="w-5 h-5" />
        },
        {
            id: "account-2",
            category: "account",
            question: "How do I reset my password?",
            answer: "On the login page, click 'Forgot Password?', enter your email address, and you'll receive a password reset link. Follow the instructions in the email to set a new password.",
            icon: <AlertCircle className="w-5 h-5" />
        },
        {
            id: "account-3",
            category: "account",
            question: "Is my personal information safe?",
            answer: "Yes! We use industry-standard encryption and security protocols to protect your data. We never share your information with third parties without consent. Your data is stored securely on our servers.",
            icon: <CheckCircle2 className="w-5 h-5" />
        },

        // Service & Quality
        {
            id: "service-1",
            category: "service",
            question: "Do you provide any warranty on services?",
            answer: "Yes! All our services come with a 30-day warranty. If any issue arises within 30 days due to our service, we'll fix it for free. Just report the issue through the app.",
            icon: <CheckCircle2 className="w-5 h-5" />
        },
        {
            id: "service-2",
            category: "service",
            question: "What should I do if the service is not satisfactory?",
            answer: "You can report the issue immediately through 'My Bookings' by clicking 'Report an Issue'. Our team will review and take appropriate action, which may include a re-service or refund.",
            icon: <AlertCircle className="w-5 h-5" />
        },
        {
            id: "service-3",
            category: "service",
            question: "Can I get an invoice for the service?",
            answer: "Yes! You'll automatically receive an invoice after the service is completed. You can download it from 'My Bookings' or request it via email from our support team.",
            icon: <BookOpen className="w-5 h-5" />
        },

        // Location & Availability
        {
            id: "location-1",
            category: "location",
            question: "Does STAR provide services in my area?",
            answer: "We currently operate in major cities and surrounding areas. You can check availability by entering your pincode during booking. If your area isn't covered yet, join our waitlist to be notified when we expand.",
            icon: <MapPin className="w-5 h-5" />
        },
        {
            id: "location-2",
            category: "location",
            question: "Are there additional charges for remote areas?",
            answer: "Some remote or hard-to-reach areas may have an additional travel charge. This will be clearly shown before you confirm your booking.",
            icon: <DollarSign className="w-5 h-5" />
        }
    ];

    const categories = [
        { id: "all", label: "All", icon: <HelpCircle className="w-4 h-4" /> },
        { id: "booking", label: "Booking", icon: <BookOpen className="w-4 h-4" /> },
        { id: "technician", label: "Technician", icon: <CheckCircle2 className="w-4 h-4" /> },
        { id: "payment", label: "Payment", icon: <DollarSign className="w-4 h-4" /> },
        { id: "account", label: "Account", icon: <Mail className="w-4 h-4" /> },
        { id: "service", label: "Service", icon: <CheckCircle2 className="w-4 h-4" /> },
        { id: "location", label: "Location", icon: <MapPin className="w-4 h-4" /> }
    ];

    const filteredFAQs = faqItems.filter(item => {
        const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "all" || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/80 to-cyan-50 flex flex-col">
            <Navbar />

            <div className="flex-1 py-12 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-block mb-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <HelpCircle className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-foreground mb-3">
                            Help Center & FAQ
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Find answers to common questions about STAR services
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-10"
                    >
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Search for answers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-12 text-base"
                            />
                        </div>
                    </motion.div>

                    {/* Category Filter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-10"
                    >
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${activeCategory === category.id
                                            ? "bg-primary text-primary-foreground shadow-md"
                                            : "bg-card/80 backdrop-blur-sm text-foreground border border-border/50 hover:border-primary/30"
                                        }`}
                                >
                                    {category.icon}
                                    {category.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* FAQ Items */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-3 mb-12"
                    >
                        <AnimatePresence mode="wait">
                            {filteredFAQs.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center py-12"
                                >
                                    <HelpCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-30" />
                                    <p className="text-muted-foreground text-lg">
                                        No FAQ items found. Try a different search or category.
                                    </p>
                                </motion.div>
                            ) : (
                                filteredFAQs.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <button
                                            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                            className="w-full px-6 py-4 flex items-start gap-4 hover:bg-muted/50 transition-colors text-left"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1 text-primary">
                                                {item.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-foreground text-base leading-tight">
                                                    {item.question}
                                                </h3>
                                            </div>
                                            <ChevronDown
                                                className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${expandedId === item.id ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </button>

                                        <AnimatePresence>
                                            {expandedId === item.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-6 py-4 bg-muted/30 text-muted-foreground leading-relaxed">
                                                        {item.answer}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Still Need Help Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20 mb-12"
                    >
                        <h2 className="text-2xl font-bold text-foreground mb-4">
                            Still need help?
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Can't find the answer you're looking for? Our support team is here to help!
                        </p>

                        <div className="grid sm:grid-cols-3 gap-4">
                            <a
                                href="mailto:support@starservices.com"
                                className="bg-card/80 backdrop-blur-sm rounded-xl p-4 hover:shadow-md transition-all border border-border/50 group cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:bg-primary/20 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
                                <p className="text-sm text-muted-foreground">support@star.com</p>
                            </a>

                            <a
                                href="tel:+918274949213"
                                className="bg-card/80 backdrop-blur-sm rounded-xl p-4 hover:shadow-md transition-all border border-border/50 group cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success mb-3 group-hover:bg-success/20 transition-colors">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">Call Us</h3>
                                <p className="text-sm text-muted-foreground">+91 8274949213</p>
                            </a>

                            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50 cursor-pointer hover:shadow-md transition-all group">
                                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center text-info mb-3 group-hover:bg-info/20 transition-colors">
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">Live Chat</h3>
                                <p className="text-sm text-muted-foreground">Chat with support</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Back to Settings Button */}
                    <div className="text-center">
                        <Link to="/settings">
                            <Button variant="outline">Back to Settings</Button>
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default FAQHelpCenter;
