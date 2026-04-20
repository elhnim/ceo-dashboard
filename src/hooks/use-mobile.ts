import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const getIsMobile = React.useCallback(
    () => window.innerWidth < MOBILE_BREAKPOINT,
    [],
  )
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(() =>
    typeof window === "undefined" ? undefined : getIsMobile(),
  )

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(getIsMobile())
    }
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [getIsMobile])

  return !!isMobile
}
