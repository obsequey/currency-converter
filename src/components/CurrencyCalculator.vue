<template>
  <v-container v-if="isLoading">Loading</v-container>
  <v-form v-else>
    <v-container mt-6>
      <v-row>
        <!-- Value to transform -->
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            filled
            label="Сумма в рублях"
            v-model="inputValue"
            type="number"
            prepend-icon="mdi-currency-rub"
            hide-details="auto"
          ></v-text-field>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <!-- Transform to which currency -->
          <v-autocomplete
            filled
            v-model="selectedCurrency"
            :items="currencyList"
            label="Целевая валюта"
            prepend-icon="mdi-arrow-right"
          >
          </v-autocomplete>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <!-- Value in target currency -->
          <v-text-field
            filled
            name="Show the value in target currency"
            label="Сумма в целевой валюте"
            prepend-icon="mdi-approximately-equal"
            id="id"
            v-model="valueInTargetCurrency"
            disabled
            color="black"
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- Email to address -->
      <v-row class="justify-center">
        <v-col cols="12" sm="6">
          <v-text-field
            filled
            label="Куда отправить результаты?"
            v-model="sendToEmail"
            :rules="emailValidationRules"
            prepend-icon="mdi-email"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-btn
        @click.prevent=""
        :loading="sendingEmail"
        :disabled="sendingEmail"
        class="d-block mt-2 mx-auto"
        color="primary"
        dark
        >Отправить</v-btn
      >
    </v-container>
  </v-form>
</template>

<script>
require('dotenv').config()

export default {
  name: 'CurrencyCalculator',

  data: () => ({
    inputValue: 0,
    currencyList: [],
    selectedCurrency: '',
    isLoading: false,
    sendToEmail: '',
    sendingEmail: false,
    emailValidationRules: [
      (value) => !!value || 'Required.',
      (value) => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return pattern.test(value) || 'Неверно введена почта'
      }
    ]
  }),

  mounted() {
    this.getCurrencyListFromAPI()
  },

  methods: {
    async getCurrencyListFromAPI() {
      /** Info about valute rates are stored in a Object { VALUTENAME: {}, ...}
       * So we parse it by values and return the resulting array
       * @return Array */
      function getCurrencyValuesFromJSON(json) {
        return Object.values(json.Valute).map((item) => item.Name)
      }

      if (!localStorage.fetchedCurrencyList) {
        this.isLoading = true
        const currencyJson = await fetch(
          'https://www.cbr-xml-daily.ru/daily_json.js'
        ).then((res) => res.json())
        // Cash the value from API in LocalStorage
        // Stringify json response to avoid [Object object] error
        localStorage.setItem(
          'fetchedCurrencyList',
          JSON.stringify(currencyJson)
        )
        this.currencyList = getCurrencyValuesFromJSON(currencyJson)
        this.isLoading = false
        return
      }

      this.currencyList = getCurrencyValuesFromJSON(
        JSON.parse(localStorage.getItem('fetchedCurrencyList'))
      )
    },

    sendEmail() {}
  },
  computed: {
    // Find the selected currency object in localStorage object
    selectedCurrencyObject() {
      const currencyObjectsArray = Object.values(
        JSON.parse(localStorage.getItem('fetchedCurrencyList')).Valute
      )

      return Array.prototype.find.call(
        currencyObjectsArray,
        (currency) => currency.Name === this.selectedCurrency
      )
    },

    // Calculates the target currency value using the Value property of selected currency object
    valueInTargetCurrency() {
      return this.selectedCurrencyObject
        ? this.inputValue / this.selectedCurrencyObject.Value
        : 0
    }
  }
}
</script>

<style lang="scss" scoped></style>
