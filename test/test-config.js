const durationInMinutes = 60;
const ISODuration = 'PT1H'
const startDateTime = new Date();
const endDateTime = new Date(startDateTime.getTime() + (durationInMinutes * 60000));

module.exports = {
  appId: "{app-id}",
  token: "{access-token}",
  startTime: startDateTime.toISOString(),
  endTime: endDateTime.toISOString(),
  duration: ISODuration,
  durationInMinutes,
  // durationInMinutes: Math.ceil(parseFloat(moment.duration(this.duration).asMinutes())),
  ownerAddress: "margarethamilton@turing.ac.uk",
  ownerName: "Margaret Hamilton",
};
