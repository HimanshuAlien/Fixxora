import { motion } from "framer-motion";
import { ArrowRight, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 gradient-primary" />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full" />
        <div className="absolute bottom-10 right-10 w-60 h-60 border-2 border-white rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-2 border-white rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Get Your Appliances Fixed?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Book a service in under 2 minutes and get a verified technician 
            at your doorstep. First-time users get 20% off!
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <Button variant="heroOutline" size="xl">
              <Phone className="w-5 h-5" />
              Call Us Now
            </Button>
            <Button 
              size="xl"
              className="bg-white text-primary hover:bg-white/90 shadow-xl"
            >
              Book a Service
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="heroOutline" size="xl">
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </Button>
          </div>

          <p className="text-primary-foreground/60 text-sm">
            No credit card required • Free cancellation • 30-day warranty
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
