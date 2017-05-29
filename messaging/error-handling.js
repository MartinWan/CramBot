const Response = require('./response')
const TextMessage = require('../messenger-api/message/text-message')
const MainMenu = require('./action/main-menu')

const ERROR_MESSAGE = '¯\_(ツ)_/¯  Something went wrong! Try and study next time'
const UNIMPLEMENTED_MESSAGE = "¯\_(ツ)_/¯ I don't understand yet!"


/**
 * Handle the unexpected error
 * @param senderId
 * @param error
 */
exports.handleError = function(senderId, error) {
  Response.sendMessage(senderId, new TextMessage(ERROR_MESSAGE))
  console.error('Unexpected error encountered: ' + error)
}

/**
 * Handle the error caused by a case not being handled because it is not dealt with yet.
 * E.g. General text messages are not handled yet
 *
 * @param senderId
 * @param error
 */
exports.handleUnimplementedError = function(senderId, error) {
  console.log(`Handling unimplemented error: ${JSON.stringify(error)}`)

  Response.sendMessage(
    senderId,
    new TextMessage(UNIMPLEMENTED_MESSAGE),
    (error) => {
      if (error) return exports.handleError(senderId, error)

      new MainMenu(senderId).execute(exports.handleError)
    }
  )
}
