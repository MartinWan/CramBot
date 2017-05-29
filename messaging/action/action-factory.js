const Consume = require('./consume')
const Contribute = require('./contribute')
const SchoolSelection = require('./school-selection')
const GetStarted = require('./get-started')
const MainMenu = require('./main-menu')

/**
 * Creates an executable action from a payload sent from a postback or quick reply
 */
class ActionFactory {
  constructor(conversation, resourceService) {
    this._conversation = conversation
    this._resourceService = resourceService
  }

  createAction(payload) {
    if (payload === GetStarted.payload) {
      return new GetStarted(this._conversation.senderId, new Consume(this._conversation))
    } else if (payload === Consume.payload) {
      return new Consume(this._conversation)
    } else if (payload === Contribute.payload) {
      return new Contribute(this._conversation)
    } else if (SchoolSelection.SCHOOL_PAYLOADS.includes(payload)) {
      return new SchoolSelection(this._conversation, payload, this._resourceService)
    } else if (payload === MainMenu.payload) {
      return new MainMenu(this._conversation.senderId)
    } else {
      throw new Error(`Unable to create action for payload ${payload}`) // TODO-MW Do not throw here?
    }
  }
}

module.exports = ActionFactory