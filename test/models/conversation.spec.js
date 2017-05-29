const Conversation = require('../../models/conversation')
const should = require('should')


describe('context', () => {
  it('defaults to empty', () => {
    const conversation = new Conversation({ senderId: '1' })
    conversation._context.should.deepEqual({})
  })
})
