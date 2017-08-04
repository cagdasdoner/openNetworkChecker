var mqtt = require('mqtt'), url = require('url');

/* Global Params. */
var connectedToBroker = false;
var pollTimer = null;
var connectionPollInterval = 2000;
var mqttUser = 'USER';
var mqttPass = 'PASS';
var mqttTopic = 'TOPIC';
var mqttAddress = 'mqtt://vestelmqtt.xyz:1883';

/* Configuring MQTT client. */
var options = {username: mqttUser, password: mqttPass};
var mqtt_client = mqtt.connect(mqttAddress, options);

/* MQTT events. */
mqtt_client.on('connect', function() {
    console.log("MQTT connected.");
    connectedToBroker = true;
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

/* Timeout functions. */
function connectionPollCb()
{
    if(connectedToBroker)
    {
        mqtt_client.publish(mqttTopic, '1');
    }
}

function clearTimer()
{
    clearInterval(pollTimer);
    pollTimer = null;
}

function setTimer()
{
    if(pollTimer != null)
    {
       clearTimer();
    }
    pollTimer = setInterval(connectionPollCb, connectionPollInterval);
}