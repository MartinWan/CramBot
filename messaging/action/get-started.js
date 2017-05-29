const BaseAction = require('./base-action')
const Response = require('../response')
const Messages = require('../messsages')
const TextMessage = require('../../messenger-api/message/text-message')
const ErrorHandling = require('../../messaging/error-handling')

/**
 * Action for when the user selects 'Get Started' when they
 * first open the chatbot
 */
class GetStarted extends BaseAction {
  constructor(senderId, consumeAction) {
    super(senderId)
    this._consumeAction = consumeAction
  }

  static get payload() {
    return 'Get Started'
  }

  get payload() {
    return GetStarted.payload
  }

  execute(callback) {
    Response.sendMessage(
      this._senderId,
      new TextMessage(Messages.GET_STARTED_GREETING),
      (error) => {
        if (error) return ErrorHandling.handleError(this._senderId, error)
        this._consumeAction.execute(callback)
      }
    )
  }
}

module.exports = GetStarted