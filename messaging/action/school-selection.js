const BaseAction = require('../action/base-action')
const Response = require('../response')
const ErrorHandling = require('../error-handling')
const Modes = require('../../models/modes')
const _ = require('underscore')
const Schools = require('../../models/schools')
const send_api = require('../../messenger-api/send-api')
const Messages = require('../messsages')
const TextMessage = require('../../messenger-api/message/text-message')
const Template = require('../../messenger-api/message/template')


class SchoolSelection extends BaseAction {

  /**
   * @returns {string}
   */
  static get UVIC_PAYLOAD() {
    return "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_UVIC"
  }

  /**
   * @returns {string}
   */
  static get UBC_PAYLOAD() {
    return "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_UBC"
  }

  /**
   * @returns {string}
   */
  static get SFU_PAYLOAD() {
    return "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_SFU"
  }

  static get SCHOOL_QUICK_REPLIES() {
    return [ send_api.quick_reply('text', 'UVic', SchoolSelection.UVIC_PAYLOAD),
      send_api.quick_reply('text', 'UBC', SchoolSelection.UBC_PAYLOAD),
      send_api.quick_reply('text', 'SFU', SchoolSelection.SFU_PAYLOAD)
    ]
  }

  static get SCHOOL_PAYLOADS() {
    return [SchoolSelection.UVIC_PAYLOAD, SchoolSelection.UBC_PAYLOAD, SchoolSelection.SFU_PAYLOAD]
  }

  constructor(conversation, selectedSchool, resourceService) {
    super(conversation.senderId)
    this._conversation = conversation
    this._selectedSchool = selectedSchool
    this._resourceService = resourceService
  }

  get payload() {
    return this._selectedSchool
  }

  execute(callback) {
    let schoolContext;
    if (this.payload === SchoolSelection.UVIC_PAYLOAD) {
      schoolContext = Schools.UVIC
    } else if (this.payload === SchoolSelection.UBC_PAYLOAD) {
      schoolContext = Schools.UBC
    } else if (this.payload === SchoolSelection.SFU_PAYLOAD) {
      schoolContext = Schools.SFU
    } else {
      return ErrorHandling.handleUnimplementedError(this._senderId)
    }
    this._conversation.setSchool(schoolContext)
    this._conversation.save((error) => {
      if (error) return callback(error)

      const mode = this._conversation.getMode()
      if (mode === Modes.CONSUME) {
        this._sendSampleMaterial()
      } else if (mode === Modes.CONTRIBUTE) {
        Response.sendMessage(this._senderId, new TextMessage(Messages.CONTRIBUTE_WHICH_COURSE))
      } else {
        callback(new Error(`Unknown mode found: ${mode}`))
      }
    })
  }

  _sendSampleMaterial() {
    const school = this._conversation.getSchool()
    this._resourceService.getSampleMaterial(school, (error, resources) => {
      if (error) return ErrorHandling.handleError(this._senderId, error)

      const messages = []
      if (!_.isEmpty(resources)) {
        messages.push(new TextMessage(Messages.CRAM_MATERIAL_FROM(Schools.getSchoolName(school))))
        messages.push(Template.fromResources(resources))
      }
      messages.push(new TextMessage(Messages.CONSUME_WHICH_COURSE))
      Response.sendMessages(this._senderId, messages)
    })
  }
}

module.exports = SchoolSelection