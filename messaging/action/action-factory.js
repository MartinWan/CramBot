const Consume = require('./consume')
const Contribute = require('./contribute')
const SchoolSelection = require('./school-selection')
const GetStarted = require('./get-started')
const MainMenu = require('./main-menu')
const SwitchMode = require('./switch-mode')

/**
 * Creates an executable action from a payload sent from a postback or quick reply
 */
class ActionFactory {
  constructor(conversation, resourceService) {
    this._conversation = conversation
    this._resourceService = resourceService
  }

  createActionFromPayload(payload) {
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
    } else if (payload === SwitchMode.payload) {
      const consume = new Consume(this._conversation)
      const contribute = new Contribute(this._conversation)
      return new SwitchMode(this._conversation.senderId, this._conversation, consume, contribute)
    } else {
      throw new Error(`Unable to create action for payload ${payload}`)
    }
  }
}

module.exports = ActionFactory