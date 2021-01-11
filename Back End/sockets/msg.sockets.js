const Messages = require('../models/message.model')

module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('sendMsg', (data) => {
      Messages.findById(data.msgId).then((msg) => {
        const mess = {user: data.user, msg: data.msg, time: new Date().getTime(), seen: false}
        msg.msgs.push(mess)

        msg.save().then(() => {
          io.emit(msg.user1+'Msg', mess, data.msgId)
          io.emit(msg.user2+'Msg', mess, data.msgId)
        })
      })
    })

    socket.on('seenMSG', (id) => {
      Messages.updateMany({_id: id, "msgs.seen": false}, {
        $set: {
          "msgs.$[].seen": true
        }
      }).then(() => {
        Messages.findById(id).then((msg) => {
          io.emit(msg.user1+'seenMsg', id);
          io.emit(msg.user2+'seenMsg', id);
        })
      })
    })
  })
}