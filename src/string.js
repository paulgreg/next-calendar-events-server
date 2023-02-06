
const toString = input => {
    if (typeof input === 'string') {
        return input
    } else if (input?.val) {
        return input.val
    }
    return ''
}

const removeAccent = (str = '') => str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/’/g, "'") 
    .replace(/´/g, "'") 
    .replace(/’/g, "'") 

const truncate = (l = 255) => (str = '') => str.substring(0, l)


const formatEvent = (event = {}) => {
    const { calendar = '', summary = '' } = event
    return {
        ...event,
        calendar: truncate(24)(removeAccent(toString(calendar))),
        summary: truncate(255)(removeAccent(toString(summary))),
    }
}

module.exports = {
    formatEvent
}