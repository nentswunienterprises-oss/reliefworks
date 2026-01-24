import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

const services = [
  {
    id: "01",
    title: "Relief from Friction",
    subtitle: "Technical Improvement",
    description: "Your systems are slow, disconnected, or heavy. We streamline the machinery of your business so things just flow. We remove the grit from the gears.",
    tags: ["Automation", "Integration", "Optimization"]
  },
  {
    id: "02",
    title: "Relief from Limitation",
    subtitle: "Idea Realization",
    description: "You have a vision but don't know if it's possible. We prototype, validate, and build the initial architecture that proves your idea can exist in the real world.",
    tags: ["Prototyping", "Architecture", "MVP"]
  },
  {
    id: "03",
    title: "Relief from Incoherence",
    subtitle: "Identity & Positioning",
    description: "You know who you are, but the world doesn't. We clarify your signal, strip away the noise, and design an identity that feels inevitably true.",
    tags: ["Branding", "Strategy", "Design"]
  }
];

export default function Services() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-24"
        >
          <h1 className="font-display text-5xl md:text-6xl mb-6">The Three Forms of Relief</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            We don't sell "solutions". We sell the removal of specific types of pressure.
          </p>
        </motion.div>

        <div className="space-y-32">
          {services.map((service, index) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 border-t border-border/40 pt-12"
            >
              <div className="md:col-span-3">
                <span className="font-mono text-xs text-muted-foreground/60 block mb-2">{service.id}</span>
                <span className="text-sm font-medium uppercase tracking-widest text-primary/80">{service.subtitle}</span>
              </div>
              
              <div className="md:col-span-9 lg:col-span-7">
                <h2 className="font-display text-4xl md:text-5xl mb-6">{service.title}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  {service.description}
                </p>
                
                <div className="flex gap-3 mb-8">
                  {service.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-secondary rounded-full text-xs font-medium text-secondary-foreground">
                      {tag}
                    </span>
                  ))}
                </div>

                <Link href="/diagnosis">
                  <div className="inline-flex items-center gap-2 text-sm font-bold text-primary border-b border-primary/20 pb-0.5 hover:border-primary transition-colors cursor-pointer">
                    Request this relief
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
