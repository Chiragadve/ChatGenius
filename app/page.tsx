import Link from "next/link";
import { ArrowRight, MessageSquare, Shield, Zap, Hash, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(174,72%,45%)] to-[hsl(186,72%,55%)] flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg">
              C
            </div>
            <span className="font-bold text-xl tracking-tight">ChatGenius</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />

          <div className="container relative mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              v2.0 is now live
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50 animate-in fade-in slide-in-from-bottom-8 duration-700">
              Connect. Collaborate.<br />
              <span className="text-primary">Create together.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-100">
              Experience the next evolution of team communication. Real-time messaging,
              crystal clear channels, and a beautiful interface designed for modern teams.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-200">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[hsl(174,72%,45%)] to-[hsl(186,72%,55%)] text-primary-foreground font-semibold text-lg hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Start for free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-card border border-border text-foreground font-semibold text-lg hover:bg-accent transition-colors">
                View Demo
              </button>
            </div>

            {/* Hero Image Preview */}
            <div className="mt-20 relative max-w-5xl mx-auto rounded-xl border border-border/50 shadow-2xl shadow-primary/5 bg-card/50 backdrop-blur-sm p-2 animate-in fade-in zoom-in-95 duration-1000 delay-300">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
              <div className="rounded-lg overflow-hidden bg-background aspect-[16/9] flex items-center justify-center border border-border relative">
                <img
                  src="/landing-preview.png"
                  alt="App Interface Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-card/30 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything you need to sync</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Powerful features that help your team stay aligned and move faster.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Real-time Messaging",
                  desc: "Instant delivery with live typing indicators and presence awareness."
                },
                {
                  icon: Hash,
                  title: "Organized Channels",
                  desc: "Keep conversations focused with dedicated channels for every topic."
                },
                {
                  icon: Shield,
                  title: "Enterprise Security",
                  desc: "Bank-grade encryption and secure authentication via Supabase."
                }
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof / Trust */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-gradient-to-br from-card to-background border border-border rounded-3xl p-8 md:p-12">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-6">Ready to transform how your team communicates?</h2>
                <ul className="space-y-3 mb-8">
                  {[
                    "Unlimited message history",
                    "Unlimited channels",
                    "10GB file storage",
                    "24/7 Support"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-foreground text-background font-semibold hover:opacity-90 transition-opacity"
                >
                  Get Started Now
                </Link>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="relative w-full max-w-sm aspect-square rounded-full bg-gradient-to-tr from-primary/20 to-purple-500/20 blur-3xl" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                C
              </div>
              <span className="font-semibold">ChatGenius</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ChatGenius Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground">Privacy</Link>
              <Link href="#" className="hover:text-foreground">Terms</Link>
              <Link href="#" className="hover:text-foreground">Twitter</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
