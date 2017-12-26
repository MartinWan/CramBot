const mongoose = require('mongoose')
const eventHanding = require('./messaging/event-handling')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const express = require('express')
const https = require('https')
const request = require('request')
const path = require('path')


// establish mongoose connection
mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.')
  process.exit(1)
})

// app setup
const app = express()
app.set('port', process.env.PORT || 3000)
app.set('view engine', 'pug')
app.use(bodyParser.json({ verify: verifyRequestSignature }))
app.use(express.static('public'))

// environment variables
const APP_SECRET = process.env.MESSENGER_APP_SECRET
const VALIDATION_TOKEN = process.env.MESSENGER_VALIDATION_TOKEN
const PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN)) {
  console.error("Missing config values")
  process.exit(1)
}


app.get('/', (req, res) => {
  res.render('index', { title: 'CramBot' })
})


app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook")
    res.status(200).send(req.query['hub.challenge'])
  } else {
    console.error("Failed validation. Make sure the validation tokens match.")
    res.sendStatus(403)          
  }  
})


app.post('/webhook', (req, res) => {
  const data = req.body
  if (data.object === 'page') {
    data.entry.forEach((pageEntry) => {
      pageEntry.messaging.forEach((messagingEvent) => {
        eventHanding.handle(messagingEvent)
      })
    })

    res.end()
  }
})


app.get('/authorize', (req, res) => {
  const accountLinkingToken = req.query.account_linking_token
  const redirectURI = req.query.redirect_uri

  const authCode = "1234567890"
  const redirectURISuccess = redirectURI + "&authorization_code=" + authCode

  res.render('authorize', {
    accountLinkingToken: accountLinkingToken,
    redirectURI: redirectURI,
    redirectURISuccess: redirectURISuccess
  })
})


function verifyRequestSignature(req, res, buf) {
  const signature = req.headers["x-hub-signature"]

  if (!signature) {
    throw new Error("Couldn't validate the signature.")
  } else {
    const elements = signature.split('=')
    const signatureHash = elements[1]

    const expectedHash = crypto.createHmac('sha1', APP_SECRET)
                        .update(buf)
                        .digest('hex')

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.")
    }
  }
}

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'))
})

module.exports = app

