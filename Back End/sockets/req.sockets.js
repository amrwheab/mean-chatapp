const User = require('../models/auth.model');
const Messages = require('../models/message.model');
const jwt = require('jsonwebtoken');
let userIdConnection = [];


module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('user connected');
    
    socket.on('getConnected', (id) => {
      if (id !== null) {
        const token = jwt.decode(id);
        if (token !== null) {
          userIdConnection.push({socketId: socket.id, userId: token.id})
          User.updateOne({_id: token.id}, {$set: {online: true}}).then(() => {
            io.emit(token.id + 'friendOnline', token.id, true);
          }).catch()
        }
      }
      socket.on('disconnect', () => {
        try {
          const userIdDis = userIdConnection.find(ele => ele.socketId === socket.id).userId;
          User.updateOne({_id: userIdDis}, {$set: {online: false}}).then(() => {
            io.emit(userIdDis + 'friendOnline', userIdDis, false);
            userIdConnection = userIdConnection.filter(ele => ele.userId !== userIdDis);
          }).catch()
        } catch {}
        
      })
    });



    socket.on('addFriend', (data) => {
      User.findById(data.userId).then(user => {
        user.freindRequists.push(data.visitorId)

        user.save().then(() => {
          User.findById(data.visitorId).then(visitor => {
            const friendReq = {
              id: visitor._id,
              name: visitor.name,
              pic: visitor.imgUrl,
              added: true
            }
            io.emit(data.userId, friendReq)
            socket.emit('FR', visitor._id)
          })
        }).catch(err => {
          console.log(err)
        })
      })
    })

    socket.on('cancelFriend', data => {
      User.findById(data.userId).then(user => {
        user.freindRequists = user.freindRequists.filter(ele => ele !== data.visitorId)

        user.save().then(() => {
          User.findById(data.visitorId).then(visitor => {
            const friendReq = {
              id: visitor._id,
              name: visitor.name,
              pic: visitor.imgUrl,
              added: false
            }
            io.emit(data.userId, friendReq)
            socket.emit('cancelFR')
          })
        }).catch()
      })
    })

    socket.on('acceptFriendReq', data => {
      const message = new Messages({
        user1: data.user1,
        user2: data.user2,
        msgs: []
      })
      message.save().then(msg => {
        User.findById(data.user1).then(user => {
          user.freindList.push({
            userId: data.user2,
            msgId: msg._id,
            lastMSG: ''
          })

          user.save().then(user11 => {
            io.emit(data.user2 + 'addedFR', user11)
          })
        })

        User.findById(data.user2).then(user => {
          user.freindList.push({
            userId: data.user1,
            msgId: msg._id,
            lastMSG: ''
          })
          user.freindRequists = user.freindRequists.filter(ele => ele !== data.user1)

          user.save().then(user22 => {
            io.emit(data.user1 + 'addedFR', user22)
          })
        })

      }).catch()
    })

    socket.on('rejectFriendReq', (data) => {
      User.findById(data.user2).then(user => {
        user.freindRequists = user.freindRequists.filter(ele => ele !== data.user1)
        io.emit(data.user2 + 'rejectedFR', data.user1)
        io.emit(data.user1 + 'rejectedFRSender')
        user.save().catch()
      })
    })

    
  })
}