const BaseMessage = require('./base-message')

class QuickReply extends BaseMessage{
  constructor(text, quick_replies) {
    super()
    this._json = {
      text: text,
      quick_replies: quick_replies
    }
  }

  get json() {
    return this._json
  }
}

module.exports = QuickReply