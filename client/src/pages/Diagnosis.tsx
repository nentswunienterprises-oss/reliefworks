import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { DiagnosisForm } from "@/components/DiagnosisForm";

export default function Diagnosis() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >
            <h1 className="font-display text-5xl md:text-6xl mb-8">Begin the process.</h1>
            <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
              <p>
                We don't do "sales calls". We do diagnosis.
              </p>
              <p>
                Before we can build anything, we must understand the structure of the pressure you are under.
              </p>
              <p>
                Fill out the diagnosis form. Be honest. Be brief. We will review your situation and determine if we are the correct instrument for relief.
              </p>
              
              <div className="pt-8 border-t border-border/40">
                <p className="font-display text-xl text-primary mb-2">Direct Contact</p>
                <a href="mailto:hello@relief.works" className="text-base hover:text-primary transition-colors">
                  hello@relief.works
                </a>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7"
          >
            <DiagnosisForm />
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
