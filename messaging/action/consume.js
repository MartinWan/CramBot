const BaseAction = require('./base-action')
const Modes = require('../../models/modes')
const Response = require('../response')
const SchoolSelection = require('./school-selection')
const Messages = require('../messsages')
const QuickReply = require('../../messenger-api/message/quick-reply')
const send_api = require('../../messenger-api/send-api')

/**
 * Action triggered when the user switches the
 * chatbot to cram material consumption mode
 */
class Consume extends BaseAction {
  constructor(conversation) {
    super(conversation.senderId)
    this._conversation = conversation
  }

  get payload() {
    return Consume.payload
  }

  static get payload() {
    return 'MENU_POSTBACKS_SEARCH'
  }

  static get postBackButton() {
    return send_api.postback_button('Cram', Consume.payload)
  }

  execute(callback) {
    this._conversation.clearContext()
    this._conversation.setMode(Modes.CONSUME)
    this._conversation.save((error) => {
      if (error) return callback(error)

      Response.sendMessage(
        this._senderId,
        new QuickReply(Messages.CONSUME_WHICH_SCHOOL, SchoolSelection.SCHOOL_QUICK_REPLIES)
      )
      callback(null)
    })
  }
}

module.exports = Consume