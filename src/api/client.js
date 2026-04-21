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
  signup: (payload) => request('POST', '/api/auth/signup', payload),
  logout: () => request('POST', '/api/auth/logout'),
  me: () => request('GET', '/api/auth/me'),

  // Cards
  listCards: () => request('GET', '/api/cards'),
  cardSummary: (id) => request('GET', `/api/cards/${id}/spend-summary`),
  createCard: (payload) => request('POST', '/api/cards', payload),
  updateCard: (id, payload) => request('PUT', `/api/cards/${id}`, payload),
  deleteCard: (id) => request('DELETE', `/api/cards/${id}`),

  // Employees
  listEmployees: () => request('GET', '/api/employees'),

  // Admin / inspection
  listTables: () => request('GET', '/api/admin/tables'),

  // Transactions
  listTransactions: ({ limit = 5, offset = 0 } = {}) =>
    request('GET', `/api/transactions?limit=${limit}&offset=${offset}`),
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
