import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Star, Shield, Clock, Check, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface ServiceCardProps {
    service: ServiceDetails;
    onBook: (service: ServiceDetails) => void;
    index: number;
}

const ServiceCard = ({ service, onBook, index }: ServiceCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-col h-auto md:h-full relative"
        >
            {/* Mobile Top Row: Image + Key Info */}
            <div className="flex md:block p-3 gap-3 md:p-0">
                {/* Image */}
                {/* Content Right (Mobile) / Bottom (Desktop) */}
                <div className="relative w-28 h-28 min-w-[112px] md:w-full md:h-48 rounded-lg md:rounded-none overflow-hidden bg-gray-100 shrink-0">
                    <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover"
                    />
                    {/* Discount Badge (Desktop/Mobile) */}
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg md:top-3 md:left-3 md:right-auto md:rounded-full md:text-xs md:px-3 md:py-1">
                        {Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)}% OFF
                    </div>
                </div>

                {/* Content Right (Mobile) / Bottom (Desktop) */}
                <div className="flex flex-col flex-grow justify-between min-w-0 md:p-5">
                    <div className="flex flex-col h-full justify-between">
                        {/* Title & Rating */}
                        <div className="mb-1 md:mb-2">
                            <h3 className="text-sm md:text-lg font-bold text-gray-900 leading-tight line-clamp-2 md:line-clamp-none">
                                {service.name}
                            </h3>
                            <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-xs font-bold text-gray-900">{service.rating}</span>
                                <span className="text-[10px] text-gray-500">({service.reviews})</span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-1.5 md:gap-2 md:mb-4">
                            <span className="text-base md:text-xl font-bold text-gray-900">₹{service.price}</span>
                            <span className="text-xs md:text-sm text-gray-400 line-through">₹{service.originalPrice}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile: Expand Toggle */}
            <div className="md:hidden px-3 pb-3">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between text-xs font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-lg"
                >
                    {isExpanded ? "Hide Details" : "View Details & Warranty"}
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {/* Details Section (Expandable on Mobile, Always Visible on Desktop) */}
            <div className={`${isExpanded ? 'block' : 'hidden'} md:block bg-gray-50/50 md:bg-transparent px-3 pb-3 md:px-5 md:pb-5 border-t md:border-t-0 border-dashed border-gray-200 mt-2 md:mt-0`}>
                {/* Includes List */}
                <div className="mb-4 pt-3 md:pt-0">
                    <p className="text-xs md:text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Shield className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                        What's Included:
                    </p>
                    <ul className="space-y-1.5">
                        {service.includes.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs md:text-sm text-gray-600">
                                <Check className="w-3 h-3 md:w-4 md:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="font-normal">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Duration/Warranty Info */}
                <div className="flex items-center gap-3 text-[11px] md:text-xs text-gray-500 mb-4 bg-white p-2 rounded border border-gray-100 md:border-none md:bg-transparent md:p-0">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{service.duration}</span>
                    </div>
                    <div className="h-3 w-px bg-gray-300"></div>
                    <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>30 Day Warranty</span>
                    </div>
                </div>

                {/* CTA */}
                <Button
                    size="sm"
                    className="w-full h-9 md:h-10 text-xs md:text-sm font-medium bg-black hover:bg-gray-800 text-white"
                    onClick={() => onBook(service)}
                >
                    Book Service for ₹{service.price}
                </Button>
            </div>
        </motion.div>
    );
};

export default ServiceCard;
