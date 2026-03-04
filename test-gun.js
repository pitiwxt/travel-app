const Gun = require('gun');
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
gun.get('test-node').put({ hello: 'world' }, (ack) => {
    console.log('Ack:', ack);
    process.exit(0);
});
setTimeout(() => { console.log('Timeout'); process.exit(1); }, 5000);
