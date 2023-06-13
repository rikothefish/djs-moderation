const { connect, set } = require("mongoose");

module.exports = initializeDB = async () => {
  await set("strictQuery", true);
  await connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }).catch((err) => {
    console.log(err.stack);
  });
};
