"use client"

import { useState, useEffect, type MouseEvent, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import RobotImage from "@/components/robot-image"
import { ChevronDown, ChevronRight, Check, MessageSquare, FileText, Database, Zap, Link2, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"
import { ModalProviders } from '@/providers/modal-providers';
import AnnouncementPopup from '@/components/announcement-popup';

export default function LandingPage() {
  const [customTier, setCustomTier] = useState("6 hours - $50")
  const [customPrice, setCustomPrice] = useState("$50")
  const [showDropdown, setShowDropdown] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customTierOptions = [
    "6 hours - $50",
    "12 hours - $100",
    "25 hours - $200",
    "50 hours - $400",
    "125 hours - $800",
    "200 hours - $1000",
  ]

  const customTierToPriceId: Record<string, string> = {
    "6 hours - $50": "price_1RMZYBCQSpuIbcUBoLIdk8yv",
    "12 hours - $100": "price_1RMZYBCQSpuIbcUB4xpnBWn2",
    "25 hours - $200": "price_1RMZYBCQSpuIbcUBrVEJblS7",
    "50 hours - $400": "price_1RMZYBCQSpuIbcUBXR5gNWHO",
    "125 hours - $800": "price_1RMZYBCQSpuIbcUBF4PsfCG9",
    "200 hours - $1000": "price_1RMZYBCQSpuIbcUBlv69Sl4i",
  };

  // Handle scroll event for navbar
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      if (offset > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Extract price from selected tier
  useEffect(() => {
    const priceMatch = customTier.match(/\$(\d+)/)
    if (priceMatch && priceMatch[1]) {
      setCustomPrice(`$${priceMatch[1]}`)
    }
  }, [customTier])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle tier selection
  const handleTierSelect = (option: string) => {
    setCustomTier(option)
    setShowDropdown(false)

    // Extract and update price
    const priceMatch = option.match(/\$(\d+)/)
    if (priceMatch && priceMatch[1]) {
      setCustomPrice(`$${priceMatch[1]}`)
    }
  }

  // Handle hero input submission
  const handleHeroSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!inputValue.trim() || isSubmitting) return;
    if (!user && !isLoading) {
      router.push("/auth");
      return;
    }
    setIsSubmitting(true);
    // Simulate agent creation and redirect (replace with real logic as needed)
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/dashboard"); // Replace with /agents/[thread_id] if you have thread logic
    }, 1000);
  };

  // Handle Get Started and Get Started Free
  const handleGetStarted = () => {
    if (!user && !isLoading) {
      router.push("/auth");
    } else {
      router.push("/dashboard");
    }
  };

  // Handle Login
  const handleLogin = () => {
    router.push("/auth");
  };

  const handleCustomTierCheckout = async () => {
    const priceId = customTierToPriceId[customTier];
    if (!user && !isLoading) {
      router.push("/auth");
      return;
    }
    if (!priceId) return;
    // Call backend or API to create Stripe checkout session
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <>
      <ModalProviders />
      <AnnouncementPopup />
      <div className="flex min-h-screen flex-col bg-[#0a0a1f]">
        {/* Header - Updated with scroll behavior */}
        <header
          className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
            scrolled ? "bg-[#0a0a1f]/90 backdrop-blur-md" : "bg-transparent"
          }`}
        >
          <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/luciq-logo.png" alt="Luciq AI Logo" width={40} height={40} className="h-10 w-auto" />
              <span className="text-xl font-semibold text-white">Luciq AI</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="#features" className="text-sm text-white/70 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#testimonials" className="text-sm text-white/70 hover:text-white transition-colors">
                Testimonials
              </Link>
              <Link href="#pricing" className="text-sm text-white/70 hover:text-white transition-colors">
                Pricing
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="border-teal-400/30 text-white hover:bg-teal-400/10 rounded-full hidden md:flex"
                onClick={handleLogin}
              >
                Login
              </Button>
              <Button className="bg-gradient-to-r from-teal-400 to-purple-500 hover:opacity-90 text-teal-950 font-medium rounded-full" onClick={handleGetStarted}>
                Get Started
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero Section - Updated with new design */}
          <section className="hero-section relative w-full pt-32 pb-24 md:pt-40 md:pb-32 hero-bg overflow-hidden bg-[#0a0a1f]">
            {/* Grid lines */}
            <div className="grid-lines"></div>

            {/* Glowing dots */}
            <div className="glowing-dot glowing-dot-1"></div>
            <div className="glowing-dot glowing-dot-2"></div>
            <div className="glowing-dot glowing-dot-3"></div>
            <div className="glowing-dot glowing-dot-4"></div>
            <div className="glowing-dot glowing-dot-5"></div>

            {/* Electric current animations - visible on hover */}
            <div className="electric-container">
              <div className="electric-line electric-line-1"></div>
              <div className="electric-line electric-line-2"></div>
              <div className="electric-line electric-line-3"></div>
              <div className="electric-line electric-line-4"></div>
              <div className="electric-line-vertical electric-line-v1"></div>
              <div className="electric-line-vertical electric-line-v2"></div>
              <div className="electric-line-vertical electric-line-v3"></div>
              <div className="electric-line-vertical electric-line-v4"></div>
              <div className="electric-diagonal electric-diagonal-1"></div>
              <div className="electric-diagonal electric-diagonal-2"></div>
              <div className="electric-diagonal electric-diagonal-3"></div>
              <div className="electric-diagonal electric-diagonal-4"></div>
              <div className="electric-pulse electric-pulse-1"></div>
              <div className="electric-pulse electric-pulse-2"></div>
              <div className="electric-pulse electric-pulse-3"></div>
              <div className="electric-pulse electric-pulse-4"></div>
              <div className="electric-pulse electric-pulse-5"></div>
              <div className="electric-pulse electric-pulse-6"></div>
              <div className="electric-pulse electric-pulse-7"></div>
              <div className="electric-pulse electric-pulse-8"></div>
              <div className="electric-node electric-node-1"></div>
              <div className="electric-node electric-node-2"></div>
              <div className="electric-node electric-node-3"></div>
              <div className="electric-node electric-node-4"></div>
            </div>

            <div className="container mx-auto max-w-6xl relative z-10 px-4 md:px-6">
              <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
                <div className="flex flex-col space-y-8 order-1">
                  {/* Introducing badge with white background */}
                  <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-1.5 w-fit">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-400"></div>
                    <span className="text-gray-800 text-sm font-medium">Introducing Luciq AI</span>
                  </div>

                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider leading-tight">
                    <span className="bg-gradient-to-r from-teal-400 to-purple-500 text-transparent bg-clip-text">
                      Your Intelligent
                    </span>
                    <br />
                    <span className="text-white tracking-wide">Assistant</span>
                    <br />
                    <span className="text-white tracking-wide">Fully Automated</span>
                  </h1>

                  <p className="text-xl text-white/70 max-w-xl tracking-wide leading-relaxed">
                    Luciq AI helps you automate tasks, analyze data, and create content with unprecedented speed and
                    accuracy.
                  </p>

                  {/* Input box instead of buttons */}
                  <div className="relative max-w-md w-full">
                    <form onSubmit={handleHeroSubmit}>
                      <input
                        type="text"
                        placeholder="Ask Luciq AI to..."
                        className="w-full px-6 py-4 rounded-full bg-black/20 border border-teal-400/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50 pr-12"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-teal-400 to-purple-500 rounded-full text-white" disabled={isSubmitting || !inputValue.trim()}>
                        {isSubmitting ? <span className="animate-spin">⏳</span> : <ChevronRight className="h-5 w-5" />}
                      </button>
                    </form>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm text-white/50 mb-4">Trusted by innovative businesses worldwide</p>
                    <div className="flex space-x-3">
                      {/* Circles with unique avatar images */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400/20 to-purple-500/20 border border-white/10 overflow-hidden">
                        <Image src="/avatar1.png" alt="User 1" width={40} height={40} />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400/20 to-purple-500/20 border border-white/10 overflow-hidden">
                        <Image src="/avatar2.png" alt="User 2" width={40} height={40} />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400/20 to-purple-500/20 border border-white/10 overflow-hidden">
                        <Image src="/avatar3.png" alt="User 3" width={40} height={40} />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400/20 to-purple-500/20 border border-white/10 overflow-hidden">
                        <Image src="/avatar4.png" alt="User 4" width={40} height={40} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="order-2 relative flex justify-center items-center">
                  {/* Updated robot image with new image */}
                  <div className="w-full max-w-md">
                    <RobotImage />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section - Updated with new design */}
          <section id="features" className="w-full py-24 hero-bg border-t border-teal-400/10 bg-[#0a0a1f]">
            <div className="container mx-auto max-w-6xl px-4 md:px-6">
              <div className="text-center mb-16">
                <div className="inline-block bg-gradient-to-r from-teal-400/20 to-purple-500/20 rounded-full px-4 py-1 text-sm text-white/80 mb-4">
                  Everything you need to
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
                  <span className="bg-gradient-to-r from-teal-400 to-purple-500 text-transparent bg-clip-text">
                    SUPERCHARGE
                  </span>{" "}
                  Your Productivity
                </h2>
                <p className="max-w-[900px] mx-auto mt-4 text-white/70 text-xl">
                  Luciq AI combines cutting-edge artificial intelligence with an intuitive interface to help you work
                  smarter, not harder.
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    icon: <Zap className="h-10 w-10" />,
                    title: "AI-Powered Automation",
                    description:
                      "Automate repetitive tasks and workflows with intelligent AI that learns from your behavior and adapts to your needs.",
                    color: "from-purple-400 to-pink-400",
                  },
                  {
                    icon: <FileText className="h-10 w-10" />,
                    title: "Smart Document Processing",
                    description:
                      "Extract insights, summarize content, and generate reports from your documents with unprecedented accuracy.",
                    color: "from-blue-400 to-indigo-400",
                  },
                  {
                    icon: <Database className="h-10 w-10" />,
                    title: "Advanced Data Analysis",
                    description:
                      "Transform complex data into actionable insights with powerful analysis tools and beautiful visualizations.",
                    color: "from-teal-400 to-cyan-400",
                  },
                  {
                    icon: <MessageSquare className="h-10 w-10" />,
                    title: "Natural Language Processing",
                    description:
                      "Communicate with Luciq AI in plain English and get intelligent responses that understand context and intent.",
                    color: "from-purple-400 to-violet-400",
                  },
                  {
                    icon: <Link2 className="h-10 w-10" />,
                    title: "Business Integrations",
                    description:
                      "Connect with your favorite tools and platforms for a unified workflow that enhances productivity across your tech stack.",
                    color: "from-blue-400 to-teal-400",
                  },
                  {
                    icon: <Bell className="h-10 w-10" />,
                    title: "Smart Notifications",
                    description:
                      "Stay informed with intelligent alerts that prioritize what matters most to you and reduce notification fatigue.",
                    color: "from-pink-400 to-purple-400",
                  },
                ].map((feature, index) => (
                  <div key={index} className="feature-card group">
                    <div className={`feature-icon-container bg-gradient-to-br ${feature.color} p-3 rounded-xl mb-4`}>
                      <div className="feature-icon text-white">{feature.icon}</div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-white/70">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials Section - Updated with capitalized words in headline */}
          <section id="testimonials" className="w-full py-24 hero-bg border-t border-teal-400/10 bg-[#0a0a1f]">
            <div className="container mx-auto max-w-6xl px-4 md:px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
                  Trusted By{" "}
                  <span className="bg-gradient-to-r from-teal-400 to-purple-500 text-transparent bg-clip-text">
                    Innovative Businesses
                  </span>{" "}
                  Worldwide
                </h2>
                <p className="max-w-[900px] mx-auto mt-4 text-white/70 text-xl">
                  See What Our Users Are Saying About How Luciq AI Has Transformed Their Workflows And Boosted
                  Productivity.
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {[
                  {
                    quote:
                      "Luciq AI has completely transformed how our team handles data analysis. What used to take days now takes minutes, and the insights are far more comprehensive.",
                    name: "Sarah Johnson",
                    title: "Data Scientist at TechCorp",
                    avatar: "/avatar1.png",
                  },
                  {
                    quote:
                      "The natural language processing capabilities are mind-blowing. I can ask complex questions about our business data and get insightful answers immediately.",
                    name: "Michael Chen",
                    title: "Product Manager at InnovateCo",
                    avatar: "/avatar2.png",
                  },
                  {
                    quote:
                      "As a content creator, Luciq AI has been a game-changer. It helps me brainstorm ideas, refine my writing, and even suggests improvements I wouldn't have thought of.",
                    name: "Emily Rodriguez",
                    title: "Content Strategist at CreativeHub",
                    avatar: "/avatar3.png",
                  },
                ].map((testimonial, index) => (
                  <div key={index} className="testimonial-card">
                    <div className="mb-6">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-white/80 mb-6">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <Image
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="rounded-full mr-4"
                      />
                      <div>
                        <h4 className="font-semibold text-white">{testimonial.name}</h4>
                        <p className="text-sm text-white/60">{testimonial.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Section - Updated with gradient button only for Pro tier */}
          <section id="pricing" className="w-full py-24 hero-bg border-t border-teal-400/10 bg-[#0a0a1f]">
            <div className="container mx-auto max-w-6xl px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
                  <span className="bg-gradient-to-r from-teal-400 to-purple-500 text-transparent bg-clip-text">
                    Ready to transform
                  </span>{" "}
                  your workflow with AI?
                </h2>
                <p className="max-w-[900px] text-white/80 text-xl">
                  Join thousands of professionals who are saving time, increasing productivity, and unlocking new insights
                  with Luciq AI.
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {/* Free Tier */}
                <div className="pricing-card">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                    <div className="flex items-baseline mb-4">
                      <span className="text-4xl font-bold text-white">$0</span>
                      <span className="text-white/70 ml-2">/month</span>
                    </div>
                    <p className="text-white/70">Perfect for trying out Luciq AI</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-teal-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-white/90">30 minutes of usage per month</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-teal-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-white/90">Public projects only</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-teal-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-white/90">Basic model</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-teal-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-white/90">Limited capabilities</span>
                    </li>
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full border-teal-400/30 text-white hover:bg-teal-400/10 rounded-full"
                    onClick={handleGetStarted}
                  >
                    Get Started
                  </Button>
                </div>

                {/* Pro Tier - Only this tier has gradient button */}
                <div className="pricing-card popular relative">
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-teal-400 to-purple-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg rounded-tr-lg">
                    Popular
                  </div>
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                    <div className="flex items-baseline mb-4">
                      <span className="text-4xl font-bold text-white">$20</span>
                      <span className="text-white/70 ml-2">/month</span>
                    </div>
                    <p className="text-white/70">For professionals and small teams</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-teal-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-white/90">2 hours of usage per month</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-teal-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-white/90">Private projects</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-teal-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-white/90">Intelligent model</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-teal-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-white/90">Full Luciq capabilities</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-teal-400 to-purple-500 hover:opacity-90 text-white font-medium rounded-full" onClick={handleGetStarted}>
                    Get Started
                  </Button>
                </div>

                {/* Custom Tier */}
                <div className="pricing-card">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">Custom</h3>
                    <div className="flex items-baseline mb-4">
                      <span className="text-4xl font-bold text-white">{customPrice}</span>
                      <span className="text-white/70 ml-2">/month</span>
                    </div>
                    <p className="text-white/70">For organizations with advanced needs</p>
                  </div>

                  {/* Custom Tier Dropdown - Fixed with proper event handling */}
                  <div className="mb-6">
                    <p className="text-sm text-white/70 mb-2">Customize your monthly usage</p>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        className="w-full flex justify-between items-center px-4 py-3 bg-black/20 border border-teal-400/20 rounded-full text-white"
                        onClick={() => setShowDropdown(!showDropdown)}
                        aria-haspopup="listbox"
                        aria-expanded={showDropdown}
                      >
                        <span>{customTier}</span>
                        <ChevronDown className="h-5 w-5 text-teal-400" />
                      </button>

                      {showDropdown && (
                        <div
                          className="absolute z-10 w-full mt-1 bg-black/90 border border-teal-400/20 rounded-lg shadow-lg max-h-60 overflow-auto"
                          role="listbox"
                        >
                          {customTierOptions.map((option, index) => (
                            <button
                              key={index}
                              type="button"
                              className="w-full px-4 py-3 hover:bg-black/30 cursor-pointer flex items-center justify-between text-left"
                              onClick={() => handleTierSelect(option)}
                              role="option"
                              aria-selected={option === customTier}
                            >
                              <span className="text-white">{option}</span>
                              {option === customTier && <Check className="h-4 w-4 text-teal-400" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-teal-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-white/90">All Pro features</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-teal-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-white/90">Private projects</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-teal-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-white/90">Intelligent model</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-teal-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-white/90">Tool integration</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-teal-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-white/90">Customization options</span>
                    </li>
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full border-teal-400/30 text-white hover:bg-teal-400/10 rounded-full"
                    onClick={handleCustomTierCheckout}
                  >
                    Get Started
                  </Button>
                </div>
              </div>

              <div className="text-center mt-8 text-white/60 text-sm flex items-center justify-center">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-teal-400 mr-2" />
                  <p>No credit card required</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="w-full py-20 hero-bg border-t border-teal-400/10 bg-[#0a0a1f]">
            <div className="container mx-auto max-w-6xl px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-white">
                  Ready to transform your workflow?
                </h2>
                <p className="max-w-[600px] text-white/70 md:text-xl">
                  Get started with Luciq AI today and experience the future of intelligent assistance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button className="bg-gradient-to-r from-teal-400 to-purple-500 hover:opacity-90 text-white font-medium rounded-full" onClick={handleGetStarted}>
                    Get Started Free
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="border-teal-400/30 text-white hover:bg-teal-400/10 rounded-full" asChild>
                    <a href="mailto:hello@luciq.ai">Contact Sales</a>
                  </Button>
                </div>
              </div>
        </div>
          </section>
      </main>

        <footer className="w-full border-t border-teal-400/10 py-8 hero-bg bg-[#0a0a1f]">
          <div className="container mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Image src="/luciq-logo.png" alt="Luciq AI Logo" width={32} height={32} className="h-8 w-auto" />
                  <span className="text-lg font-semibold text-white">Luciq AI</span>
                </div>
                <p className="text-sm text-white/70">Your intelligent AI assistant for the digital age.</p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-4">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#features" className="text-sm text-white/70 hover:text-white transition-colors">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="#pricing" className="text-sm text-white/70 hover:text-white transition-colors">
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-white mb-4">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-white mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-teal-400/10 flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-white/50">&copy; {new Date().getFullYear()} Luciq AI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
