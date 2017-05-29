const Consume = require('../../messaging/action/consume')
const should = require('should')

describe('payload', () => {
  it('should return the menu postback for search', () => {
    Consume.payload.should.equal('MENU_POSTBACKS_SEARCH')
  })
})
