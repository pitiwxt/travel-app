const mqtt = require('mqtt');
const client = mqtt.connect('wss://test.mosquitto.org:8081/mqtt');
client.on('connect', () => {
    console.log('MQTT connected');
    client.end();
});
client.on('error', (err) => {
    console.error('MQTT error', err);
    client.end();
});
setTimeout(() => { console.log('Timeout'); client.end(); }, 5000);
