<script setup lang="ts">
import { Input, InputNumber, Switch } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'

import ProList from '@/components/pro-list/index.vue'
import ProListItem from '@/components/pro-list-item/index.vue'
import { useServerStore } from '@/stores/server'

const serverStore = useServerStore()
const { t } = useI18n()
</script>

<template>
  <ProList :title="t('pages.preference.server.labels.serverSettings')">
    <ProListItem :title="t('pages.preference.server.labels.enableServer')">
      <Switch v-model:checked="serverStore.enabled" />
    </ProListItem>

    <ProListItem
      :description="t('pages.preference.server.descriptions.serverIp')"
      :title="t('pages.preference.server.labels.serverIp')"
    >
      <Input
        v-model:value="serverStore.serverIp"
        :disabled="!serverStore.enabled"
        placeholder="localhost"
        style="width: 200px"
      />
    </ProListItem>

    <ProListItem
      :description="t('pages.preference.server.descriptions.serverPort')"
      :title="t('pages.preference.server.labels.serverPort')"
    >
      <InputNumber
        v-model:value="serverStore.serverPort"
        :disabled="!serverStore.enabled"
        :max="65535"
        :min="1"
        style="width: 120px"
      />
    </ProListItem>
  </ProList>
</template>
