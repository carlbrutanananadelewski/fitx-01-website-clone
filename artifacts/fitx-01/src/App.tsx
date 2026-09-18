import React, { useState } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();
const DEPOSIT_CHECKOUT_URL = '{{DEPOSIT_CHECKOUT_URL}}';

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

// Main Page Component
function FitXPage() {
  const [activeImage, setActiveImage] = useState('01-main');
  const [selectedColor, setSelectedColor] = useState('White');
  const [founderFormOpen, setFounderFormOpen] = useState(false);
  const [founderMessage, setFounderMessage] = useState('');
  const [founderSubmitted, setFounderSubmitted] = useState(false);

  const thumbnails = [
    '01-main', '02-side', '03-top', '04-heel', '05-front', '06-midsole', '07-knit'
  ];
  const galleryBase = selectedColor === 'Black'
    ? '/images/gallery/black'
    : '/images/gallery';

  const handleFounderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFounderSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-ground text-ink">
      <main className="pb-24">
        {/* PDP Reserve Box */}
        <section data-section="pdp_buy_box" className="shell grid gap-12 py-10 lg:grid-cols-2 lg:gap-x-20">
          <div className="min-w-0">
            <div className="overflow-hidden rounded-[40px] bg-[#e6e6e8]">
              <picture className="contents">
                <img 
                  alt={`${activeImage.split('-')[1]} view of the ${selectedColor.toLowerCase()} FitX 01 running shoes.`}
                  className="aspect-[624/570] w-full object-contain" 
                  src={`${galleryBase}/${activeImage}.jpg`}
                />
              </picture>
            </div>
            
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-7">
              {thumbnails.map((thumb) => (
                <button 
                  key={thumb}
                  type="button" 
                  aria-label={`Show ${thumb.split('-')[1]} view`} 
                  aria-pressed={activeImage === thumb} 
                  onClick={() => setActiveImage(thumb)}
                  className={`aspect-square min-w-0 overflow-hidden rounded-[16px] border-2 bg-[#f5f5f7] transition-colors ${activeImage === thumb ? 'border-ink' : 'border-transparent'}`}
                >
                  <picture className="contents">
                    <img alt="" className="h-full w-full object-contain" src={`${galleryBase}/thumbnails/${thumb}.jpg`} />
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
            <p className="mt-4 font-display text-[19px] font-semibold">Built from a scan of both your feet. Not a size.</p>
            <p className="h-display mt-4 text-[28px] lg:text-[32px]">$29</p>
            <p className="mt-2 text-[14px] text-muted">Refundable deposit. Reserves your pair.</p>
            
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
              Reserve with $29. Then scan both feet with your phone. Your scan is what your pair is built from.
            </p>
            
            <div className="mt-5 rounded-[16px] border border-hairline bg-white p-6">
              <div className="flex gap-3">
                <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ground text-ink">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="m5 12.5 4.5 4.5L19 7"></path>
                  </svg>
                </span>
                <div>
                  <p className="text-[14px] text-muted">Wrong fit? We remake it. No extra cost.</p>
                  <a href="/FitX_Fit_Guarantee.pdf" target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[14px] underline underline-offset-4">Fit Guarantee</a>
                </div>
              </div>
            </div>
            
            <a className="btn-dark mt-4 h-[64px] w-full" href={DEPOSIT_CHECKOUT_URL}>Reserve your FitX 01</a>
            <p className="mt-4 text-center text-[13px] text-muted">
              No size or width to choose
              <span className="mt-1 block">Cancel any time before production starts. Full refund.</span>
            </p>
            
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
          <div className="mt-8 text-center">
            <a className="btn-dark btn-lg inline-flex min-w-[220px]" href={DEPOSIT_CHECKOUT_URL}>Reserve now</a>
          </div>
        </section>

        {/* Steps Section */}
        <section id="how-it-works" data-section="after_buy" className="shell py-16 lg:py-20">
          <h2 className="h-display text-[32px] sm:text-[40px] lg:text-[44px]">What happens after you reserve</h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[14px]">
            <div>
              <div aria-hidden="true" className="font-mono text-[64px] font-bold leading-none tracking-[0.1em] text-black/[0.07]">01</div>
              <img alt="FitX 01 running shoe" className="mt-6 aspect-[431/437] w-full rounded-[16px] object-contain" src="/images/cta-shoe.png" />
              <h3 className="mt-8 font-display text-[19px] font-semibold">Reserve.</h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-muted">$29 holds your pair. Refundable.</p>
            </div>
            <div>
              <div aria-hidden="true" className="font-mono text-[64px] font-bold leading-none tracking-[0.1em] text-black/[0.07]">02</div>
              <img alt="Person scanning their bare feet with a phone" className="mt-6 aspect-[431/437] w-full rounded-[16px] object-cover" src="/images/step-02-scan.jpg" />
              <h3 className="mt-8 font-display text-[19px] font-semibold">Scan.</h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-muted">Both feet, your phone, a few minutes. We send the link.</p>
            </div>
            <div>
              <div aria-hidden="true" className="font-mono text-[64px] font-bold leading-none tracking-[0.1em] text-black/[0.07]">03</div>
              <img alt="Phone showing a completed Fit Profile" className="mt-6 aspect-[431/437] w-full rounded-[16px] object-cover" src="/images/step-03-personalize.jpg" />
              <h3 className="mt-8 font-display text-[19px] font-semibold">Confirm.</h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-muted">Look over your Fit Profile. Say yes.</p>
            </div>
            <div>
              <div aria-hidden="true" className="font-mono text-[64px] font-bold leading-none tracking-[0.1em] text-black/[0.07]">04</div>
              <img alt="Runner on a path wearing FitX 01" className="mt-6 aspect-[431/437] w-full rounded-[16px] object-cover" src="/images/step-04-build.jpg" />
              <h3 className="mt-8 font-display text-[19px] font-semibold">Build.</h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-muted">We make your pair from your scan. Left and right, each on its own.</p>
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
              <Accordion title="What does $29 get me?" defaultOpen={true} type="svg" paddingClass="px-6 py-6 lg:px-10" titleClass="text-[17px] lg:text-[18px]">
                <p className="max-w-[880px] px-6 lg:px-10">Your spot for a pair of the FitX 01, your foot scan, and your Fit Profile. The $29 is refundable any time before production starts.</p>
              </Accordion>
            </div>
            <div className="border-t border-hairline">
              <Accordion title="Can I get my $29 back?" type="svg" paddingClass="px-6 py-6 lg:px-10" titleClass="text-[17px] lg:text-[18px]">
                <p className="max-w-[880px] px-6 lg:px-10">Yes. Cancel any time before we start making your pair and we refund the full $29.</p>
              </Accordion>
            </div>
            <div className="border-t border-hairline">
              <Accordion title="Why don’t I choose a size or width?" defaultOpen={true} type="svg" paddingClass="px-6 py-6 lg:px-10" titleClass="text-[17px] lg:text-[18px]">
                <p className="max-w-[880px] px-6 lg:px-10">We start with your feet, not a standard size chart. After you reserve, you’ll scan both feet with your phone and answer a few questions about how your shoes fit and feel. Together, your scans and fit inputs guide how we personalize the fit of your FitX 01.</p>
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
              <a className="btn-invert btn-lg mt-10" href={DEPOSIT_CHECKOUT_URL}>Reserve for $29</a>
              <div className="mt-5 space-y-1 text-[14px] text-white/70">
                <p>Scan both feet after you reserve</p>
                <p>Refundable until production starts</p>
              </div>
              <a href="/FitX_Fit_Guarantee.pdf" target="_blank" rel="noopener noreferrer" className="mt-5 inline-block text-[14px] underline underline-offset-4 hover:text-white transition-colors">Fit Guarantee</a>
            </div>
          </div>
        </section>
      </main>

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
