import { error as logError } from '@tauri-apps/plugin-log'
import { watch } from 'vue'

import { useModel } from './useModel'

import { useServerStore } from '@/stores/server'

export function useRemote() {
  const serverStore = useServerStore()
  const { handlePress, handleRelease, handleMouseChange, handleMouseMove } = useModel()
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
        try {
          const message = JSON.parse(event.data)
          console.warn(`Received action: ${message.kind}, value: ${JSON.stringify(message.value)}`)

          switch (message.kind) {
            case 'KeyboardPress':
              handlePress(message.value)
              break
            case 'KeyboardRelease':
              handleRelease(message.value)
              break
            case 'MousePress':
              handleMouseChange(message.value)
              break
            case 'MouseRelease':
              handleMouseChange(message.value, false)
              break
            case 'MouseMove':
              handleMouseMove(message.value)
              break
          }
        } catch (e) {
          console.warn('Failed to parse incoming message:', e)
        }
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
  }
}
