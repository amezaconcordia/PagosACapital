require('dotenv').config()
const catalyst = require('zcatalyst-sdk-node')
const express = require('express')
const app = express()
const session = require('express-session')
const bcrypt = require('bcryptjs')

// @Routes
const books = require('./routes/books')
const crm = require('./routes/crm')
const creator = require('./routes/creator')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    // maxAge: 3600,
  })
)

app.get('/', async (req, res) => {
  res.status(200).send({
    code: 0,
    status: 'ok',
  })
})

// login
app.post('/login', (req, res) => {
  const catalysApp = catalyst.initialize(req)
  let query = `SELECT * FROM Accesos WHERE Sector = ${req.body.sector}`
  let zcql = catalysApp.zcql()
  let zcqlPromise = zcql.executeZCQLQuery(query)
  zcqlPromise
    .then(async (queryResult) => {
      let passTabla = queryResult[0].Accesos.Password
      console.log(passTabla)

      const valid = await bcrypt.compare(req.body.password, passTabla)
      if (valid) {
        req.session.active = true
        res.status(200).redirect('/app/index.html')
      } else {
        res.status(401).redirect('/')
      }
    })
    .catch((err) => console.log(err))
})

app.post('/encrypt', async (req, res) => {
  console.log(req.body.password)
  const salt = await bcrypt.genSalt(10)
  const hashPass = await bcrypt.hash(req.body.password, salt)
  res.send(hashPass)
})

app.get('/acceso', async (req, res) => {
  const catalysApp = catalyst.initialize(req)
  let query = 'SELECT * FROM Accesos WHERE Sector = Desarrollo'
  let zcql = catalysApp.zcql()
  let zcqlPromise = zcql.executeZCQLQuery(query)
  zcqlPromise
    .then(async (queryResult) => {
      let passTabla = queryResult[0].Accesos.Password
      console.log(passTabla)

      const valid = await bcrypt.compare('concordia', passTabla)
      console.log(valid)
    })
    .catch((err) => console.log(err))
})

app.use('/books', validarSession, books)
app.use('/crm', validarSession, crm)
app.use('/creator', validarSession, creator)

function validarSession(req, res, next) {
  if (req.session.active === true) {
    next()
  } else {
    console.log('No hay una sesion activa.')
    res.end()
  }
}

module.exports = app
