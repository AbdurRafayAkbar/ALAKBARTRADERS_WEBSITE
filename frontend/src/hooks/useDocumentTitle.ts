import { useEffect } from 'react'
import { site } from '../config/site'

// Every page sets its own title (rules.md §3.1). Django fills the first one for crawlers.
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title
      ? `${title} | ${site.name}`
      : `${site.name} | Rice, dry fruits and fresh cream in ${site.city}`
  }, [title])
}
