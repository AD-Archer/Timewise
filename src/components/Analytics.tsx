'use client'

import { useEffect } from 'react'

export default function Analytics() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    import('@plausible-analytics/tracker').then(({ init }) => {
      init({
        domain: 'adarcher.app',
        endpoint: 'https://plausible.adarcher.app/api/event',
        autoCapturePageviews: true,
        outboundLinks: true,
        fileDownloads: true,
      })
    })
  }, [])

  return null
}