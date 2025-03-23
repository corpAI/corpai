'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import prod1 from '@/images/prod1.png'
import prod2 from '@/images/prod2.png'
import prod3 from '@/images/prod3.png'

const slides = [
  {
    id: 1,
    problem:
      'The core of any digital enterprise is its data. The data constitutes the primary business driver of the enterprise. These data sources are varied and still siloed. These data-sources are not AI enabled. Organizations still spend millions of dollars in building infrastructure and applications to interact with this data to solve their business needs. AI enablement for these data sources is still a big challenge.',
    image: prod3,
  },
  {
    id: 2,
    problem:
      'For any enterprise to run effectively, it needs a variety of third party enterprise applications (HRM, CRM, IT, Analytics, Developer and deployment tools etc). These enterprise applications are rapidly transforming into new and modern agentic AI solutions. These enterprise applications are drifting away from traditional UI/API ways of interaction for their customers. Using multiple agentic AI solutions in an enterprise from different third party enterprises leads to complex integrations, cost overrun, maintenance overhead, and agent smell in an enterprise.',
    image: prod2,
  },
  {
    id: 3,
    problem:
      'Enterprises have not yet adapted to the emerging AI technologies. AI agents and technologies are not yet proven to be safe, secure and compliant for enterprise adoption. Governance and risk is still a big concern with the adoption of AI agents.',
    image: prod1,
  },
  {
    id: 4,
    problem:
      'AI agents are rapidly growing and evolving. Enterprises, institutes, general public etc needs vetted, and secure AI registries to integrate and converse naturally with these agents and businesses.',
    image: prod1,
  },
]

export function Carousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const isTransitioning = useRef(false)
  const carouselRef = useRef<HTMLElement>(null)

  // Reset progress and transition state when activeIndex changes.
  useEffect(() => {
    setProgress(0)
    isTransitioning.current = false
  }, [activeIndex])

  // Timer effect: update progress only when not paused.
  useEffect(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
    }
    if (!isPaused) {
      intervalRef.current = window.setInterval(() => {
        setProgress((prevProgress) => {
          const nextProgress = prevProgress + 1
          if (nextProgress >= 100) {
            if (!isTransitioning.current) {
              isTransitioning.current = true
              setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length)
            }
            return 100 // Maintain full progress until slide change.
          }
          return nextProgress
        })
      }, 50)
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPaused, activeIndex])

  // Intersection Observer: Reset slideshow when the section becomes visible.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Reset slideshow when coming into view.
            setActiveIndex(0)
            setProgress(0)
            setIsPaused(false)
          }
        })
      },
      { threshold: 0.5 } // Adjust threshold as needed.
    )
    if (carouselRef.current) {
      observer.observe(carouselRef.current)
    }
    return () => {
      if (carouselRef.current) {
        observer.unobserve(carouselRef.current)
      }
    }
  }, [])

  // When clicking on another slide, reset pause state.
  const handleIndicatorClick = (index: number) => {
    if (index !== activeIndex && !isTransitioning.current) {
      setIsPaused(false)
      setActiveIndex(index)
    }
  }

  // Toggle pause/unpause on the active progress bar.
  const togglePause = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the outer indicator click.
    setIsPaused((prev) => !prev)
  }

  return (
    <section
      ref={carouselRef}
      className="relative h-[16%] w-full overflow-hidden py-30"
      id="problem-solution"
    >
      <div className="relative mx-auto h-full w-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === activeIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex h-full">
              <div className="flex w-[45%] flex-col justify-center p-8">
                <div className="mx-20 my-20 h-[80%] w-full rounded-[32px] bg-gray-800">
                  <div className="p-[5%] pr-[15%] font-display text-xl tracking-tight text-white sm:text-xl md:text-xl">
                    {slide.problem}
                  </div>
                </div>
              </div>

              <div className="relative flex w-[55%] items-center justify-center p-8">
                <div className="mx-20 my-20 h-[80%] w-full">
                  <Image
                    src={slide.image}
                    alt="Slide image"
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-[32px]"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 w-full flex justify-center z-30">
        <div className="relative px-4 py-2">
          <div className="pointer-events-none absolute inset-0" />
          <div className="relative flex space-x-3">
            {slides.map((_, indicatorIndex) => (
              <div
                key={indicatorIndex}
                onClick={() => handleIndicatorClick(indicatorIndex)}
                className={`relative h-3 cursor-pointer rounded-full transition-all duration-300 ${
                  indicatorIndex === activeIndex ? 'w-20 bg-slate-200' : 'w-3 bg-slate-400'
                }`}
              >
                {indicatorIndex === activeIndex && (
                  <div
                    onClick={togglePause}
                    className={`absolute left-0 top-0 h-full transition-all rounded-l-full ${
                      isPaused ? 'bg-blue-800' : 'bg-blue-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  >
                    {isPaused && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6 4h2v12H6zM12 4h2v12h-2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
