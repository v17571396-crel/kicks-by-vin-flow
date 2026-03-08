import { motion } from 'framer-motion';
import { MapPin, Recycle, Shield, Heart, Star, Quote } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

const values = [
  {
    icon: Recycle,
    title: 'Sustainable Fashion',
    description: 'Every pair we sell is a pair saved from landfill. We believe great style doesn\'t have to cost the earth.',
  },
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'Each shoe is hand-inspected, cleaned, and graded so you know exactly what you\'re getting.',
  },
  {
    icon: MapPin,
    title: 'Nairobi Born',
    description: 'We\'re proudly local. Fast delivery across Nairobi, with M-Pesa payments you can trust.',
  },
  {
    icon: Heart,
    title: 'Community First',
    description: 'We\'re building a community of sneakerheads who value quality, affordability, and authenticity.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-secondary blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-primary-foreground font-body mb-4">
              Our Story
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground leading-tight">
              Fresh kicks for<br />
              <span className="text-accent">everyone.</span>
            </h1>
            <p className="mt-6 font-body text-base md:text-lg text-primary-foreground/80 leading-relaxed max-w-lg">
              KicksbyVin started with one idea: Nairobi deserves access to dope
              sneakers at prices that make sense. No gatekeeping, no crazy
              markups — just quality thrift kicks, cleaned up and ready to rock.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              How It All Started
            </h2>
            <div className="mt-6 space-y-4 font-body text-foreground/80 leading-relaxed">
              <p>
                It started in a small room in Nairobi with a pile of thrift shoes and a
                phone camera. What began as selling a few pairs to friends quickly
                became something bigger — a mission to make quality second-hand
                sneakers accessible to everyone.
              </p>
              <p>
                We noticed a gap: Kenyans love sneakers, but authentic pairs are often
                out of reach. Meanwhile, perfectly good shoes were sitting in thrift
                markets, waiting to be discovered. We decided to bridge that gap.
              </p>
              <p>
                Today, every pair that passes through KicksbyVin is carefully sourced,
                inspected, cleaned, and photographed. We grade each shoe honestly so
                you always know what you're getting. No surprises — just heat on your
                feet.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-card py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl font-bold text-foreground text-center"
          >
            What We Stand For
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-background rounded-xl p-6 space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <value.icon size={20} className="text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground">{value.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-display text-2xl md:text-3xl font-bold text-foreground text-center"
        >
          What Our Customers Say
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {[
            {
              name: 'Brian M.',
              location: 'Westlands, Nairobi',
              text: 'Got a pair of Jordan 1s from KicksbyVin and they looked even better than the photos. Delivery was fast and the M-Pesa process was smooth. Will definitely cop again!',
              rating: 5,
            },
            {
              name: 'Amina K.',
              location: 'Kilimani, Nairobi',
              text: 'I was skeptical about buying thrift shoes online, but KicksbyVin changed my mind. The grading is honest, shoes arrived clean, and the price was unbeatable.',
              rating: 5,
            },
            {
              name: 'Kevin O.',
              location: 'South B, Nairobi',
              text: 'My go-to for sneakers now. The quality checks are thorough and Vin always responds quickly on WhatsApp. Already bought 3 pairs this year.',
              rating: 5,
            },
          ].map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card rounded-xl p-6 flex flex-col"
            >
              <Quote size={24} className="text-terracotta/40 mb-3" />
              <p className="font-body text-sm text-foreground/80 leading-relaxed flex-1">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-1 mt-4">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star key={j} size={14} className="fill-terracotta text-terracotta" />
                ))}
              </div>
              <div className="mt-2">
                <p className="font-display text-sm font-semibold text-foreground">{testimonial.name}</p>
                <p className="font-body text-xs text-muted-foreground">{testimonial.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 md:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Ready to find your next pair?
          </h2>
          <p className="mt-3 font-body text-muted-foreground max-w-md mx-auto">
            Browse our latest collection of cleaned, graded, and ready-to-wear thrift kicks.
          </p>
          <a
            href="/#shop"
            className="mt-6 inline-flex items-center gap-2 bg-terracotta text-accent-foreground px-8 py-3 rounded-full font-display font-semibold text-sm hover:bg-terracotta-light transition-colors"
          >
            Shop Now
          </a>
        </motion.div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default About;
