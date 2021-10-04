
const removeAccent = (str = '') => str.normalize ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : ''

const truncate = (l = 255) => (str = '') => str.substr(0, l)


const formatEvent = (event = {}) => {
    const { calendar = '', summary = '' } = event
    return {
        ...event,
        calendar: truncate(24)(removeAccent(calendar)),
        summary: truncate(255)(removeAccent(summary)),
    }
}

module.exports = {
    formatEvent
}