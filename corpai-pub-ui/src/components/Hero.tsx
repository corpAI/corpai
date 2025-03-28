import { Container } from '@/components/Container'
import { ChevronDownIcon } from '@heroicons/react/24/solid'

export function Hero() {
  const handleScroll = () => {
    const section = document.getElementById('problem-solution')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <Container className="pt-20 pb-40 text-center lg:pt-32 relative">
      <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-7xl">
        Enable{' '}
        <span className="relative whitespace-nowrap text-blue-600">
          <svg
            aria-hidden="true"
            viewBox="0 0 418 42"
            className="absolute top-2/3 left-0 h-[0.58em] w-full fill-blue-300/70"
            preserveAspectRatio="none"
          >
            <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z" />
          </svg>
          <span className="relative">AI-Driven</span>
        </span>{' '} Organizations!
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700">
        CorpAI provides cutting-edge platforms and tools designed to accelerate AI adoption and drive business transformation.
      </p>

      <div className="mt-15 mb-10 lg:mt-15 lg:mb-10">
        <p className="font-display text-base text-slate-600">
          Modern businesses struggle with fragmented data and complex AI adoption. Despite digital advancements, siloed systems hinder efficiency and drive up costs. Enterprise applications are evolving towards AI-driven solutions, yet organizations face challenges in integration, investment, and adaptation.
        </p>
        <ul
          role="list"
          className="mt-2 flex items-center justify-center gap-x-8 sm:flex-col sm:gap-x-0 sm:gap-y-10 xl:flex-row xl:gap-x-12 xl:gap-y-0"
        >
          {[ [{ name: '', description: 'CorpAI bridges this gap by enabling businesses to seamlessly integrate AI-driven technologies into their workflows. Our mission is to empower enterprises with futuristic AI solutions that facilitate secure, compliant, and intuitive interactions with siloed data sources and enterprise applications—turning complexity into simplicity.' }],].map((group, groupIndex) => (
            <li key={groupIndex}>
              <ul role="list" className="font-display text-center text-slate-600">
                {group.map((company) => (
                  <li key={company.name} className="flex">
                    <p>{company.description}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <div className="absolute inset-x-0 bottom-8 flex justify-center">
        <button
          onClick={handleScroll}
          className="animate-bounce text-blue-600 hover:text-blue-800 transition-colors duration-300 cursor-pointer"
        >
          <ChevronDownIcon className="h-8 w-8" aria-hidden="true" />
        </button>
      </div>
    </Container>
  )
}
