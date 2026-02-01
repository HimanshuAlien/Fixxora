import { motion } from "framer-motion";
import { Shield, Clock, Award, Wallet, Users, HeadphonesIcon } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Verified Technicians",
    description: "All our technicians undergo thorough background checks and skill verification.",
  },
  {
    icon: Clock,
    title: "Same Day Service",
    description: "Book before 12 PM and get same-day service at no extra cost.",
  },
  {
    icon: Award,
    title: "30-Day Warranty",
    description: "Every repair comes with a 30-day service warranty for peace of mind.",
  },
  {
    icon: Wallet,
    title: "Transparent Pricing",
    description: "No hidden charges. Get upfront pricing before we start any work.",
  },
  {
    icon: Users,
    title: "10,000+ Happy Customers",
    description: "Join thousands of satisfied customers who trust TrustAC for their repairs.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Our customer support team is available round the clock to assist you.",
  },
];

const WhyUs = () => {
  return (
    <section id="why-us" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                Why Choose Us
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                India's Most <span className="text-gradient">Trusted</span> Appliance Repair Service
              </h2>
              <p className="text-lg text-muted-foreground">
                We're not just fixing appliances – we're building trust. With verified 
                experts, transparent pricing, and service guarantees, TrustAC is your 
                reliable partner for all home appliance repairs.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4">
              {[
                { value: "10K+", label: "Customers" },
                { value: "4.9★", label: "Rating" },
                { value: "15+", label: "Cities" },
                { value: "50+", label: "Experts" },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="bg-background rounded-xl px-6 py-4 shadow-card text-center"
                >
                  <div className="text-2xl font-bold text-gradient">{badge.value}</div>
                  <div className="text-sm text-muted-foreground">{badge.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Features Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-background p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
