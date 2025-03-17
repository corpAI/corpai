import Image from 'next/image'
import corpAiLogo from '../images/logos/corp-ai-color.png'

export function Logo(props: Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>) {
  return (
    <Image
      src={corpAiLogo}
      alt="CorpAI"
      width={500}
      height={300}
      {...props}
    />
  )
}