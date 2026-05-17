import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react'

type ApiKeyContextValue = {
  apiKey: string | null
  setApiKey: (apiKey: string) => void
}

const ApiKeyContext = createContext<ApiKeyContextValue | undefined>(undefined)

export function ApiKeyProvider({ children }: PropsWithChildren) {
  const [apiKey, setApiKey] = useState<null | string>(null)
  const value = useMemo(() => ({ apiKey, setApiKey }), [apiKey])

  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>
}

export function useApiKey() {
  const context = useContext(ApiKeyContext)

  if (!context) {
    throw new Error('useApiKey must be used within ApiKeyProvider')
  }

  return context
}
