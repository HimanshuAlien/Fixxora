import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "Amazing service! The technician arrived on time and fixed my AC within an hour. Very professional and transparent pricing. Highly recommended!",
    service: "AC Repair",
  },
  {
    name: "Rajesh Kumar",
    location: "Delhi",
    rating: 5,
    text: "My refrigerator wasn't cooling properly. TrustAC sent an expert who diagnosed the issue quickly. Great service with 30-day warranty!",
    service: "Fridge Repair",
  },
  {
    name: "Anita Patel",
    location: "Bangalore",
    rating: 5,
    text: "Booked washing machine repair through TrustAC. The technician was knowledgeable and fixed the drainage issue. Fair pricing too!",
    service: "Washing Machine",
  },
  {
    name: "Vikram Singh",
    location: "Pune",
    rating: 5,
    text: "Best AC service I've ever used. Gas refilling was done professionally and my AC is cooling like new. Will definitely use again!",
    service: "AC Service",
  },
  {
    name: "Meera Reddy",
    location: "Hyderabad",
    rating: 5,
    text: "Very impressed with the quick response time. Technician arrived within 2 hours of booking. Fixed my geyser in no time!",
    service: "Geyser Repair",
  },
  {
    name: "Arjun Nair",
    location: "Chennai",
    rating: 5,
    text: "Professional service from start to finish. The app makes booking so easy and the technicians are well-trained. Great experience!",
    service: "AC Installation",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
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
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            What Our <span className="text-gradient">Customers Say</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Don't just take our word for it. Here's what our happy customers 
            have to say about their experience with TrustAC.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 relative"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {testimonial.service}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-6 bg-card px-8 py-4 rounded-2xl shadow-card">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="font-bold text-foreground text-xl">4.9/5</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-muted-foreground">
              Based on <span className="font-bold text-foreground">2,500+</span> reviews
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
