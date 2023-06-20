const express = require('express')
const { default: mongoose } = require('mongoose')
// const cors = require('cors')
const User = require('../models/User')
const admin = {
    login: 'ilyas',
    password: 'ilyas'
}
const app = express()
app.use(express.json({ limit: '50mb' }))
mongoose.connect('mongodb://127.0.0.1:27017/users')

function cors(req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
}
// app.use(cors())
app.use(cors)

async function addPhoto(userLogin, photobase64) {
    const date = new Date()
    const date1 = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 4)
    await User.updateOne({ login: userLogin },
        {
            $push: {
                photos: {
                    body: photobase64,
                    createdDate: date,
                    deletedDate: date1
                }
            }
        })
}
async function deleteThirdDayPhoto() {
    const date = new Date()
    console.log(`Deleting: ${date.getDate()}.${date.getMonth()}.${date.getFullYear()} `)
    const users = await User.find()
    users.map(user => {
        user.photos.map(async photo => {
            const deletedDateDay = new Date(photo.deletedDate).getDate()
            if (date.getDate() == deletedDateDay) {
                await User.updateOne({ _id: user._id }, {
                    $pull: {
                        photos: {
                            _id: photo._id
                        }
                    }
                })
            }
        })
    })
}
setInterval(() => {
    deleteThirdDayPhoto()
}, 259200)

app.get('/', async (req, res) => {
    res.send('Deleting')
})

app.post('/getphoto', async (req, res) => {
    const { login, password } = req.body
    const user = await User.findOne({ login: login })
    if (!user) {
        res.json({ user: 'null' })
        return
    }
    else if (user.password != password) {
        res.json({ user: 'wrong password' })
        return
    }
    res.json({
        user: 'gone',
        photos: user.photos
    })
})

app.post('/addphoto', async (req, res) => {
    req.isAdded = false
    const { login, photobase64 } = req.body
    const user = await User.findOne({ login: login })
    if (!user) {
        res.json({ isAdded: req.isAdded })
        return
    }

    req.isAdded = true
    addPhoto(login, photobase64)
    res.json({ isAdded: req.isAdded })
})

app.post('/adminpanel', async (req, res) => {
    const users = await User.find()
    const { login, password } = req.body
    if (login != admin.login) {
        res.json({
            admin: 'null'
        })
        return
    }
    else if (password != admin.password) {
        res.json({
            admin: 'wrong password'
        })
        return
    }
    res.json({
        admin: 'gone',
        data: users
    })
})

app.listen(3000, () => {
    console.log("Server work!")
})