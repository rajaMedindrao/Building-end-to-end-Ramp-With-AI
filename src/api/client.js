// Single place for every API call. Components import from here only —
// no fetch() calls inside components.

async function request(method, path, body) {
  const res = await fetch(path, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text }
    }
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || `Request failed (${res.status})`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const api = {
  // Auth
  login: (email, password) => request('POST', '/api/auth/login', { email, password }),
  logout: () => request('POST', '/api/auth/logout'),
  me: () => request('GET', '/api/auth/me'),

  // Cards
  listCards: () => request('GET', '/api/cards'),
  cardSummary: (id) => request('GET', `/api/cards/${id}/spend-summary`),

  // Transactions
  listTransactions: () => request('GET', '/api/transactions'),
  submitTransaction: (payload) => request('POST', '/api/transactions/submit', payload),

  // Approvals
  listManagers: () => request('GET', '/api/approvals/managers'),
  pendingApprovals: (managerId) =>
    request('GET', `/api/approvals/pending?manager_id=${managerId}`),
  approvalHistory: (managerId) =>
    request('GET', `/api/approvals/history?manager_id=${managerId}`),
  decideApproval: (approvalId, payload) =>
    request('POST', `/api/approvals/${approvalId}/decide`, payload),
}
