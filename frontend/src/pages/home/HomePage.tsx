import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { CategoryGrid } from './CategoryGrid'
import { DeliveryAreas } from './DeliveryAreas'
import { Faq } from './Faq'
import { FeaturedProducts } from './FeaturedProducts'
import { Hero } from './Hero'
import { HowItWorks } from './HowItWorks'
import { PriceTicker } from './PriceTicker'

export default function HomePage() {
  useDocumentTitle()
  return (
    <>
      <Hero />
      <PriceTicker />
      <CategoryGrid />
      <FeaturedProducts />
      <HowItWorks />
      <DeliveryAreas />
      <Faq />
    </>
  )
}
