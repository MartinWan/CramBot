const ResourceService = require('../../services/resource-service')
const should = require('should')

describe('parseCourseTerm', () => {
  it('converts courses of the form CSC226' , () => {
    const result = ResourceService.parseCourseTerm('CSC226')
    should.equal(result[0], 'CSC')
    should.equal(result[1], '226')
  })
  it('converts courses of the form CSC 226', () => {
    const result = ResourceService.parseCourseTerm('CSC 226')
    should.equal(result[0], 'CSC')
    should.equal(result[1], '226')
  })
  it('converts courses of the form CHEM 150', () => {
    const result = ResourceService.parseCourseTerm('CHEM 150')
    should.equal(result[0], 'CHEM')
    should.equal(result[1], '150')
  })
})

describe('isValidCourse', () => {
  it('returns false for random strings', () => {
    should.equal(ResourceService.isValidCourse('foo'), false)
  })
  it('returns true for a course', () => {
    should.equal(ResourceService.isValidCourse('CHEM  150'), true)
  })
})