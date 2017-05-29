const Response = require('./response')
const Modes = require('../models/modes')
const Resource = require('../models/resource')
const ResourceService = require('../services/resource-service')
const ErrorHandling = require('./error-handling')
const _ = require('underscore')
const BlobService = require('../services/blob-service')
const TextMessage = require('../messenger-api/message/text-message')
const Template = require('../messenger-api/message/template')
const send_api = require('../messenger-api/send-api')
const MainMenu = require('./action/main-menu')

/**
 * A class that warps the persisted conversation model. Handles
 * business logic of the conversation.
 *
 * This class was created to separate the responsibilities of persisting
 * conversation context and dealing with chat logic
 */
class ChatBot {
  constructor(conversation, actionFactory, resourceService) {
    this._conversation = conversation
    this._actionFactory = actionFactory
    this._resourceService = resourceService
  }

  get senderId() {
    return this._conversation.senderId
  }

  receivedAuthentication(event) {
    // do nothing for now
  }

  receivedMessage(event) {
    const message = event.message

    const isEcho = message.is_echo
    const messageId = message.mid
    const appId = message.app_id
    const metadata = message.metadata

    // may get a text or attachment but not both
    const messageText = message.text
    const messageAttachments = message.attachments
    const quickReply = message.quick_reply

    if (isEcho) {
      // Just logging message echoes to console
      console.log("Received echo for message %s and app %d with metadata %s",
        messageId, appId, metadata)
    } else if (quickReply) {
      this._handleAction(quickReply.payload)
    } else if (messageAttachments) {
      this._handleAttachments(messageAttachments)
    } else if (messageText) {
      this._handleTextMessage(messageText)
    } else {
      ErrorHandling.handleUnimplementedError(this.senderId)
    }
  }

  receivedDeliveryConfirmation(event) {
    // do nothing for now
  }

  receivedPostBack(event) {
    this._handleAction(event.postback.payload)
  }

  receivedMessageRead(event) {
    // do nothing for now
  }

  receivedAccountLink(event) {
    // do nothing for now
  }

  _handleAction(payload) {
    this._actionFactory.createAction(payload).execute(err => {
      if (err) ErrorHandling.handleError(this.senderId, error)
    })
  }

  _handleTextMessage(message) {
    const modeContext = this._conversation.getMode()
    const schoolContext = this._conversation.getSchool()

    if (modeContext && schoolContext) {
      if (!ResourceService.isValidCourse(message)) {
        Response.sendMessage(
          this.senderId,
          new TextMessage("Hmmm... That doesn't seem like a course. Please type something like CSC 101")
        )
      } else {
        this._conversation.setCourse(message)
        this._conversation.save(error => {
          if (error) return ErrorHandling.handleError(this.senderId, error)

          if (modeContext === Modes.CONTRIBUTE) {
            Response.sendMessage(this.senderId, new TextMessage('Please upload a file'))
          } else if (modeContext === Modes.CONSUME) {
            this._resourceService.getResources(schoolContext, message, (error, resources) => {
              if (error) return ErrorHandling.handleError(this.senderId, error)

              const messages = []
              if (_.isEmpty(resources)) {
                messages.push(new TextMessage('Sorry no resources for this course were contributed yet. Be the first!'))
              } else {
                messages.push(new TextMessage("Ok! Here's some cram material for my favorite crammer <3..."))
                messages.push(Template.fromResources(resources))
              }
              messages.push(
                new Template(
                  send_api.button_template(
                    'Type another course or press cancel to return to the main menu',
                    [send_api.postback_button('Cancel', MainMenu.payload)])
                )
              )
              Response.sendMessages(this.senderId, messages)
            })
          } else {
            ErrorHandling.handleUnimplementedError(this.senderId)
          }
        })
      }
    } else {
      ErrorHandling.handleUnimplementedError(this.senderId)
    }
  }

  _handleAttachments(attachments) {
    const school = this._conversation.getSchool()
    const course = this._conversation.getCourse()

    if (school && course && attachments.length === 1) {
      BlobService.put(_.first(attachments).payload.url, (error, key) => {
        if (error) return ErrorHandling.handleError(this.senderId, error)

        const resource = new Resource({
          school: school,
          course: course,
          key: key
        })

        resource.save(error => {
          if (error) return ErrorHandling.handleError(this.senderId, error)

          Response.sendMessage(this.senderId, new TextMessage("Thank for contributing."))
        })
      })
    } else {
      ErrorHandling.handleUnimplementedError(this.senderId)
    }
  }
}


module.exports = ChatBot