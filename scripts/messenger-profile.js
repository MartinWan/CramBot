/**
 * Script to set the persisted menu of the chatbot.
 *
 * https://developers.facebook.com/docs/messenger-platform/messenger-profile/persistent-menu
 */
const request = require('request')
const Contribute = require('../messaging/action/contribute')
const Consume = require('../messaging/action/consume')
const GetStarted = require('../messaging/action/get-started')
const async = require('async')

const MESSENGER_PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN
if (!MESSENGER_PAGE_ACCESS_TOKEN) {
  console.error(
    `Messenger Page Access Token not found.
   Please make sure the MESSENGER_PAGE_ACCESS_TOKEN is set.`)
  process.exit(1)
}

const uri = `https://graph.facebook.com/v2.6/me/messenger_profile?access_token=${MESSENGER_PAGE_ACCESS_TOKEN}`

const data = {
  "persistent_menu":[
    {
      "locale":"default",
      "composer_input_disabled":false,
      "call_to_actions":[
        Contribute.postBackButton,
        Consume.postBackButton
      ]
    },
    {
      "locale":"zh_CN",
      "composer_input_disabled":false
    }
  ]
}

async.series([
  setGetStarted,
  setMenu
], (error) => {
  if (error) throw error
  console.log('Successfully set messenger menu.')
})

function setGetStarted(done) {
  request({
    uri: uri,
    method: 'POST',
    json: {
      'get_started': {
        payload: GetStarted.payload
      }
    }
  }, (err, res, body) => {
    handleResponse(err, res, body, done)
  })
}


function setMenu(done) {
  request({
    uri: uri,
    method: 'POST',
    json: data
  }, (error, response, body) => {
    handleResponse(error, response, body, done)
  })
}


function handleResponse(err, res, body, done) {
  if (err) return done(err)

  if (res.statusCode != 200) {
    return done(new Error(JSON.stringify(body.error)))
  }

  done(null)
}
