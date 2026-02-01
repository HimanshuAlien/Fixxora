import { Shield, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Clock, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const services = [
    "AC Repair & Service",
    "AC Installation",
    "Refrigerator Repair",
    "Washing Machine Repair",
    "Microwave Repair",
    "Geyser Repair",
    "TV Repair",
  ];

  const company = [
    { name: "About Us", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Partner With Us", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Contact", href: "#" },
  ];

  const support = [
    { name: "Help Center", href: "#" },
    { name: "FAQs", href: "#" },
    { name: "Service Warranty", href: "#" },
    { name: "Cancellation Policy", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
  ];

  const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad"];

  const features = [
    { icon: CheckCircle2, text: "Verified Technicians" },
    { icon: Clock, text: "Same Day Service" },
    { icon: Shield, text: "30-Day Warranty" },
  ];

  return (
    <footer className="bg-[hsl(213,50%,15%)] text-white">
      {/* Features Bar */}
      <div className="bg-primary py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-primary-foreground">
                <feature.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">TrustAC</span>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed">
              India's most trusted home appliance repair service. Get verified technicians 
              at your doorstep with transparent pricing and 30-day service warranty.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, href: "#" },
                { Icon: Twitter, href: "#" },
                { Icon: Instagram, href: "#" },
                { Icon: Linkedin, href: "#" },
              ].map(({ Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-5 text-lg">Our Services</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <Link to="/services" className="text-white/70 hover:text-primary transition-colors text-sm">
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-5 text-lg">Company</h4>
            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="text-white/70 hover:text-primary transition-colors text-sm">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-5 text-lg">Support</h4>
            <ul className="space-y-3">
              {support.map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="text-white/70 hover:text-primary transition-colors text-sm">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-5 text-lg">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-white/50">24/7 Helpline</div>
                  <a href="tel:+919999999999" className="font-semibold hover:text-primary transition-colors">
                    +91 99999 99999
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-white/50">Email Support</div>
                  <a href="mailto:support@trustac.in" className="font-semibold hover:text-primary transition-colors">
                    support@trustac.in
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-white/50">Available Cities</div>
                  <div className="text-sm text-white/80">{cities.slice(0, 4).join(", ")} & more</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">
              © {currentYear} <span className="font-semibold text-white">TrustAC</span> — Proof Based Appliance Services
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-white/50 hover:text-primary text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-white/50 hover:text-primary text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-white/50 hover:text-primary text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
