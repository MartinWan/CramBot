const BaseAction = require('./base-action')
const Modes = require('../../models/modes')
const Response = require('../response')
const SchoolSelection = require('./school-selection')
const Messages = require('../messsages')
const QuickReply = require('../../messenger-api/message/quick-reply')
const send_api = require('../../messenger-api/send-api')

/**
 * The action triggered when contribution mode is triggered in the chatbot
 */
class Contribute extends BaseAction {
  constructor(conversation) {
    super(conversation.senderId)
    this._conversation = conversation
  }

  get payload() {
    return Contribute.payload
  }

  static get payload() {
    return 'MENU_POSTBACKS_CONTRIBUTE'
  }

  static get postBackButton() {
    return send_api.postback_button('Help people cram', Contribute.payload)
  }

  execute(callback) {
    this._conversation.clearContext()
    this._conversation.setMode(Modes.CONTRIBUTE)
    this._conversation.save(error => {
      if (error) return callback(error)

      Response.sendMessage(
        this._senderId,
        new QuickReply(Messages.CONTRIBUTE_WHICH_SCHOOL, SchoolSelection.SCHOOL_QUICK_REPLIES)
      )
      callback(null)
    })
  }
}

module.exports = Contribute