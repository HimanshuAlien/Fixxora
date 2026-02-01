import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();



  // Check login status on mount and when location changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);



  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/", { replace: true });
  };

  const handleSignIn = () => {
    navigate("/login");
  };


  // Role-based navigation links
  const role = localStorage.getItem("role");
  let navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "My Bookings", href: "/my-bookings" },
    { name: "Settings", href: "/settings" },
  ];

  // Restrict mechanic navigation to Dashboard and Settings only
  if (role === "mechanic") {
    navLinks = [
      { name: "Dashboard", href: "/mechanic-dashboard" },
      { name: "Settings", href: "/settings" },
    ];
  }

  const isActiveLink = (href: string) => {
    return location.pathname === href;
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-white/80 to-transparent backdrop-blur-[2px]"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - positioned more left */}
          <Link to="/" className="flex items-center gap-2 group -ml-1 md:-ml-2">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-primary flex items-center justify-center">
              <Wrench className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <span className="text-xl md:text-2xl font-bold text-foreground">
              Fixxora
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = isActiveLink(link.href);

              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`font-medium text-sm transition-all duration-200 ${isActive
                    ? "text-primary"
                    : "text-[hsl(213,30%,40%)] hover:text-primary"
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Sign In / Logout Button */}
          <div className="hidden md:block">
            {isLoggedIn ? (
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-medium px-6"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Button
                onClick={handleSignIn}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium px-6"
              >
                Sign In
              </Button>
            )}
          </div>

        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
