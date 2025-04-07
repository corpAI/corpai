import Image from 'next/image'

import { Container } from '@/components/Container'
import backgroundImage from '@/images/background-faqs.jpg'

const faqs = [
  [
    {
      question: 'How does CorpAI help businesses adopt AI?',
      answer:
        'CorpAI simplifies AI adoption by providing an action driven LLM which integrates seamlessly with rapidly enterprise AI agents thus enabling natural language interactions to the enterprise users.',
    },
    {
      question:
        'Do we need to replace my existing enterprise applications to use CorpAI?',
      answer:
        'No, CorpAI seamlessly integrates with your current enterprise applications, enhancing your existing applications without requiring a complete overhaul.',
    },
    {
      question: 'Will CorpAI provide an AI agent registry?',
      answer:
        'Yes. CorpAI provides the AI registry. The AI registry contains vetted enterprise AI agents. It helps enterprises and local business institutes to register their AI agents. CorpAI enables the users to discover these agents and interact with these agents through natural language in a safe and secure manner.',
    },
  ],
  [
    {
      question:
        'What about the security and administration of these AI agents?',
      answer:
        'CorpAI provides the platform for enterprises to securely administer, govern and control the growing AI agents and their traffic in an enterprise.',
    },
    {
      question:
        'Will CorpAI provide the AI layers for enterprise data sources?',
      answer:
        'CorpAI provides the AI layer with data source integrations for enterprise users to interact with these data sources naturally.',
    },
    {
      question: 'What industries does CorpAI cater to?',
      answer:
        'CorpAI is designed for any data-driven organization, including finance, healthcare, e-commerce, logistics, government institutes and enterprises.',
    },
    {
      question: 'Is CorpAI a cloud-based platform?',
      answer:
        'Yes, CorpAI is cloud-native, ensuring scalability, security, and seamless updates. We also offer on-premise solutions for enterprises with strict compliance needs.',
    },
  ],
  [
    {
      question: 'How does CorpAI ensure data security?',
      answer:
        'We follow enterprise-grade security protocols, including end-to-end encryption, role-based access control (RBAC), and compliance with GDPR, HIPAA, and SOC 2 standards.',
    },
    {
      question: 'Does CorpAI store my business data?',
      answer:
        'No, CorpAI processes data securely without storing sensitive business information unless explicitly configured for analytics and optimization purposes.',
    },
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
            Need further assistance? Email our support team at{' '}
            <a href="mailto:info@corpai.io" className="font-bold text-blue-600 dark:text-blue-500 hover:underline">info@corpai.io</a>.
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
