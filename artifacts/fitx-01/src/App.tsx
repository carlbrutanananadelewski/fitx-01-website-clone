import React, { useState, useEffect, useRef } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { X } from 'lucide-react';

const queryClient = new QueryClient();

// Reusable Accordion Component
function Accordion({ title, children, defaultOpen = false, type = 'text', paddingClass = "py-4 lg:px-0 lg:py-6", noBorder = false, titleClass = "text-[15px] lg:text-[17px]" }: { title: string, children: React.ReactNode, defaultOpen?: boolean, type?: 'text' | 'svg', paddingClass?: string, noBorder?: boolean, titleClass?: string }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`${noBorder ? '' : 'border-b border-hairline last:border-0'}`}>
      <button 
        type="button" 
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between gap-4 text-left ${paddingClass}`}
      >
        <span className={`font-display font-semibold ${titleClass}`}>{title}</span>
        {type === 'text' ? (
          <span aria-hidden="true" className="text-[18px] text-muted">
            {isOpen ? '−' : '+'}
          </span>
        ) : (
          <svg 
            width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" 
            className="shrink-0" aria-hidden="true"
          >
            <path d="M4 12h16"></path>
            {!isOpen && <path d="M12 4v16"></path>}
          </svg>
        )}
      </button>
      {isOpen && (
        <div className="pb-6 text-[14px] lg:text-[15px] leading-[1.6] text-muted">
          {children}
        </div>
      )}
    </div>
  );
}

// Checkout Modal Component
function CheckoutModal({
  isOpen,
  onClose,
  selectedColor,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedColor: string;
}) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        emailRef.current?.focus();
      }, 100);
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else {
      // reset form
      setEmail('');
      setPhone('');
      setError(null);
      setIsSubmitting(false);
      return undefined;
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          phone: phone.trim(),
          color: selectedColor
        })
      });
      
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.data?.checkoutUrl) {
        // friendly error matching original logic
        if (res.status === 429) {
          throw new Error('Too many attempts — please try again in a few minutes.');
        } else if (data?.code === 'INVALID_EMAIL') {
          throw new Error('Please check your email address.');
        } else if (typeof data?.code === 'string' && data.code.startsWith('SHOPIFY_')) {
          throw new Error('Checkout is temporarily unavailable.');
        } else {
          throw new Error("We couldn't start checkout. Please try again.");
        }
      }

      window.location.href = data.data.checkoutUrl;
    } catch (err: any) {
      setError(err.message || "We couldn't start checkout. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative w-full max-w-[440px] rounded-[24px] bg-white p-6 shadow-xl lg:p-8">
        <button 
          type="button" 
          onClick={onClose}
          className="absolute right-6 top-6 text-muted hover:text-ink focus:outline-none"
          aria-label="Close"
        >
          <X width={24} height={24} />
        </button>
        
        <h2 className="font-display text-[24px] font-bold leading-tight lg:text-[28px]">Order Your FitX 01</h2>
        <p className="mt-2 text-[15px] text-muted">Color: {selectedColor}</p>
        
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block">
            <span className="eyebrow text-[13px]">Email</span>
            <input
              ref={emailRef}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 h-[52px] w-full rounded-[10px] border border-hairline px-4 text-[15px] outline-none focus:border-ink"
            />
          </label>
          <label className="block">
            <span className="eyebrow text-[13px]">Mobile (optional)</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 123 4567"
              className="mt-2 h-[52px] w-full rounded-[10px] border border-hairline px-4 text-[15px] outline-none focus:border-ink"
            />
          </label>
          
          {error && (
            <p role="alert" className="text-[14px] text-[#c0392b]">{error}</p>
          )}
          
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="btn-dark h-[56px] w-full mt-2"
          >
            {isSubmitting ? "Starting checkout…" : "Continue to checkout — $299"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Main Page Component
function FitXPage() {
  const [activeImage, setActiveImage] = useState('01-main');
  const [selectedColor, setSelectedColor] = useState('White');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cookieConsentOpen, setCookieConsentOpen] = useState(true);
  const [founderFormOpen, setFounderFormOpen] = useState(false);
  const [founderMessage, setFounderMessage] = useState('');
  const [founderSubmitted, setFounderSubmitted] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  useEffect(() => {
    document.title = "FitX 01 — $299 | Custom Running Shoes From Your Foot Scan";
  }, []);

  const thumbnails = [
    '01-main', '02-side', '03-top', '04-heel', '05-front', '06-midsole', '07-knit'
  ];

  const handleFounderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFounderSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-ground text-ink" style={{ paddingBottom: cookieConsentOpen ? '91px' : '0' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-hairline bg-ground/90 backdrop-blur">
        <div className="shell flex h-[72px] items-center justify-between">
          <a aria-label="FitX home" className="shrink-0" href="/">
            <img alt="FitX" className="h-[30px] w-auto" src="/images/logo.png" />
          </a>
          <nav className="hidden items-center gap-9 md:flex">
            <a className="text-[15px] text-ink hover:text-muted transition-colors" href="#how-it-works">How It Works</a>
            <a className="text-[15px] text-ink hover:text-muted transition-colors" href="#technology">Technology</a>
            <a className="text-[15px] text-ink hover:text-muted transition-colors" href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-4">
            <a className="hidden text-[14px] text-muted hover:text-ink sm:inline transition-colors" href="/account">Sign in</a>
            <button type="button" className="btn-dark h-[48px] px-6 text-[14px]" onClick={() => setCheckoutModalOpen(true)}>Order Your FitX 01</button>
            <button 
              type="button" 
              aria-label="Menu" 
              aria-expanded={isMenuOpen} 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X width="22" height="22" />
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M3 12h18M3 18h18"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[72px] z-30 bg-ground p-6 md:hidden">
          <nav className="flex flex-col gap-6">
            <a className="text-[18px] font-semibold text-ink" href="#how-it-works" onClick={() => setIsMenuOpen(false)}>How It Works</a>
            <a className="text-[18px] font-semibold text-ink" href="#technology" onClick={() => setIsMenuOpen(false)}>Technology</a>
            <a className="text-[18px] font-semibold text-ink" href="#faq" onClick={() => setIsMenuOpen(false)}>FAQ</a>
            <a className="text-[18px] font-semibold text-muted" href="/account" onClick={() => setIsMenuOpen(false)}>Sign in</a>
          </nav>
        </div>
      )}

      <main className="pb-24">
        {/* PDP Buy Box */}
        <section data-section="pdp_buy_box" className="shell grid gap-12 py-10 lg:grid-cols-2 lg:gap-x-20">
          <div className="min-w-0">
            <div className="overflow-hidden rounded-[40px] bg-[#e6e6e8]">
              <picture className="contents">
                <img 
                  alt="Three-quarter view of a pair of white FitX 01 running shoes." 
                  className="aspect-[624/570] w-full object-contain" 
                  src={activeImage === '01-main' ? '/images/gallery/01-main.jpg' : `/images/gallery/thumbnails/${activeImage}.jpg`} 
                />
              </picture>
            </div>
            
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {thumbnails.map((thumb) => (
                <button 
                  key={thumb}
                  type="button" 
                  aria-label={`Show ${thumb.split('-')[1]} view`} 
                  aria-pressed={activeImage === thumb} 
                  onClick={() => setActiveImage(thumb)}
                  className={`h-[83px] w-[83px] shrink-0 overflow-hidden rounded-[16px] bg-[#f5f5f7] ${activeImage === thumb ? 'ring-1 ring-ink' : ''}`}
                >
                  <picture className="contents">
                    <img alt="" className="h-full w-full object-contain" src={`/images/gallery/thumbnails/${thumb}.jpg`} />
                  </picture>
                </button>
              ))}
            </div>
            
            <dl className="mt-8 flex justify-between gap-6">
              <div>
                <dt className="font-display text-[14px] font-semibold">Weight</dt>
                <dd className="mt-1 text-[14px] text-muted">10.1 oz (286 g) per shoe · Men’s US 9</dd>
              </div>
              <div>
                <dt className="font-display text-[14px] font-semibold">Heel-to-toe drop</dt>
                <dd className="mt-1 text-[14px] text-muted">12mm</dd>
              </div>
              <div>
                <dt className="font-display text-[14px] font-semibold">Upper material</dt>
                <dd className="mt-1 text-[14px] text-muted">Engineered mesh</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h1 className="h-display text-[40px] uppercase lg:text-[46px]">FitX 01</h1>
            <p className="mt-4 font-display text-[19px] font-semibold">Running shoes built around your feet.</p>
            <p className="h-display mt-4 text-[28px] lg:text-[32px]">$299</p>
            
            <div className="mt-5">
              <p className="text-[14px] text-muted">Color</p>
              <div className="mt-3 flex gap-3">
                <button 
                  type="button" 
                  aria-label="White" 
                  aria-pressed={selectedColor === 'White'}
                  onClick={() => setSelectedColor('White')}
                  className={`h-8 w-8 rounded-full border border-black/10 ${selectedColor === 'White' ? 'ring-2 ring-ink ring-offset-2 ring-offset-ground' : ''}`} 
                  style={{ background: 'rgb(255, 255, 255)' }}
                ></button>
                <button 
                  type="button" 
                  aria-label="Black" 
                  aria-pressed={selectedColor === 'Black'}
                  onClick={() => setSelectedColor('Black')}
                  className={`h-8 w-8 rounded-full border border-black/10 ${selectedColor === 'Black' ? 'ring-2 ring-ink ring-offset-2 ring-offset-ground' : ''}`} 
                  style={{ background: 'rgb(26, 26, 26)' }}
                ></button>
              </div>
              <p className="mt-2 text-[14px] text-muted">{selectedColor}</p>
            </div>
            
            <p className="mt-5 text-[15px] leading-[1.6] text-muted">
              Order now. Scan both feet with your phone after checkout. Your measurements and fit input guide your pair.
            </p>
            
            <div className="mt-5 rounded-[16px] border border-hairline bg-white p-6">
              <div className="flex gap-3">
                <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ground text-ink">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="5" width="18" height="16" rx="3"></rect>
                    <path d="M8 3v4M16 3v4M3 10h18"></path>
                  </svg>
                </span>
                <div>
                  <p className="text-[13px] text-muted">Estimated delivery</p>
                  <p className="mt-1 font-display text-[14px] font-semibold">8–10 weeks after you confirm your Fit Profile</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ground text-ink">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="m5 12.5 4.5 4.5L19 7"></path>
                  </svg>
                </span>
                <div>
                  <p className="text-[14px] text-muted">Eligible fit remakes at no additional cost</p>
                  <a href="/FitX_Fit_Guarantee.pdf" target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[14px] underline underline-offset-4">Fit Guarantee</a>
                </div>
              </div>
            </div>
            
            <button type="button" className="btn-dark mt-4 h-[64px] w-full" onClick={() => setCheckoutModalOpen(true)}>Order Your FitX 01</button>
            <p className="mt-4 text-center text-[13px] text-muted">No size or width to choose</p>
            
            <div className="mt-10 border-t border-hairline">
              <Accordion title="Product Details" paddingClass="py-4">
                The FitX 01 features a custom-knit upper combined with a 3D-printed lattice midsole, engineered precisely to the contours of your feet and your unique biomechanical data.
              </Accordion>
              <Accordion title="Fit Guarantee" paddingClass="py-4">
                If the fit isn’t right, we remake it. At no additional cost. Tell us what doesn’t feel right, and we'll use your feedback to adjust your fit and remake your shoes as needed.
              </Accordion>
            </div>
          </div>
        </section>

        {/* Build Section */}
        <section id="technology" data-section="pdp_build" className="shell py-16 lg:py-20">
          <h2 className="h-display text-[32px] sm:text-[40px] lg:text-[44px]">Built to run. Built for you.</h2>
          <picture className="contents">
            <img alt="The FitX 01 shown as separate parts: knit upper, lime green 3D-printed lattice midsole, foam base and TPU outsole." width="2640" height="1760" className="mt-10 aspect-[1320/880] w-full rounded-[4px] object-contain" src="/images/pdp-build-exploded.jpg" />
          </picture>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            <div>
              <Accordion title="Upper" paddingClass="" noBorder={true} titleClass="text-[19px]">
                A highly adaptive engineered mesh that maps to the unique topography of your feet for targeted support and breathability where you need it most.
              </Accordion>
              <p className="mt-4 text-[14px] font-semibold">Light, breathable comfort</p>
            </div>
            <div>
              <Accordion title="Midsole" paddingClass="" noBorder={true} titleClass="text-[19px]">
                A dual-layer setup featuring a 3D-printed lattice tuned to your biomechanics, paired with responsive foam for a seamlessly integrated ride.
              </Accordion>
              <p className="mt-4 text-[14px] font-semibold">Two layers. One integrated ride.</p>
            </div>
            <div>
              <Accordion title="Outsole" paddingClass="" noBorder={true} titleClass="text-[19px]">
                High-abrasion TPU strategically placed for durability and traction based on typical wear patterns and road conditions.
              </Accordion>
              <p className="mt-4 text-[14px] font-semibold">Durable traction, built for the road</p>
            </div>
          </div>
        </section>

        {/* Precision Section */}
        <section data-section="pdp_individual" className="shell py-16 lg:py-20">
          <h2 className="h-display text-[32px] sm:text-[40px] lg:text-[44px]">Built around your individual feet</h2>
          <p className="mt-5 max-w-[520px] text-[15px] leading-[1.6] text-muted">Your scan and fit inputs guide how your FitX 01 is built for you.</p>
          <picture className="contents">
            <img alt="The FitX 01 opened into its layers around a foot model: knit upper, lime green 3D-printed lattice midsole and foam base." width="2418" height="1265" loading="lazy" decoding="async" className="mx-auto mt-10 aspect-[2418/1265] w-full max-w-[1209px] rounded-[4px] object-contain" src="/images/pdp-precision-lockdown.jpg" />
          </picture>
        </section>

        {/* Steps Section */}
        <section id="how-it-works" data-section="after_buy" className="shell py-16 lg:py-20">
          <h2 className="h-display text-[32px] sm:text-[40px] lg:text-[44px]">What happens after you buy</h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[14px]">
            <div>
              <div aria-hidden="true" className="font-mono text-[64px] font-bold leading-none tracking-[0.1em] text-black/[0.07]">01</div>
              <img alt="Person scanning their bare feet with a phone" className="mt-6 aspect-[431/437] w-full rounded-[16px] object-cover" src="/images/step-02-scan.jpg" />
              <h3 className="mt-8 font-display text-[19px] font-semibold">Scan + Fit Inputs</h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-muted">We capture your feet in 3D and learn how you experience fit.</p>
            </div>
            <div>
              <div aria-hidden="true" className="font-mono text-[64px] font-bold leading-none tracking-[0.1em] text-black/[0.07]">02</div>
              <img alt="Phone showing a completed Fit Profile" className="mt-6 aspect-[431/437] w-full rounded-[16px] object-cover" src="/images/step-03-personalize.jpg" />
              <h3 className="mt-8 font-display text-[19px] font-semibold">We personalize your fit</h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-muted">Your foot shape and fit inputs determine the fit for your pair.</p>
            </div>
            <div>
              <div aria-hidden="true" className="font-mono text-[64px] font-bold leading-none tracking-[0.1em] text-black/[0.07]">03</div>
              <img alt="Runner on a path wearing FitX 01" className="mt-6 aspect-[431/437] w-full rounded-[16px] object-cover" src="/images/step-04-build.jpg" />
              <h3 className="mt-8 font-display text-[19px] font-semibold">We build your FitX 01</h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-muted">Your personalized pair is made for you.</p>
            </div>
          </div>
        </section>

        {/* Fit Guarantee Callout */}
        <section data-section="fit_guarantee" className="bg-ink text-white">
          <div className="shell grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
            <h2 className="h-display max-w-[553px] text-[38px] lg:text-[54px]">If the fit isn’t right, we remake it.</h2>
            <div>
              <p className="h-display text-[30px] lg:text-[40px]">At no additional cost</p>
              <p className="mt-6 max-w-[636px] text-[14px] leading-[1.7] text-white/70">
                Tell us what doesn’t feel right. We’ll use your feedback to adjust your fit and remake your shoes as needed. There is no preset limit on eligible fit remakes while we work with you to get the fit right.
              </p>
              <a href="/FitX_Fit_Guarantee.pdf" target="_blank" rel="noopener noreferrer" className="mt-6 inline-block text-[14px] underline underline-offset-4 hover:text-white transition-colors">Read the Fit Guarantee</a>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="shell py-20 lg:py-24">
          <h2 className="h-display text-[38px] lg:text-[48px]">FAQ</h2>
          <div className="mt-10 overflow-hidden rounded-[20px] border border-hairline bg-white">
            <div>
              <Accordion title="Why don’t I choose a size or width?" defaultOpen={true} type="svg" paddingClass="px-6 py-6 lg:px-10" titleClass="text-[17px] lg:text-[18px]">
                <p className="max-w-[880px] px-6 lg:px-10">We start with your feet, not a standard size chart. After checkout, you’ll scan both feet with your phone and answer a few questions about how your shoes fit and feel. Together, your scans and fit inputs guide how we personalize the fit of your FitX 01.</p>
              </Accordion>
            </div>
            <div className="border-t border-hairline">
              <Accordion title="What does FitX personalize?" type="svg" paddingClass="px-6 py-6 lg:px-10" titleClass="text-[17px] lg:text-[18px]">
                <p className="max-w-[880px] px-6 lg:px-10">We personalize the shape of the engineered knit upper and the support profile of the 3D-printed midsole based on your foot scan and individual fit preferences.</p>
              </Accordion>
            </div>
            <div className="border-t border-hairline">
              <Accordion title="How does the 3D foot scan work?" type="svg" paddingClass="px-6 py-6 lg:px-10" titleClass="text-[17px] lg:text-[18px]">
                <p className="max-w-[880px] px-6 lg:px-10">You'll use your smartphone's camera to capture a series of images of your bare feet. Our software uses these images to build a highly accurate 3D model of your feet in minutes.</p>
              </Accordion>
            </div>
            <div className="border-t border-hairline">
              <Accordion title="What if the fit isn’t right?" type="svg" paddingClass="px-6 py-6 lg:px-10" titleClass="text-[17px] lg:text-[18px]">
                <p className="max-w-[880px] px-6 lg:px-10">We offer a comprehensive Fit Guarantee. If your shoes don't fit perfectly, we will use your feedback to adjust the design and remake them at no additional cost to you.</p>
              </Accordion>
            </div>
            <div className="border-t border-hairline">
              <Accordion title="When will I receive my shoes?" type="svg" paddingClass="px-6 py-6 lg:px-10" titleClass="text-[17px] lg:text-[18px]">
                <p className="max-w-[880px] px-6 lg:px-10">Once you complete your foot scan and confirm your Fit Profile, it typically takes 8–10 weeks to custom-build your pair and deliver them to your door.</p>
              </Accordion>
            </div>
            <div className="border-t border-hairline">
              <Accordion title="Do I need special equipment to scan?" type="svg" paddingClass="px-6 py-6 lg:px-10" titleClass="text-[17px] lg:text-[18px]">
                <p className="max-w-[880px] px-6 lg:px-10">No special equipment is required. You just need a modern smartphone (iOS or Android) and a piece of standard 8.5"x11" or A4 paper to serve as a size reference.</p>
              </Accordion>
            </div>
            <div className="border-t border-hairline">
              <Accordion title="Is FitX a medical or orthotic product?" type="svg" paddingClass="px-6 py-6 lg:px-10" titleClass="text-[17px] lg:text-[18px]">
                <p className="max-w-[880px] px-6 lg:px-10">No, the FitX 01 is designed as a personalized running shoe for general use and fitness. It is not intended to diagnose, treat, cure, or prevent any medical condition.</p>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Ask Founder Section */}
        <section data-section="ask_founder" className="shell pb-10 lg:pb-20">
          <div className="flex flex-col gap-6 rounded-[24px] border border-hairline bg-white p-6 lg:p-10">
            <div className="relative flex items-center gap-4 lg:gap-6">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="text-[12px] font-semibold uppercase leading-4 tracking-[0.08em]">FitX · Ask the Founder</p>
                <h2 className="text-[24px] font-bold leading-8 lg:text-[32px] lg:leading-10">
                  <button 
                    type="button" 
                    aria-expanded={founderFormOpen} 
                    onClick={() => setFounderFormOpen(!founderFormOpen)}
                    className="text-left after:absolute after:inset-0 after:content-[''] focus:outline-none"
                  >
                    What would help you decide?
                  </button>
                </h2>
                <p className="text-[16px] leading-6 text-muted">Get a personal reply from Jennie, our co-founder.</p>
              </div>
              <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-[24px] font-bold leading-8 text-ink">
                {founderFormOpen ? '−' : '+'}
              </span>
            </div>
            
            {founderFormOpen && (
              <div className="mt-4 pt-4 border-t border-hairline relative z-10">
                {founderSubmitted ? (
                  <div className="bg-field p-4 rounded-lg text-center">
                    <p className="font-semibold text-ink">Message sent!</p>
                    <p className="text-muted text-sm mt-1">Jennie will get back to you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleFounderSubmit} className="flex flex-col gap-4">
                    <textarea 
                      className="w-full rounded-lg border border-hairline p-4 min-h-[120px] focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
                      placeholder="I'm wondering about..."
                      required
                      value={founderMessage}
                      onChange={(e) => setFounderMessage(e.target.value)}
                    ></textarea>
                    <button type="submit" className="btn-dark self-start px-8 py-3 h-auto">Send Message</button>
                  </form>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Closing CTA */}
        <section data-section="closing_cta" className="bg-ink text-white">
          <div className="shell grid items-center gap-8 py-16 lg:grid-cols-2 lg:py-20">
            <picture className="contents">
              <img alt="FitX 01 personalized running shoe" width="1390" height="697" className="w-full object-contain" src="/images/cta-shoe.png" />
            </picture>
            <div>
              <p className="font-display text-[15px] font-semibold text-white/70">FitX 01</p>
              <h2 className="h-display mt-8 max-w-[458px] text-[38px] lg:text-[54px]">Built around your feet.</h2>
              <button type="button" className="btn-invert btn-lg mt-10" onClick={() => setCheckoutModalOpen(true)}>Order Your FitX 01 - $299</button>
              <div className="mt-5 space-y-1 text-[14px] text-white/70">
                <p>Scan both feet after checkout</p>
                <p>Estimated delivery: 8–10 weeks after you confirm your Fit Profile</p>
              </div>
              <a href="/FitX_Fit_Guarantee.pdf" target="_blank" rel="noopener noreferrer" className="mt-5 inline-block text-[14px] underline underline-offset-4 hover:text-white transition-colors">Fit Guarantee</a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline bg-ground">
        <div className="shell flex flex-col gap-6 py-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-12 gap-y-2">
            <img alt="FitX" className="h-[30px] w-auto" src="/images/logo.png" />
            <a href="mailto:hello@fitxlab.com" className="text-[13px] text-muted underline-offset-4 hover:text-ink hover:underline">Questions? hello@fitxlab.com</a>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-muted">
            <span>© 2026 FitX Brands Inc. All rights reserved.</span>
            <a href="/FitX_Fit_Guarantee.pdf" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-ink">Fit Guarantee</a>
            <a href="/Terms_of_Service.pdf" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-ink">Terms</a>
            <a href="/Privacy_Policy.pdf" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-ink">Privacy</a>
            <a href="mailto:hello@fitxlab.com" className="underline underline-offset-4 hover:text-ink">Contact</a>
            <button type="button" className="underline underline-offset-4 hover:text-ink">Your Privacy Choices</button>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Modal */}
      {cookieConsentOpen && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="consent-heading-intro" 
          aria-describedby="consent-description" 
          style={{ position: 'fixed', bottom: '0px', left: '0px', right: '0px', zIndex: 9999, background: 'rgb(255, 255, 255)', borderTop: '1px solid rgb(229, 229, 229)', boxShadow: 'rgba(0, 0, 0, 0.1) 0px -4px 20px' }}
        >
          <div style={{ maxWidth: '1200px', margin: '0px auto', padding: '24px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
              <h2 id="consent-heading-intro" style={{ position: 'absolute', width: '1px', height: '1px', padding: '0px', margin: '-1px', overflow: 'hidden', clip: 'rect(0px, 0px, 0px, 0px)', whiteSpace: 'nowrap', border: '0px' }}>Cookie consent</h2>
              <p id="consent-description" style={{ flex: '1 1 400px', margin: '0px', fontSize: '14px', color: 'rgb(51, 51, 51)', lineHeight: '1.5' }}>
                We use cookies to improve your experience, analyze site traffic, and personalize content. You can choose which cookies to allow.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={() => setCookieConsentOpen(false)} style={{ background: 'none', border: '1px solid rgb(204, 204, 204)', borderRadius: '6px', padding: '10px 20px', fontSize: '13px', color: 'rgb(51, 51, 51)', cursor: 'pointer', fontWeight: 500 }}>Manage Preferences</button>
                <button onClick={() => setCookieConsentOpen(false)} style={{ background: 'none', border: '1px solid rgb(204, 204, 204)', borderRadius: '6px', padding: '10px 20px', fontSize: '13px', color: 'rgb(51, 51, 51)', cursor: 'pointer', fontWeight: 500 }}>Reject All</button>
                <button onClick={() => setCookieConsentOpen(false)} style={{ background: 'rgb(0, 0, 0)', border: '1px solid rgb(0, 0, 0)', borderRadius: '6px', padding: '10px 20px', fontSize: '13px', color: 'rgb(255, 255, 255)', cursor: 'pointer', fontWeight: 600 }}>Accept All</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={checkoutModalOpen} 
        onClose={() => setCheckoutModalOpen(false)} 
        selectedColor={selectedColor} 
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Switch>
          <Route path="/" component={FitXPage} />
          <Route>
            <div className="min-h-screen flex items-center justify-center flex-col gap-4">
              <h1 className="text-2xl font-bold">404 Not Found</h1>
              <a href="/" className="text-blue-600 underline">Return Home</a>
            </div>
          </Route>
        </Switch>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
