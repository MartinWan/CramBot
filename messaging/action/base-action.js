/**
 * Abstract class defining an Action.
 * An Action is an operation performed on a conversation identified uniquely
 * by a payload token sent from Facebook messenger's postbacks or quickreplies
 */
class BaseAction {
  constructor(senderId) {
    this._senderId = senderId
  }

  /**
   * The payload that is sent when a postback or quick reply is sent
   */
  get payload() {
    throw new Error("No implementation found for get payload()")
  }

  /**
   * Execute this action on the instance of the conversation
   *
   * @param callback
   */
  execute(callback) {
    throw new Error("No implementation found for execute()")
  }
}

module.exports = BaseAction