import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Manifesto() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <Navigation />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="min-h-[70vh] flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.1] mb-8 text-primary">
              Relief Works removes the pressure between vision and execution.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl leading-relaxed">
              We exist to remove the invisible weight that sits between an idea
              and its execution.
            </p>
          </motion.div>
        </section>

        {/* Philosophy Section */}
        <section className="py-24 border-t border-border/40">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <span className="text-xs font-bold uppercase tracking-widest text-primary/60">
                Our Philosophy
              </span>
            </div>
            <div className="md:col-span-8 space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="font-display text-3xl md:text-4xl mb-4">
                  Stress is a design failure.
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  When a system requires excessive force to operate, it is
                  broken. Most modern technology adds weight rather than
                  removing it.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="font-display text-3xl md:text-4xl mb-4">
                  Technology should feel like absence.
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  The best tools disappear. They don't demand your attention;
                  they amplify your intention. We build systems that work
                  silently, efficiently, and without ego. Technology should not
                  be a presence in your life. It should be an absence of
                  problems.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 border-t border-border/40 flex justify-end">
          <Link href="/services">
            <div className="group cursor-pointer flex items-center gap-4 text-primary hover:opacity-70 transition-opacity">
              <span className="font-display text-2xl md:text-3xl">
                Explore the forms of relief
              </span>
              <ArrowRight className="w-6 h-6 md:w-8 md:h-8 transition-transform group-hover:translate-x-2" />
            </div>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
