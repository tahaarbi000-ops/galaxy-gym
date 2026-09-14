async function checkServerDate(req, res, next) {
  try {
    // Server's current date in Tunisia
    const serverDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Tunis",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    // Trusted current date
    const response = await fetch(
      "https://timeapi.io/api/Time/current/zone?timeZone=Africa/Tunis"
    );

    if (!response.ok) {
      return res.status(503).json({
        message: "Unable to verify server date",
      });
    }

    const data = await response.json();

    // Extract only YYYY-MM-DD
    const realDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Tunis",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(data.dateTime));

    // Compare ONLY the date
    if (serverDate !== realDate) {
      return res.status(503).json({
        message: "Server date is incorrect",
        serverDate,
        realDate,
      });
    }

    next();
  } catch (error) {
    console.error("Date check error:", error);

    return res.status(503).json({
      message: "Unable to verify server date",
    });
  }
}

module.exports = checkServerDate;