'use client'

import * as React from 'react'
import { Navbar } from './navbar'
import { Hero } from './hero'
import { LiveDemo } from './live-demo'
import { ModulesSection } from './modules'
import { PermissionsSection } from './permissions-section'
import { ReportsSection } from './reports-section'
import { SecuritySection } from './security-section'
import { ScreenshotsSlider } from './screenshots'
import { VideoSection } from './video-section'
import { WhyUs } from './why-us'
import { Testimonials } from './testimonials'
import { FAQ } from './faq'
import { Pricing } from './pricing'
import { CTA } from './cta'
import { Footer } from './footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <LiveDemo />
        <ModulesSection />
        <PermissionsSection />
        <ReportsSection />
        <SecuritySection />
        <ScreenshotsSlider />
        <VideoSection />
        <WhyUs />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
