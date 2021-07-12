const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const cors = require('cors')
const nodemailer = require('nodemailer')

let accountUsername
let smtpAccountPassword
let fromEmail
let allowedOrigins

// Heroku by default set NODE_ENV to production
if (process.env.NODE_ENV === 'production') {
  const aws = require('aws-sdk')

  const s3 = new aws.S3({
    accountUsername: process.env.ACCOUNT_USERNAME,
    smtpAccountPassword: process.env.SMTP_ACCOUNT_PASSWORD,
    fromEmail: process.env.FROM_EMAIL
  })
  allowedOrigins = ['https://zjmpyr63-currency-converter.herokuapp.com']
} else {
  require('dotenv').config({ path: '.env.local' })
  accountUsername = process.env.ACCOUNT_USERNAME
  smtpAccountPassword = process.env.SMTP_ACCOUNT_PASSWORD
  fromEmail = process.env.FROM_EMAIL
  allowedOrigins = ['http://localhost:5000', 'http://localhost:8080']
}

const upload = multer()
const app = express()

const port = process.env.EXPRESS_PORT

app.use(bodyParser.json())
app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not ' +
          'allow access from the specified Origin.'
        return callback(new Error(msg), false)
      }
      return callback(null, true)
    }
  })
)

app.post('/email', (req, res) => {
  const mailOptions = {
    from: fromEmail,
    to: req.body.sendToEmail,
    subject: 'Your Currency Converter Results',
    html: req.body.message
  }

  const smtpTransport = nodemailer.createTransport({
    service: 'FastMail',
    auth: {
      user: accountUsername,
      pass: smtpAccountPassword
    }
  })

  smtpTransport.sendMail(mailOptions, (error, response) => {
    if (error) {
      console.log(error)
      res.send('error')
    }

    console.log('Message sent')
    res.send('Message sent')
  })
})

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`)
})
