/**
 * Module responsible for sending responses via the facebook messenger the send api
 */

const request = require('request')
const async = require('async')


/**
 * Send the message to the recipient
 * @param recipientId
 * @param message
 * @param callback optional callback to be called when complete
 */
exports.sendMessage = function(recipientId, message, callback) {
  exports.sendMessages(recipientId, [message], callback || handleError)
}

/**
 * Send the messages in the order provided to the recipient.
 *
 * @param recipientId
 * @param messages
 * @param callback optional callback to be called when complete
 */
exports.sendMessages = function(recipientId, messages, callback) {
  const messageDatas = messages.map(m => {
    return {
      recipient: {
        id: recipientId
      },
      message: m.json
    }
  })
  // we need to use async.eachSeries because we need to control
  // the order in which the requests are sent, which is not possible normally
  // due to the event loop: https://developers.facebook.com/bugs/565416400306038
  async.eachSeries(messageDatas, callSendAPI, callback || handleError)
}

function handleError(e) {
  if (e) console.error(e)
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll
 * get the message id in a response
 *
 */
function callSendAPI(messageData, callback) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.MESSENGER_PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (error) {
      callback(error)
    } else if (response.statusCode == 200) {
      const recipientId = body.recipient_id;
      const messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s",
          messageId, recipientId)
        callback(null)
      } else {
        console.log("Successfully called Send API for recipient %s",
          recipientId)
        callback(null)
      }
    } else {
      const errorMessage = `Failed calling send api with status code: ${response.statusCode} ${response.statusMessage}. 
          Error: ${JSON.stringify(body.error)}`
      console.error(errorMessage)
      callback(
        new Error(errorMessage)
      )
    }
  })
}