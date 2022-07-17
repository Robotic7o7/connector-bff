var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const qrcode = require('qrcode-terminal');
var aguid = require('aguid');
const cors = require("cors");
var dotenv = require("dotenv");
const axios = require('axios');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

dotenv.config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var commonRouter = require('./routes/common');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

var clientLocationMap = {};
var clientDataMap = {};

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.initialize();

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  console.log('AUTHENTICATED');
});

client.on('ready', () => {
  console.log('Client is ready!');
});

client.on('message', async (message) => {
  var clientContact = message.from
  if (message.type === 'chat') {
    if (message.body) {
      const media = MessageMedia.fromFilePath('./public/images/ambulet-logo.jpeg');
      var encodedMsg="Welcome%20to%20Ambulet%20Emergency%20Services.%0A%0APlease%20share%20your%20location%20via%20WhatsApp%20location%20share.%0A%0AThank%20you."
      client.sendMessage(clientContact, media, {
        caption: decodeURI(encodedMsg),
      });
      clientDataMap[clientContact] = message.body
    }
  }

  if (message.type === 'location') {
    var t1 = clientContact.slice(2)
    var t2 = t1.slice(0, -5);
    var finalContact = parseInt(t2)

    const contact = await message.getContact();

    /*var a1= JSON.stringify(message.location)
    console.log("STRIGIFY"+a1);
    var a2= a1.split(":");
    console.log("a2"+a2)
    var a3=a2.split(":");
    console.log("a3"+a3)*/

    var initiateHelpData = {
      "requestId": aguid(),
      "name": contact.pushname,
      "contact": finalContact,
      "message": clientDataMap[clientContact],
      "locationData": JSON.parse(JSON.stringify(message.location))
    }
    console.log(initiateHelpData);
    var url= "https://uhi-hackathon-provider-server.vercel.app/eua/sos"

    axios.post(url, initiateHelpData,
      {
          headers: {
              'Content-Type': 'application/json'
          }
      }
  )
      .then((response) => {
          var data = response.data;
          console.log("DATA SENT");
      },
          (error) => {
              console.log(error)
              
          }
      );
    clientLocationMap[clientContact] = initiateHelpData
    client.sendMessage(clientContact, 'Help is on the way, our executive shall call you shortly.');
  }
});


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/common', commonRouter);

module.exports = app;
