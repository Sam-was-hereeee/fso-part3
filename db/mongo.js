const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('password required');
    process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://lemonbread5120:${password}@fullstackopen.a76lx.mongodb.net/?retryWrites=true&w=majority&appName=fullStackOpen`;

mongoose.set('strictQuery', false);
console.log('connecting...');
const connect = mongoose.connect(url).then(() => {
    console.log('connected to MongoDB');


    }).catch((err) => {
        console.log(err);
        console.log('connection failed')
});

const phoneSchema = new mongoose.Schema({
    name: String,
    number: String
});

const Phone = mongoose.model('Phone', phoneSchema);

const newPhone = new Phone({
    name: process.argv[3],
    number: process.argv[4]
})


connect.then(()=>{
        if (process.argv.length === 3) {
            Phone.find({}).then(result => {
                console.log(result);
                mongoose.connection.close().then(()=>{console.log('connection closed')})
            })

        } else {
            newPhone.save().then(result => {
                console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`);
                mongoose.connection.close().then(()=>{console.log('connection closed')})
            })
        }
    }
)