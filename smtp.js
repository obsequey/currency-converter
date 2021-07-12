const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const cors = require('cors')
const nodemailer = require('nodemailer')

require('dotenv').config({ path: '.env.local' })

const upload = multer()
const app = express()

const port = process.env.EXPRESS_PORT
const allowedOrigins = ['http://localhost:5000', 'http://localhost:8080']

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
    from: process.env.FROM_EMAIL,
    to: req.body.sendToEmail,
    subject: 'Your Currency Converter Results',
    html: req.body.message
  }

  const smtpTransport = nodemailer.createTransport({
    service: 'FastMail',
    auth: {
      user: process.env.ACCOUNT_USERNAME,
      pass: process.env.SMTP_ACCOUNT_PASSWORD
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
