const ical = require("node-ical");
const fs = require("fs");
const calendars = require("../parameters");
const { formatEvent } = require("./string");
const { formatDate, getDates, checkIfDateInRange, checkIfPeriodicEvent, isToday } = require("./date");
const d = require("debug")("cal");

const SAVED_FILE = "./dist/next-events.json";

const dates = getDates();
const { today } = dates;

const getEvents = async ({ url, auth, calendar }) => {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      if (d.enabled) d(`fetching ${url}`);
      const data = await ical.async.fromURL(url, { headers: { Authorization: auth } });
      if (d.enabled) d(`${url}: ${Object.keys(data).length} events`);
      return { calendar, data };
    } catch (error) {
      retries++;
      if (retries === maxRetries) {
        throw new Error(`Failed to fetch events from ${calendar} after ${maxRetries} attempts: ${error.message}`);
      }
      const backoff = 1000 * retries;
      if (d.enabled) d(`Attempt ${retries} failed for ${calendar}. Retrying in ${backoff} ms...`);
      await new Promise((resolve) => setTimeout(resolve, backoff)); // Exponential backoff
    }
  }
};

Promise.all(calendars.map(getEvents))
  .then((datas) => {
    const events = [];
    if (d.enabled) d(`${datas.length} arrays of datas`);
    datas.forEach(({ calendar, data }) => {
      Object.values(data)
        .filter(({ type }) => type === "VEVENT")
        .forEach((ev, idx) => {
          const { summary, start, end } = ev;
          const dateStart = formatDate(dates, start);
          const dateEnd = formatDate(dates, end);

          if (d.enabled) d(idx, dateStart, summary);

          const formatedEvent = formatEvent({
            calendar,
            summary,
          });

          if (checkIfDateInRange(dates, { dateStart, dateEnd })) {
            events.push({
              ...formatedEvent,
              dateStart,
              dateEnd,
              isToday: isToday(today, dateStart),
            });
          } else {
            const overrideDates = checkIfPeriodicEvent(dates, ev?.rrule?.options);
            if (overrideDates) {
              events.push({
                ...formatedEvent,
                dateStart: overrideDates.dateStart,
                dateEnd: overrideDates.dateEnd,
                isToday: isToday(today, overrideDates.dateStart),
              });
            }
          }
        });
    });
    return events;
  })
  .then((events) =>
    events.sort((a, b) => {
      if (a.dateStart < b.dateStart) return -1;
      if (a.dateStart > b.dateStart) return 1;
      return 0;
    })
  )
  .then((events) => {
    fs.writeFile(SAVED_FILE, JSON.stringify(events), (err) => {
      if (err) {
        console.err(err);
        process.exit(2);
      }
      console.log(`${events.length} events saved in ${SAVED_FILE}`);
      process.exit(0);
    });
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
