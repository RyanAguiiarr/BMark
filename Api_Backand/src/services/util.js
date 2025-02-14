const moment = require("moment");

module.exports = {
    isOpened: async (horarios) => {},
    toCents: (price) => {
        return parseInt(price.toString().replace(".", "").replace(",", ""));
    },
    hourToMinutes: (hourMinute) => {
        // 1:20
        const [hour, minute] = hourMinute.split(":");
        return parseInt(hour) * 60 + parseInt(minute);
    },
};