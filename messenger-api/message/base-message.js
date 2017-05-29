/**
 * A message is anything we can send in facebook's send-api
 */
class BaseMessage {
  /**
   * Returns the this message in json format
   */
  get json() {
    throw new Error('No implementation found for BaseMessage.json()')
  }
}

module.exports = BaseMessage