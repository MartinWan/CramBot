/**
 * Simple enumeration for the mode in the menu the chatbot is operating in.
 * E.g. For now only content consumtion and contribution modes are supported. But
 * this will include other menu items like 'Help'
 */
class Modes {
  static get CONSUME() {
    return 'CONSUME_MODE'
  }

  static get CONTRIBUTE() {
    return 'CONTRIBUTE_MODE'
  }
}

module.exports = Modes