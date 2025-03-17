import Image from 'next/image'

import { Container } from '@/components/Container'
import backgroundImage from '@/images/background-faqs.jpg'

const faqs = [
  [
    {
      question: 'How does CorpAI help businesses adopt AI?',
      answer:
        'CorpAI simplifies AI adoption by integrating intelligent, agentic AI solutions into your existing enterprise systems, enabling natural language interactions and automation.',
    },
    {
      question: 'Do I need to replace my existing enterprise applications to use CorpAI?',
      answer: 'No, CorpAI seamlessly integrates with your current infrastructure, enhancing your existing applications without requiring a complete overhaul.',
    },
    {
      question: 'What industries does CorpAI cater to?',
      answer:
        'CorpAI is designed for any data-driven organization, including finance, healthcare, e-commerce, logistics, and technology enterprises.',
    },
  ],
  [
    {
      question: 'Is CorpAI a cloud-based platform?',
      answer:
        'Yes, CorpAI is cloud-native, ensuring scalability, security, and seamless updates. We also offer on-premise solutions for enterprises with strict compliance needs.',
    },
    {
      question:
        'How does CorpAI ensure data security?',
      answer:
        'We follow enterprise-grade security protocols, including end-to-end encryption, role-based access control (RBAC), and compliance with GDPR, HIPAA, and SOC 2 standards.',
    },
    {
      question:
        'Does CorpAI store my business data?',
      answer:
        'No, CorpAI processes data securely without storing sensitive business information unless explicitly configured for analytics and optimization purposes.',
    },
  ],
  [
    {
      question: 'Can CorpAI be used in highly regulated industries?',
      answer:
        'Yes, CorpAI is designed with compliance in mind, supporting industries with stringent data security and regulatory requirements.',
    },
  ],
]

export function Faqs() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative overflow-hidden bg-slate-50 py-20 sm:py-32"
    >
      <Image
        className="absolute top-0 left-1/2 max-w-none -translate-y-1/4 translate-x-[-30%]"
        src={backgroundImage}
        alt=""
        width={1558}
        height={946}
        unoptimized
      />
      <Container className="relative">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2
            id="faq-title"
            className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl"
          >
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            If you can’t find what you’re looking for, email our support team
            and if you’re lucky someone will get back to you.
          </p>
        </div>
        <ul
          role="list"
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3"
        >
          {faqs.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul role="list" className="flex flex-col gap-y-8">
                {column.map((faq, faqIndex) => (
                  <li key={faqIndex}>
                    <h3 className="font-display text-lg/7 text-slate-900">
                      {faq.question}
                    </h3>
                    <p className="mt-4 text-sm text-slate-700">{faq.answer}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
