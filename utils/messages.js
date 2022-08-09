const moment = require('moment');
function formatMessage(username, text, colorNum) {
  return {
    username,
    text,
    time: moment().format('h:mm a'),
    colorNum,
  };
}

module.exports = formatMessage;
