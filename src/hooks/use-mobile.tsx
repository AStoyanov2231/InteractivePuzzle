import * as React from "react"
import { isMobileDevice } from "@/utils/pwaUtils"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => isMobileDevice())

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice())
    }
    
    // Listen for orientation/resize changes
    window.addEventListener('resize', checkMobile)
    window.addEventListener('orientationchange', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('orientationchange', checkMobile)
    }
  }, [])

  return isMobile
}
