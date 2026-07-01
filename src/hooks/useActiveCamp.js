import { useCallback, useEffect, useMemo, useState } from 'react'

const ACTIVE_CAMP_STORAGE_KEY = 'acampgestor.activeCampId'
const ACTIVE_CAMP_CHANGE_EVENT = 'acampgestor-active-camp-change'

function getCampNameStorageKey(campId) {
  return `acampgestor.campName.${campId}`
}

function readStoredCampId() {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(ACTIVE_CAMP_STORAGE_KEY) || ''
}

function writeStoredCampId(campId) {
  if (typeof window === 'undefined') return

  if (campId) {
    window.localStorage.setItem(ACTIVE_CAMP_STORAGE_KEY, campId)
    return
  }

  window.localStorage.removeItem(ACTIVE_CAMP_STORAGE_KEY)
}

function notifyActiveCampChange() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(ACTIVE_CAMP_CHANGE_EVENT))
}

export function useActiveCamp(camps = null) {
  const [activeCampId, setActiveCampId] = useState(readStoredCampId)

  const activeCamp = useMemo(() => {
    if (!Array.isArray(camps)) return null
    return camps.find((camp) => camp.id === activeCampId) || null
  }, [activeCampId, camps])

  const setActiveCamp = useCallback((camp) => {
    const nextCampId = typeof camp === 'string' ? camp : camp?.id || ''
    const nextCampName = typeof camp === 'string' ? '' : camp?.name || ''
    setActiveCampId(nextCampId)
    writeStoredCampId(nextCampId)

    if (typeof window !== 'undefined' && nextCampId && nextCampName) {
      window.localStorage.setItem(
        getCampNameStorageKey(nextCampId),
        nextCampName,
      )
    }

    notifyActiveCampChange()
  }, [])

  const clearActiveCamp = useCallback(() => {
    setActiveCampId('')
    writeStoredCampId('')
    notifyActiveCampChange()
  }, [])

  useEffect(() => {
    function syncActiveCamp() {
      setActiveCampId(readStoredCampId())
    }

    window.addEventListener(ACTIVE_CAMP_CHANGE_EVENT, syncActiveCamp)
    window.addEventListener('storage', syncActiveCamp)

    return () => {
      window.removeEventListener(ACTIVE_CAMP_CHANGE_EVENT, syncActiveCamp)
      window.removeEventListener('storage', syncActiveCamp)
    }
  }, [])

  useEffect(() => {
    if (!activeCampId || !Array.isArray(camps)) return

    const campStillExists = camps.some((camp) => camp.id === activeCampId)

    if (!campStillExists) {
      const timeoutId = window.setTimeout(() => {
        clearActiveCamp()
      }, 0)

      return () => {
        window.clearTimeout(timeoutId)
      }
    }
  }, [activeCampId, camps, clearActiveCamp])

  return {
    activeCamp,
    activeCampId,
    clearActiveCamp,
    setActiveCamp,
  }
}

export {
  ACTIVE_CAMP_CHANGE_EVENT,
  ACTIVE_CAMP_STORAGE_KEY,
  getCampNameStorageKey,
}
