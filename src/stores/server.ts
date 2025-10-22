import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useServerStore = defineStore('server', () => {
  const serverIp = ref('localhost')
  const serverPort = ref(8080)
  const enabled = ref(false)

  return {
    serverIp,
    serverPort,
    enabled,
  }
})
