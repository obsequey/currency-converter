<template>
  <v-container v-if="isLoading">Loading</v-container>
  <v-form @submit.prevent="sendEmail" v-else>
    <v-container mt-6>
      <v-row>
        <!-- Value to transform -->
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            ref="inputValue"
            filled
            required
            label="Сумма в рублях"
            v-model="inputValue"
            type="number"
            :rules="[validationRules.required]"
            prepend-icon="mdi-currency-rub"
            hide-details="auto"
          ></v-text-field>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <!-- Transform to which currency -->
          <v-autocomplete
            ref="selectedCurrency"
            filled
            required
            v-model="selectedCurrency"
            :items="currencyList"
            label="Целевая валюта"
            prepend-icon="mdi-arrow-right"
            :rules="[validationRules.required]"
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
            ref="sendToEmail"
            filled
            required
            label="Куда отправить результаты?"
            v-model="sendToEmail"
            :rules="[validationRules.required, validationRules.email]"
            prepend-icon="mdi-email"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-btn
        :loading="sendingEmail"
        :disabled="sendingEmail"
        type="submit"
        class="d-block mt-2 mx-auto"
        color="secondary"
        >Отправить
      </v-btn>
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
    validationRules: {
      required: (value) => !!value || 'Required field.',
      email: (value) => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return pattern.test(value) || 'Неверно введена почта'
      }
    }
  }),

  mounted() {
    this.getCurrencyListFromAPI()
  },

  methods: {
    async getCurrencyListFromAPI() {
      /** Info about valute rates are stored in a Object { VALUTENAME: {}, ...}
       * So we parse it by values and return the resulting array
       * @return Array */
      const getCurrencyValuesFromJSON = (json) => {
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

      // Get the value from localStorage if it already exists
      this.currencyList = getCurrencyValuesFromJSON(
        JSON.parse(localStorage.getItem('fetchedCurrencyList'))
      )
    },

    async sendEmail() {
      const validateWholeForm = () => {
        const form = ['inputValue', 'selectedCurrency', 'sendToEmail']
        form.forEach((field) => this.$refs[field].validate(true))
      }

      if (!this.formIsReady) {
        validateWholeForm()
        return
      }

      this.sendingEmail = true
      await fetch('https://zjmpyr63-currency-converter-2.herokuapp.com/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*'
        },
        body: JSON.stringify({
          message: this.messageToSendToEmail,
          sendToEmail: this.sendToEmail
        })
      }).then((res) => {
        console.log(res)
      })
      this.sendingEmail = false
    }
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
    },

    messageToSendToEmail() {
      return `
Hey!<br>
<br>
Here are your results for currency conversion:<br>
${this.inputValue} RUB to ${this.selectedCurrency} at rate ${this.selectedCurrencyObject.Value}<br>
------<br>
${this.valueInTargetCurrency}<br>
<br>
Have a nice day :)
`
    },

    formIsReady() {
      return !!this.inputValue && !!this.selectedCurrency && !!this.sendToEmail
    }
  }
}
</script>

<style lang="scss" scoped></style>
