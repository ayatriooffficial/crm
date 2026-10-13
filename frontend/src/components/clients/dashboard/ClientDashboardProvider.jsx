'use client';

import { createContext, useCallback, useContext, useMemo, useReducer, useState } from 'react';
import Toast from '@/components/ui/Toast';
import { buildClientDashboard } from '@/data/clientDashboard';

/*
 * Holds one client's dashboard data. It lives in the /view-client/[id]
 * layout, so anything added on one tab (a task, a note, a document…)
 * is still there after switching tabs. No backend: changes are in memory.
 */

const DashboardContext = createContext(null);

let uid = 0;
export const newId = (prefix) => `${prefix}-new-${(uid += 1)}`;

function reducer(state, action) {
  switch (action.type) {
    case 'details':
      return { ...state, details: { ...state.details, ...action.patch } };
    case 'client':
      return { ...state, client: { ...state.client, ...action.patch } };
    case 'recurring':
      return { ...state, services: { ...state.services, recurring: action.ids } };
    case 'availed':
      return state.services.availed.includes(action.id)
        ? state
        : { ...state, services: { ...state.services, availed: [...state.services.availed, action.id] } };
    case 'add':
      return { ...state, [action.key]: action.prepend ? [action.item, ...state[action.key]] : [...state[action.key], action.item] };
    case 'update':
      return { ...state, [action.key]: state[action.key].map((row) => (row.id === action.id ? { ...row, ...action.patch } : row)) };
    case 'remove':
      return { ...state, [action.key]: state[action.key].filter((row) => row.id !== action.id) };
    case 'documents':
      return { ...state, documents: { ...state.documents, files: action.files(state.documents.files) } };
    default:
      return state;
  }
}

export default function ClientDashboardProvider({ clientId, children }) {
  const [state, dispatch] = useReducer(reducer, clientId, buildClientDashboard);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message) => setToast({ id: Date.now(), message }), []);
  const dismiss = useCallback(() => setToast(null), []);

  const value = useMemo(() => ({ data: state, dispatch, notify }), [state, notify]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
      <Toast toast={toast} onDismiss={dismiss} />
    </DashboardContext.Provider>
  );
}

export function useClientDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useClientDashboard must be used inside ClientDashboardProvider');
  return context;
}
