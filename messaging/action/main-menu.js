const BaseAction = require('./base-action')
const Contribute = require('./contribute')
const Consume = require('./consume')
const Response = require('../response')
const Template = require('../../messenger-api/message/template')
const send_api = require('../../messenger-api/send-api')


/**
 * Action to display the main menu of the application.
 * E.g. Root options available to the user
 */
class MainMenu extends BaseAction {
  constructor(senderId) {
    super(senderId)
  }

  get payload() {
    return MainMenu.payload
  }

  static get payload() {
    return 'GOTO_MAIN_MENU'
  }

  execute(callback) {
    Response.sendMessage(
      this._senderId,
      new Template(
        send_api.button_template('What would you like to do?', [
          Consume.postBackButton,
          Contribute.postBackButton
        ])
      )
    )
  }
}

module.exports = MainMenu
