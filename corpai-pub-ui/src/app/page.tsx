"use client";

import { useEffect, useRef, useState } from 'react'
import { CallToAction } from '@/components/CallToAction'
import { Carousel } from '@/components/Caroussel'
import { Faqs } from '@/components/Faqs'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { PrimaryFeatures } from '@/components/PrimaryFeatures'
import ProblemSolutions from '@/components/ProblemSolutions'
import { TeamStackedCards } from '@/components/SecondaryFeatures'

export default function Home() {
  const [hasBg, setHasBg] = useState(false)
  const primaryFeatureRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (primaryFeatureRef.current) {
        const sectionTop = primaryFeatureRef.current.getBoundingClientRect().top
        setHasBg(sectionTop <= 72 && sectionTop >= -1289) // Adjust if header height is different
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          hasBg ? 'bg-white shadow-md' : 'bg-transparent'
        }`}
      >
        <Header />
      </div>
      <main className="mt-[72px] flex-grow">
        <Hero />
        {/* <ProblemSolutions /> */}
        <Carousel />
        <div ref={primaryFeatureRef}>
          <PrimaryFeatures />
        </div>
        <TeamStackedCards />
        <CallToAction />
        {/* <Pricing /> */}
        <Faqs />
        <Footer />
      </main>
    </div>
  )
}
