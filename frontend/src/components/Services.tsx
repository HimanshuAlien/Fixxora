import { motion } from "framer-motion";
import { ArrowRight, Snowflake, Thermometer, WashingMachine, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import serviceAc from "@/assets/service-ac.jpg";
import serviceFridge from "@/assets/service-fridge.jpg";
import serviceWashing from "@/assets/service-washing.jpg";

const services = [
  {
    icon: Snowflake,
    title: "AC Repair & Service",
    description: "Complete AC solutions including installation, gas refill, deep cleaning, and repairs for all brands.",
    image: serviceAc,
    features: ["Gas Refilling", "Deep Cleaning", "Installation", "Repair"],
    price: "Starting ₹299",
  },
  {
    icon: Thermometer,
    title: "Refrigerator Repair",
    description: "Expert fridge repairs for all types - single door, double door, side-by-side, and French doors.",
    image: serviceFridge,
    features: ["Cooling Issues", "Compressor Repair", "Thermostat Fix", "Gas Leak"],
    price: "Starting ₹349",
  },
  {
    icon: WashingMachine,
    title: "Washing Machine Repair",
    description: "Front load, top load, semi-automatic - we repair all types of washing machines.",
    image: serviceWashing,
    features: ["Drum Issues", "Motor Repair", "PCB Repair", "Drainage Fix"],
    price: "Starting ₹299",
  },
  {
    icon: Wrench,
    title: "General Appliances",
    description: "Microwave, geyser, chimney, and other home appliance repairs by certified technicians.",
    image: serviceAc,
    features: ["Microwave", "Geyser", "Chimney", "Dishwasher"],
    price: "Starting ₹199",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
            Our Services
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Expert Repair Services for{" "}
            <span className="text-gradient">All Your Appliances</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Professional, affordable, and reliable home appliance repair services 
            delivered by verified technicians with a satisfaction guarantee.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-background rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                    <service.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {service.description}
                  </p>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {service.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-lg font-bold text-gradient">{service.price}</span>
                  <Button variant="ghost" size="sm" className="group/btn">
                    Book Now
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button variant="hero" size="xl">
            View All Services
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
