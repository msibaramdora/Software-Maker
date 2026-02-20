import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Scan, UserCheck, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b bg-card/80 backdrop-blur-md fixed w-full z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display font-bold text-xl">VMS Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-medium">Sign In</Button>
            </Link>
            <Link href="/visitor/register">
              <Button>Register Visit</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 overflow-hidden relative">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tight text-foreground mb-6">
              Smart Visitor <br />
              <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                Management
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Secure, seamless, and efficient entry management for modern workplaces. Digitize your reception today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/visitor/register">
                <Button size="lg" className="h-14 px-8 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-1 transition-all">
                  Check In Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl">
                  Employee Login
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative"
          >
            {/* Abstract Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-700" />
            
            <div className="bg-card border border-border/50 shadow-2xl rounded-2xl p-6 relative z-10">
              <div className="flex items-center gap-4 mb-6 border-b pb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <UserCheck className="text-gray-500" />
                </div>
                <div>
                  <div className="h-4 w-32 bg-gray-100 rounded mb-2" />
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                </div>
                <div className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  APPROVED
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-3 w-full bg-gray-50 rounded" />
                <div className="h-3 w-3/4 bg-gray-50 rounded" />
                <div className="h-3 w-5/6 bg-gray-50 rounded" />
              </div>
              <div className="mt-6 flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <span className="text-sm font-medium text-gray-500">Visitor Pass</span>
                <Scan className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold font-display mb-4">Why Choose VMS Pro?</h2>
            <p className="text-muted-foreground">Streamline your front desk operations with our comprehensive suite of tools.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Calendar, 
                title: "Pre-Registration", 
                desc: "Send invites to guests in advance for a smoother check-in experience." 
              },
              { 
                icon: Scan, 
                title: "Contactless Entry", 
                desc: "QR code based check-in keeps your workplace safe and modern." 
              },
              { 
                icon: ShieldCheck, 
                title: "Enhanced Security", 
                desc: "Track who is in your building in real-time with digital logs." 
              },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 border-t bg-card text-center text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>&copy; 2024 VMS Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
