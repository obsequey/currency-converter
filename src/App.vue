<template>
  <v-app>
    <v-app-bar dark absolute app color="primary">
      Конвертер валюты
    </v-app-bar>
    <v-main>
      <CurrencyCalculator />
    </v-main>
  </v-app>
</template>

<script>
import CurrencyCalculator from './components/CurrencyCalculator'

export default {
  name: 'App',

  components: {
    CurrencyCalculator
  },

  data: () => ({
    //
  })
}
</script>
