/**
 * Module responsible for handling messenger events
 */
const Conversation = require('../models/conversation')
const ResourceService = require('../services/resource-service')
const ChatBot = require('../messaging/chatbot')
const ErrorHandling = require('./error-handling')
const ActionFactory = require('./action/action-factory')

/**
 * Handle the various messenger events from Facebook
 * @param messagingEvent
 */
exports.handle = function(messagingEvent) {
  const senderID = messagingEvent.sender.id
  const recipientID = messagingEvent.recipient.id
  const timestamp = messagingEvent.timeStamp

  orchestrateChatbot(messagingEvent, (error, bot) => {
    if (error) return ErrorHandling.handleError(senderID, error)

    if (messagingEvent.optin) {
      console.log("Received authentication for user %d and page %d with pass " +
        "through param '%s' at %d", senderID, recipientID, messagingEvent.optin.ref,
        timestamp)

      bot.receivedAuthentication(messagingEvent)
    } else if (messagingEvent.message) {
      console.log("Received message for user %d and page %d at %s with message:",
        senderID, recipientID, timestamp)

      bot.receivedMessage(messagingEvent)
    } else if (messagingEvent.delivery) {
      const delivery = messagingEvent.delivery
      const messageIDs = delivery.mids || []
      const watermark = delivery.watermark
      messageIDs.forEach(function(messageID) {
        console.log("Received delivery confirmation for message ID: %s",
          messageID)
      })
      console.log("All message before %d were delivered.", watermark)

      bot.receivedDeliveryConfirmation(messagingEvent)
    } else if (messagingEvent.postback) {
      console.log("Received postback for user %d and page %d with payload '%s' " +
        "at %d", senderID, recipientID, messagingEvent.postback.payload, timestamp)

      bot.receivedPostBack(messagingEvent)
    } else if (messagingEvent.read) {
      console.log("Received message read event for watermark %d and sequence " +
        "number %d", messagingEvent.read.watermark, messagingEvent.read.seq)

      bot.receivedMessageRead(messagingEvent)
    } else if (messagingEvent.account_linking) {
      console.log("Received account link event with for user %d with status %s " +
        "and auth code %s ", senderID, messagingEvent.account_linking.status,
        messagingEvent.account_linking.authorization_code)

      bot.receivedAccountLink(messagingEvent)
    } else {
      console.log("Webhook received unknown messagingEvent: ", messagingEvent)
    }
  })
}

/**
 * Create the chatbot with all of its dependencies
 * @param event
 * @param done
 */
function orchestrateChatbot(event, done) {
  Conversation.getOrElseInsert(event.sender.id, (error, conversation) => {
    if (error) return done(error)

    const resourceService = new ResourceService()
    const actionFactory = new ActionFactory(conversation, resourceService)
    done(null, new ChatBot(conversation, actionFactory, resourceService))
  })
}

