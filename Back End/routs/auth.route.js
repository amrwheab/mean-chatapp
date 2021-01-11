const router = require('express').Router()
const User = require('../models/auth.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'assets')
  },
  filename: (req, file, callback) => {

    const dir = path.join(__dirname, '..', 'assets')
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    let dest = '';
    for (let i=file.originalname.length-1; i>=0; i--) {
      if (file.originalname[i] === '.'){
        dest += file.originalname[i]
        break;
      }else {
        dest += file.originalname[i]
      }
    }

    const dest2 =  req.headers.userid  + '_' + new Date().getTime() + dest.split('').reverse().join('');

    callback(null, dest2)
    const basePath = `${req.protocol}://${req.get('host')}/assets/`;
    User.findById(req.headers.userid).then(() => {
      User.updateOne({_id: req.headers.userid}, {$set:{imgUrl: basePath+ dest2}}).then(() => {
        return
    })
    })
  }
})

const upload = multer({storage})

router.get('/:id', (req, res, next) => {
  if (req.params.id !== null) {
    const token = jwt.decode(req.params.id);
    if (token !== null) {
      userId = token.id;
      User.findById(token.id).then(user => {
        if (user) {
          res.json(user)
        } else {
          res.json({_id: undefined, name: '',
          email: '',
          address: '',
          gender: '',
          password: '',
          info: '',
          imgUrl: '',
          freindRequists:[],
          freindList: [],
          online: false})
        }
      }).catch( err => {
        res.json({_id: undefined, name: '',
        email: '',
        address: '',
        gender: '',
        password: '',
        info: '',
        imgUrl: '',
        freindRequists:[],
        freindList: [],
        online: false})
      })
    }else {
      res.json({_id: undefined, name: '',
      email: '',
      address: '',
      gender: '',
      password: '',
      info: '',
      imgUrl: '',
      freindRequists:[],
      freindList: [],
      online: false})
    }
    }
})

router.post('/register', (req, res, next) => {
  console.log(req.body)
  User.findOne({email: req.body.email}).then(user => {
    if (user) {
      res.status(400).json('user is already exsits')
    }else {
      let hashedPass = req.body.password;
      bcrypt.hash(req.body.password, 10).then( hashed => {
        hashedPass = hashed
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          address: req.body.address,
          gender: req.body.gender,
          password: hashedPass,
          info: req.body.info,
          imgUrl: 'assets/user.png',
          freindRequists: [],
          freindList: [],
          online: true
        });
        newUser.save().then((user) => {
          let jwtSign = jwt.sign({id: user._id}, process.env.jwtSecret);
          res.header('auth-token', jwtSign).json({user, jwtSign});
          
        }).catch( err => {
          res.status(400).json(err)
        })
      })
    }
  }).catch(err => {
    console.log(err)
  })

})

router.post('/login', (req, res, next) => {
  User.findOne({email: req.body.email}).then(user => {
    if (user) {
      bcrypt.compare(req.body.password, user.password).then(result => {
        if (result) {
          let jwtSign = jwt.sign({id: user._id}, process.env.jwtSecret);
          res.header('auth-token', jwtSign).json({user, jwtSign})
        } else {
          res.status(400).json('password is incorrect')
        }
      })
    } else {
      res.status(400).json('email doesn\'t exsit')
    }
  }).catch(err => {
    res.status(400).json(err)
  })
});

router.get('/getuser/:id', (req, res, naxt) => {
  User.findById(req.params.id).then(user => {
    res.status(200).json(user)
  }).catch(() => {
    res.status(400).json('user not found')
  })
});

router.get('/getuserwithfriends/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    let userFriends = [];
    for (let i = 0; i < user.freindList.length; i++) {
      userFriends.push(await User.findById(user.freindList[i].userId).select('name info imgUrl address'))
    }

    res.status(200).json({user: user, userFriends: userFriends});
  } catch(err) {
    res.status(400).json('user not found')
  }
  
});

router.post('/changeimg', upload.single('file'), (req, res, next) => {
  res.send(req.file)
});

router.get('/searchUser/:name', (req, res, next) => {
    const name = req.params.name;
    User.find({name: new RegExp(name, "i") }).select('name imgUrl').then(users => {
        res.status(200).json(users)
    }).catch(err => {
      res.status(400).json(err)
    })
})


module.exports = router;
// module.exports = userId;