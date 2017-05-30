const mongoose = require('mongoose')
const Modes = require('../models/modes')

/**
 * Provides context for messages received in the conversation.
 *
 * For example, knowing the school the user attends impacts the conversation
 *
 * @type {{
 * mode: String,
 * school: String,
 * course: String
 * }}
 */
const Context = {
  mode: String,
  school: String,
  course: String
}


/**
 * A conversation models dialogue between a user and the chatbot
 *
 * @param senderId is the facebook messenger sender id
 * @param context the conversation's context
 */
const conversationSchema = new mongoose.Schema({
  senderId: { type: String, unique: true, required: true },
  _context: { type: Context, default: {} }
})


conversationSchema.methods.setMode = function(mode) {
  this._context.mode = mode
  this.markModified('_context')
}


conversationSchema.methods.getMode = function() {
  return this._context.mode
}


conversationSchema.methods.switchMode = function() {
  if (this.getMode() === Modes.CONSUME) {
    this.setMode(Modes.CONTRIBUTE)
  } else if (this.getMode() === Modes.CONTRIBUTE) {
    this.setMode(Modes.CONSUME)
  } else {
    throw new Error(`Unknown mode: ${this.getMode()}`)
  }
}


conversationSchema.methods.hasFullResourceContext = function() {
  if (this.getMode() && this.getCourse() && this.getSchool()) {
    return true
  } else {
    return false
  }
}


conversationSchema.methods.setSchool = function(school) {
  this._context.school = school
  this.markModified('_context')
}


conversationSchema.methods.getSchool = function() {
  return this._context.school
}


conversationSchema.methods.setCourse = function(course) {
  this._context.course = course
  this.markModified('_context')
}


conversationSchema.methods.getCourse = function() {
  return this._context.course
}


conversationSchema.statics.getOrElseInsert = function(senderId, callback) {
  this.findOne({ senderId: senderId }, (err, previousConversation) => {
    if (err) {
      callback(null, err)
    } else {
      if (!previousConversation) {
        const conversation = new this({ senderId: senderId })
        conversation.save(callback)
      } else {
        previousConversation.save(callback)
      }
    }
  })
}


conversationSchema.methods.clearContext = function() {
  this._context = {}
  this.markModified('_context')
}


module.exports = mongoose.model('Conversation', conversationSchema)