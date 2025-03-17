import Link from 'next/link'
import Image from 'next/image'

import { Container } from '@/components/Container'
import { Logo } from '@/components/Logo'
import { NavLink } from '@/components/NavLink'
import backgroundImage from '@/images/background-call-to-action.jpg'
import { Button } from './Button'

export function Footer() {
  return (
    <footer className="bg-slate-50">
    <div className="mx-auto">
      <section
        id="contact-us"
        className="relative overflow-hidden bg-blue-600 py-32 top-0"
      >
        <Image
          className="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
          src={backgroundImage}
          alt=""
          width={2347}
          height={1244}
          unoptimized
        />
        <Container className="relative">
          <div className="mx-auto max-w-lg text-center">
            <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
              Contact Us
            </h2>
            <p className="mt-4 text-lg tracking-tight text-white">
              We’d love to hear from you! Whether you have a question or
              want to explore AI transformation for your organization, reach
              out to us:
            </p>
            <div className="flex flex-col items-center gap-y-4 text-center">
              <div className="flex mt-4">
                <dt className="flex-none px-4">
                  <span className="sr-only">Telephone  </span>
                  <svg
                    className="h-7 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                    />
                  </svg>
                </dt>
                <dd>
                  <a className="text-white" href="tel:+1 (984) 259-4284">
                  +1 (984) 259-4284 (US) | +61 409 470 170 (Australia)
                  </a>
                </dd>
              </div>
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <span className="sr-only">Email</span>
                  <svg
                    className="h-7 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                </dt>
                <dd>
                  <a className="text-white" href="mailto:info@corpai.io">
                    info@corpai.io
                  </a>
                </dd>
              </div>
            </div>
            <p className="mt-8 text-lg tracking-tight text-white">
              Let’s shape the future of AI-driven enterprises together!
            </p>
          </div>
        </Container>
      </section>
      <div className="py-4">
        <Logo className="mx-auto h-75 w-auto" />
        <nav className="mt-10 text-sm" aria-label="quick links">
          <div className="-my-1 flex justify-center gap-x-6">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#secondary-features">Who we are</NavLink>
            <NavLink href="#faq">FAQs</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
          </div>
        </nav>
      </div>
    </div>
  </footer>
  )
}
