import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client.js'
import CardsManager from '../dashboard/CardsManager.jsx'

export default function CardsPage() {
  const [cards, setCards] = useState([])
  const [employees, setEmployees] = useState([])
  const [error, setError] = useState(null)

  const refreshCards = useCallback(async () => {
    try {
      const c = await api.listCards()
      setCards(c.cards)
    } catch (e) {
      setError(e.message)
    }
  }, [])

  useEffect(() => {
    refreshCards()
    api.listEmployees()
      .then((r) => setEmployees(r.employees))
      .catch((e) => setError(e.message))
  }, [refreshCards])

  return (
    <>
      {error && (
        <div className="txn-banner txn-banner-bad" role="alert">
          <strong>Error</strong>
          <span>{error}</span>
        </div>
      )}
      <CardsManager cards={cards} employees={employees} onChange={refreshCards} />
    </>
  )
}
