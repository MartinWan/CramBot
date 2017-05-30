const BaseAction = require('./base-action')
const Response = require('../response')
const Modes = require('../../models/modes')
const TextMessage = require('../../messenger-api/message/text-message')

/**
 * Switch mode of application. A mode is an option in the persistent menu, and
 * typically defines what the user is trying to accomplish.
 */
class SwitchMode extends BaseAction {
  constructor(senderId, conversation, consume, contribute) {
    super(senderId)
    this._conversation = conversation
    this._consume = consume
    this._contribute = contribute
  }

  get payload() {
    return SwitchMode.payload
  }

  static get payload() {
    return 'SWITCH_CONTEXT_PAYLOAD'
  }

  execute(callback) {
    this._conversation.switchMode()
    this._conversation.save((error) => {
      if (error) return callback(error)

      const mode = this._conversation.getMode()
      if (mode === Modes.CONTRIBUTE) {
        if (this._conversation.hasFullResourceContext()) {
          Response.sendMessage(this._conversation.senderId, new TextMessage('Please upload a file'), callback)
        } else {
          this._contribute.execute(callback)
        }
      } else if (mode === Modes.CONSUME) {
        this._consume.execute(callback)
      } else {
        throw new Error(`Unknown mode found: ${mode.toString()}`)
      }
    })
  }
}

module.exports = SwitchMode