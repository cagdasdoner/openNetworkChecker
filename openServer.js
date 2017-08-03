var http = require('http'), express = require('express');
var methodOverride = require('method-override');
var querystring = require('querystring');
var mqtt = require('mqtt'), url = require('url');

/* Global Params. */
var connectedToBroker = false;
var connectedToClient = false;
var genericTimer = null;
var ConnectionCheckInterval = 5000;
var httpPort = 80;
var mqttUser = 'USER';
var mqttPass = 'PASS';
var mqttTopic = 'TOPIC';
var mqttAddress = 'mqtt://vestelmqtt.xyz:1883';

var port = process.env.PORT || httpPort;
var app = express();
app.use(methodOverride());

/* Start HTTP Server */
var server = http.createServer(app).listen(port, function() {
    console.log("HTTP Server listening to %d within %s environment",
          port, app.get('env'));
});

/* Configuring MQTT client. */
var options = {username: mqttUser, password: mqttPass};
var mqtt_client = mqtt.connect(mqttAddress, options);

/* MQTT events. */
mqtt_client.on('connect', function() {
    console.log("MQTT connected.");
    connectedToBroker = true;
    mqtt_client.subscribe(mqttTopic);
    setTimer();
});

mqtt_client.on('error', function(err) {
    connectedToBroker = false;
    console.log("MQTT Connection error!! " + err);
});

mqtt_client.on('offline', function() {
    connectedToBroker = false;
    console.log("MQTT Client is offline!");
});

mqtt_client.on('message', function(topic, message, packet) {
    if(topic == mqttTopic)
    {
        connectedToClient = true;
        setTimer();
    }
});

/* HTTP handling. */
app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.get('/', function(req, res){
    if(connectedToBroker == true)
    {
        if(connectedToClient == true)
        {
          res.send("Geldi:)");
        }
        else
        {
          res.send("Gelmedi:(");
        }
        
    }
    else
    {
        res.send("System status : DOWN!");
    }
});

/* Timeout functions. */
function connectionDroppedCb()
{
    connectedToClient = false;
}

function clearTimer()
{
    clearInterval(genericTimer);
    genericTimer = null;
}

function setTimer()
{
    if(genericTimer)
    {
    	 clearTimer();
    }
    genericTimer = setInterval(connectionDroppedCb, ConnectionCheckInterval);
}