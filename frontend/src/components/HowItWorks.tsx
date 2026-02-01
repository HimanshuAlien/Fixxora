import { motion } from "framer-motion";
import { Calendar, UserCheck, Wrench, ThumbsUp } from "lucide-react";

const steps = [
  {
    icon: Calendar,
    title: "Book Online",
    description: "Select your service, choose a convenient time slot, and book in under 2 minutes.",
    color: "bg-primary",
  },
  {
    icon: UserCheck,
    title: "Expert Assigned",
    description: "A verified, trained technician is assigned and will contact you before arrival.",
    color: "bg-accent",
  },
  {
    icon: Wrench,
    title: "Get It Fixed",
    description: "Our expert diagnoses and repairs your appliance using genuine spare parts.",
    color: "bg-success",
  },
  {
    icon: ThumbsUp,
    title: "Pay & Review",
    description: "Pay securely after service completion. Rate your experience and technician.",
    color: "bg-primary",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            How <span className="text-gradient">TrustAC</span> Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Getting your appliances repaired has never been easier. 
            Follow these simple steps to get started.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent z-0" />
              )}

              <div className="relative text-center group">
                {/* Step Number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center z-10">
                  {index + 1}
                </div>

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-24 h-24 mx-auto rounded-2xl ${step.color} flex items-center justify-center shadow-lg mb-6`}
                >
                  <step.icon className="w-10 h-10 text-primary-foreground" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
