import { useEffect, useState } from 'react'

export function useSize(ref) {
  const [size, setSize] = useState(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((current) =>
        current?.width === width && current?.height === height
          ? current
          : { width, height },
      )
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return size
}
