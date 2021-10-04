
const removeAccent = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

const truncate = l => str => str.substr(0, l)


const formatEvent = (event = {}) => {
    const { calendar = '', summary = '', location = '' } = event
    return {
        ...event,
        calendar: truncate(24)(removeAccent(calendar)),
        summary: truncate(255)(removeAccent(summary)),
        location: removeAccent(location)
    }
}

module.exports = {
    formatEvent
}