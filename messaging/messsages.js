/**
 * Represents hard coded messages used by the chatbot.
 * In the future we may want to localize them to support different languages.
 */
class Messages {
  static get VIEW_RESOURCE() {
    return 'View'
  }

  static get GET_STARTED_GREETING() {
    return "Hi! I'm CramBot, you can think of me as your personal " +
      "saviour that helps you cram for your courses by providing " +
      "beautiful cram material."
  }

  static get CONSUME_WHICH_SCHOOL() {
    return "Which institution do you cram at?"
  }

  static get CONTRIBUTE_WHICH_SCHOOL() {
    return "Where is your cram material from?"
  }

  static get CONSUME_WHICH_COURSE() {
    return "What course are you cramming for?"
  }

  static get CONTRIBUTE_WHICH_COURSE() {
    return "What course is your cram material from?"
  }

  static CRAM_MATERIAL_FROM(schoolName) {
    return `Here is some sample cram material from ${schoolName}`
  }
}

module.exports = Messages