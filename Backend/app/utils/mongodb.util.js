// const { MongoClient } = require("mongodb");

// class MongoDB {
//   static connect = async (uri) => {
//     if (this.client) return this.client;
//     this.client = await MongoClient.connect(uri);
//     return this.client;
//   };
// }

// module.exports = MongoDB;

const mongoose = require("mongoose");

class MongoDB {
  static async connect(uri) {
    if (this.connection) return this.connection;
    await mongoose.connect(uri);
    return this.connection;
  }
}

module.exports = MongoDB;
