const BaseMessage = require('./base-message')
const send_api = require('../send-api')
const Messages = require('../../messaging/messsages')

class Template extends BaseMessage {
  constructor(payload) {
    super()
    const attachment = {
      type: 'template',
      payload: payload
    }
    this._json = {
      attachment: attachment
    }
  }

  get json() {
    return this._json
  }

  static fromResources(resources) {
    const elements = resources.map(r =>
      send_api.element(
        r.course,
        r.getSchoolName(),
        r.getThumbnailURL(),
        undefined,
        [ send_api.url_button(r.getURL(), Messages.VIEW_RESOURCE) ]
      )
    )
    return new Template(send_api.generic_template(elements, true))
  }
}

module.exports = Template