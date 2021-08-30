require('dotenv').config()
const catalyst = require('zcatalyst-sdk-node')
const express = require('express')
const app = express()

// @Routes
const books = require('./routes/books')
const crm = require('./routes/crm')
const creator = require('./routes/creator')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/books', books)
app.use('/crm', crm)
app.use('/creator', creator)

app.get('/', async (req, res) => {
  res.status(200).send({
    code: 0,
    status: 'ok',
  })
})

module.exports = app
