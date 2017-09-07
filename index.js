const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const bodyParser = require('body-parser')

const app = express()
const host = process.env.APPLICATION_URL || 'localhost'
const port = 3000
const mongoHost = process.env.MONGODB_HOST || 'localhost:27017'

const appInfo = require('./package.json')
const launched = new Date()

console.log(host,port,mongoHost);

mongoose.connect(`mongodb://${mongoHost}/todo`)
mongoose.connection.on('error', () => {
  console.log('ERROR: Unable to connect to MongoDB... retrying')
  mongoose.connect(`mongodb://${mongoHost}/todo`)
})

const todos = require('./todos')

function logErrors (err, req, res, next) {
  console.error(err.stack)
  next(err)
}

function errorHandler (err, req, res, next) {
  res.status(500)
  res.json({ error: err })
}

app.listen(port, () => {
  var hostName = 'http://' + host + ':' + port
  console.log('Application running at: ' + hostName)
})

app.use(bodyParser.json())
app.use(logErrors)
app.use(errorHandler)
app.use(cors())

// Routes
app.get('/', function (req, res) {
  res.send({
    name: appInfo.name,
    version: appInfo.version,
    author: appInfo.author,
    deployed: launched.toLocaleString()
  })
})
app.get('/todos', todos.all)
app.get('/todos/:id', todos.one)
app.post('/todos', todos.create)
app.put('/todos/:id', todos.update)
app.delete('/todos/:id', todos.delete)
