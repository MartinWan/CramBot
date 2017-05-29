const BaseMessage = require('./base-message')


class TextMessage extends BaseMessage {
  constructor(messageText, metadata) {
    super()
    this._json = {
      text: messageText,
      metadata: metadata
    }
  }

  get json() {
    return this._json
  }
}

module.exports = TextMessage