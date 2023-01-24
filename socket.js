const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = [];

const getUser = (uid) => users.find((user) => user.uid === uid);

const addToUser = (uid, sid) => {
  !users.some((user) => user.uid === uid) && users.push({ uid, sid });
};

const removeFromUser = (sid) => {
  users = users.filter((user) => user.sid !== sid);
};

io.on("connection", (socket) => {
  //when connect
  console.log("a user connected.");

  //send and get message
  socket.on("sendMessage", ({ uid, rid, text }) => {
    // console.log(uid, rid, text);
    const user = getUser(rid);
    // console.log("users", users);
    // console.log(user);
    io.to(user.sid).emit("getMessage", {
      uid,
      text,
    });
  });

  // take user id  and socket id from user
  socket.on("sendUser", (uid) => {
    addToUser(uid, socket.id);
    io.emit("getUsers", users);
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeFromUser(socket.id);
    io.emit("getUsers", users);
  });
});
