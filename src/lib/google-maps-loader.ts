// Centralized Google Maps API loader to prevent multiple script inclusions
let isLoading = false
let isLoaded = false
const loadPromise: Promise<typeof google> | null = null

export const loadGoogleMaps = (): Promise<typeof google> => {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (isLoaded && window.google) {
      resolve(window.google)
      return
    }

    // If currently loading, wait for existing promise
    if (isLoading) {
      const checkLoaded = () => {
        if (isLoaded && window.google) {
          resolve(window.google)
        } else {
          setTimeout(checkLoaded, 100)
        }
      }
      checkLoaded()
      return
    }

    // Start loading
    isLoading = true

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      // Script exists, wait for it to load
      const checkLoaded = () => {
        if (window.google) {
          isLoaded = true
          isLoading = false
          resolve(window.google)
        } else {
          setTimeout(checkLoaded, 100)
        }
      }
      checkLoaded()
      return
    }

    // Create and load script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      isLoaded = true
      isLoading = false
      resolve(window.google)
    }
    
    script.onerror = () => {
      isLoading = false
      reject(new Error('Failed to load Google Maps API'))
    }
    
    document.head.appendChild(script)
  })
}

// Check if Google Maps is already loaded
export const isGoogleMapsLoaded = (): boolean => {
  return !!(window.google && window.google.maps)
}