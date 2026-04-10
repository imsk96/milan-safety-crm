import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function usePageRefresh(callback, deps = []) {
  const location = useLocation()

  useEffect(() => {
    callback()
  }, [location.pathname, ...deps])
}