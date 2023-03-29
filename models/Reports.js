const mongoose = require("mongoose");
const reportsSchema = new mongoose.Schema(
  {
    reportType: {
      //for artist  or  buyer
      type: String,
      required: true,
    },
    artist: {
      type: Object,
      required: true,
    },
    buyer: {
      type: Object,
      required: true,
    },
    category: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("reports", reportsSchema);
