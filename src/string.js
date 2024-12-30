
const toString = input => {
    if (typeof input === 'string') {
        return input
    } else if (input?.val) {
        return input.val
    }
    return ''
}

const truncate = (l = 255) => (str = '') => str.substring(0, l)

const convertToHexEscapedString = (input) => {
  let result = ''

  for (let i = 0; i < input.length; i++) {
      const char = input[i]
      const charCode = input.charCodeAt(i)

      if (charCode > 127) {
          // if character is a non-ASCII character
          // Convert to hexadecimal and escape it as \xNN format
          result += '\\x' + charCode.toString(16).padStart(2, '0')
      } else {
          // If ASCII character, add it directly to the result
          result += char
      }
  }

  return result
}

const formatEvent = (event = {}) => {
    const { calendar = '', summary = '' } = event
    return {
        ...event,
        calendar: truncate(24)(convertToHexEscapedString(toString(calendar))),
        summary: truncate(255)(convertToHexEscapedString(toString(summary))),
    }
}

module.exports = {
    formatEvent
}