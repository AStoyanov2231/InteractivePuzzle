import * as React from "react"
import { isMobileDevice } from "@/utils/pwaUtils"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice())
    }
    
    // Initial check
    checkMobile()
    
    // Listen for orientation/resize changes
    window.addEventListener('resize', checkMobile)
    window.addEventListener('orientationchange', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('orientationchange', checkMobile)
    }
  }, [])

  return !!isMobile
}
