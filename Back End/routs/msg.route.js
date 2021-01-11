const router = require('express').Router()
const Messages = require('../models/message.model')
const User = require('../models/auth.model')
const jwt = require('jsonwebtoken')

router.get('/getmsg/:id', (req, res, next) => {
  Messages.findById(req.params.id).then(msg => {
    res.status(200).json(msg)
  }).catch(err => {
    res.status(400).json(err)
  })
})

router.get('/getconv/:token', (req, res, next) => {
  if (req.params.token !== null) {
    const token = jwt.decode(req.params.token);

    if (token !== null) {
      let friendInfo = [];

      User.findById(token.id).then(async (user) => {
        for (let i = 0; i < user.freindList.length; i++) {
          const userr = await User.findById(user.freindList[i].userId).select('name imgUrl online');
            const msg = await Messages.findById(user.freindList[i].msgId);

            let notSeenMsg = 0
            if (msg.msgs[msg.msgs.length -1]) {
              if (user._id.toString() !== msg.msgs[msg.msgs.length -1].user) {
                notSeenMsg = msg.msgs.filter(ele => !ele.seen).length
              }
            }

              friendInfo.push({
                id: msg._id,
                friendId: userr._id,
                imgUrl: userr.imgUrl,
                name: userr.name,
                lastMSG: msg.msgs[msg.msgs.length -1] ? msg.msgs[msg.msgs.length -1] : {msg: '', seen: false, time: 0, user:''},
                notSeenMsg: notSeenMsg,
                online: userr.online
              });
              
            }

            res.status(200).json({friendInfo, userId: user._id})
      }).catch(() => {
        res.json({friendInfo: [{
          id: undefined,
          friendId: '',
          imgUrl: '',
          name: '',
          lastMSG: {msg: '', seen: false, time: 0, user:''},
          notSeenMsg: 0,
          online: false}], userId:''})
      })

    } else {
      res.json({friendInfo: [{
        id: undefined,
        friendId: '',
        imgUrl: '',
        name: '',
        lastMSG: {msg: '', seen: false, time: 0, user:''},
        notSeenMsg: 0,
        online: false}], userId:''})
    }
  } else {
    res.json({friendInfo: [{
      id: undefined,
      friendId: '',
      imgUrl: '',
      name: '',
      lastMSG: {msg: '', seen: false, time: 0, user:''},
      notSeenMsg: 0,
      online: false}], userId:''})
  }
})

module.exports = router;