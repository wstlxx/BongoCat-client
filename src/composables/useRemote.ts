import { error as logError } from '@tauri-apps/plugin-log'
import { watch } from 'vue'

import { useServerStore } from '@/stores/server'

export function useRemote() {
  const serverStore = useServerStore()

  const connectToServer = async () => {
    if (!serverStore.enabled) {
      return
    }

    try {
      // Add your WebSocket or HTTP connection logic here
      // Example: const ws = new WebSocket(url)
      // For now just log success
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logError(`Failed to connect to server: ${message}`)
      console.warn('Server connection failed, continuing without server')
    }
  }

  const disconnectFromServer = () => {
    // Add your disconnect logic here
  }

  // Watch for changes to server settings
  watch(
    () => [serverStore.enabled, serverStore.serverIp, serverStore.serverPort],
    async ([enabled]) => {
      if (enabled) {
        await connectToServer()
      } else {
        disconnectFromServer()
      }
    },
  )

  return {
    connectToServer,
    disconnectFromServer,
  }
}
