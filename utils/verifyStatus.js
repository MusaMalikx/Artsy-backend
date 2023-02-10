const verifyStatus = (startDate, endDate) => {
  const date1 = new Date(endDate); //end date
  const date2 = new Date(); //current date
  const startdate = new Date(startDate); //start date
  let str = "";
  if (date1 - date2 > 0 && startdate - date2 <= 0) {
    return (str = "live");
  } else if (startdate - date2 > 0) {
    return (str = "comming soon");
    //   setTimer('Auction Comming Soon');
  } else {
    return (str = "closed");
    //   setTimer('Auction Closed');
  }
};

const verifyDates = (startDates, endDates) => {
  const startDate = new Date(startDates);
  const endDate = new Date(endDates);
  const currentDate = new Date();
  currentDate.setMinutes(currentDate.getMinutes() - 5);
  const diffInSecondsStart = Math.abs(endDate - startDate) / 1000; //difference in seconds for end and start
  let daysStart = Math.floor(diffInSecondsStart / 60 / 60 / 24); //difference of end and start in days

  const diffInSecondsCur = Math.abs(endDate - currentDate) / 1000; //difference in seconds for end and current
  let daysCur = Math.floor(diffInSecondsCur / 60 / 60 / 24); //difference of end and current  in days

  let msg = "";
  if (
    startDate - currentDate >= 0 &&
    endDate - currentDate > 0 &&
    daysCur !== 0
  ) {
    if (endDate - startDate > 0 && daysStart !== 0) {
      return (msg = "correct");
    } else {
      return (msg = "Invalid End Date");
    }
  }
  if (startDate - currentDate < 0) return (msg = "Invalid Start Date");
  else if (endDate - currentDate <= 0 || daysCur === 0)
    return (msg = "Invalid End Date");
  return (msg = "Invalid Dates");
};

module.exports = { verifyStatus, verifyDates };
