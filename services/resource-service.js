const Resource = require('../models/resource')

/**
 * Helper class for running queries to fetch resources.
 * We may want to filter out content the users do not have access to
 */
class ResourceService {

  static get SAMPLE_MATERIAL_LIMIT() {
    return 5
  }

  /**
   * A valid course string is something like CSC 225, CSC225
   * @param text
   * @returns {boolean}
   */
  static isValidCourse(text) {
    return ResourceService.parseCourseTerm(text) !== null
  }

  /**
   * Parses a string of the form CSC 225 to ['CSC', '225']
   *
   * Returns null if the string cannot be parsed
   * @param term
   * @return string[] department in first position, course number in 2nd position
   * E.g. ['CSC', '225']
   */
  static parseCourseTerm(term) {
    const re = /([A-z]+)(\s*)(\d+)/
    const match = term.match(re)

    if (match) {
      return [match[1], match[3]]
    } else {
      return null
    }
  }

  getSampleMaterial(school, callback) {
    this._findApprovedResources(
      { school: school },
      callback)
  }


  /**
   * Get resources for a school and course. Intended to check if
   * course term is valid first using Resource.isValidCourse before calling
   * this method
   *
   * @param school
   * @param courseTerm
   * @param callback function(error, resources) {}
   * Called with error if the course term is not valid
   */
  getResources(school, courseTerm, callback) {
    const maybeDeptAndCourseNumber = ResourceService.parseCourseTerm(courseTerm)

    if (maybeDeptAndCourseNumber) {
      const dept = maybeDeptAndCourseNumber[0]
      const courseNumber = maybeDeptAndCourseNumber[1]

      this._findApprovedResources({
        school: new RegExp('^' + school || '', 'i'), // substring match,
        course: new RegExp(`(${dept})(\\s*)(${courseNumber})`, 'i')
      }, callback)
    } else {
      callback(new Error(`Invalid course term ${courseTerm}`))
    }
  }

  /**
   * Query resources that are 'approved' for listing
   * in the application
   *
   * @param query
   * @param callback
   * @private
   */
  _findApprovedResources(query, callback) {
    Resource.find(query)
      .where('isApproved').equals(true)
      .limit(ResourceService.SAMPLE_MATERIAL_LIMIT)
      .exec(callback)
  }
}

module.exports = ResourceService

