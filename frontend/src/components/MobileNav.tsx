
import { Home, Briefcase, Calendar, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const MobileNav = () => {
    const location = useLocation();

    const links = [
        {
            name: "Home",
            href: "/",
            icon: Home,
        },
        {
            name: "Services",
            href: "/services",
            icon: Briefcase,
        },
        {
            name: "Bookings",
            href: "/my-bookings",
            icon: Calendar,
        },
        {
            name: "Settings",
            href: "/settings",
            icon: Settings,
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe md:hidden">
            <div className="flex justify-around items-center h-16">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.href;

                    return (
                        <Link
                            key={link.name}
                            to={link.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive ? "text-primary" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{link.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileNav;
