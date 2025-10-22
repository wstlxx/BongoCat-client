import { error as logError } from '@tauri-apps/plugin-log'
import { watch } from 'vue'

import { useServerStore } from '@/stores/server'

export function useRemote() {
  const serverStore = useServerStore()
  let ws: WebSocket | null = null

  const connectToServer = () => {
    if (!serverStore.enabled) {
      console.warn('Remote connection is disabled.')
      return
    }

    // Disconnect any existing connection before creating a new one
    disconnectFromServer()

    const url = `ws://${serverStore.serverIp}:${serverStore.serverPort}`
    console.warn(`Attempting to connect to WebSocket server at ${url}`)

    try {
      ws = new WebSocket(url)

      ws.onopen = () => {
        console.warn('WebSocket connection established.')
      }

      ws.onmessage = (event) => {
        console.warn(`Received message: ${event.data}`)
        // Handle incoming messages from the server here
      }

      ws.onerror = (event) => {
        const errorMessage = `WebSocket error observed: ${event.type}`
        console.warn(errorMessage)
        logError(errorMessage)
      }

      ws.onclose = () => {
        console.warn('WebSocket connection closed.')
        ws = null
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logError(`Failed to create WebSocket connection: ${message}`)
      console.warn(`Failed to create WebSocket connection: ${message}`)
      ws = null
    }
  }

  const disconnectFromServer = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close()
    }
    ws = null
  }

  const sendRemoteAction = (action: object) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(action))
    } else {
      console.warn('Cannot send remote action: WebSocket is not connected.')
    }
  }

  // Watch for changes to server settings
  watch(
    () => [serverStore.enabled, serverStore.serverIp, serverStore.serverPort],
    () => {
      if (serverStore.enabled) {
        connectToServer()
      } else {
        disconnectFromServer()
      }
    },
    { immediate: true }, // Connect immediately on startup if enabled
  )

  return {
    connectToServer,
    disconnectFromServer,
    sendRemoteAction,
  }
}
