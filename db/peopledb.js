const mongoose = require('mongoose')
const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)
console.log('connecting...')
mongoose.connect(url).then(() => {
    console.log('connected to MongoDB')
}).catch((err) => {
    console.log(err)
    console.log('connection failed')
})

const numberValidator = (val) => {
    const numberRegex = /^[0-9]+-[0-9]+$/
    return numberRegex.test(val)&&val.length >= 8
}

const phoneSchema = new mongoose.Schema({
    name: { type: String, minLength: 3, required: true },
    number: { type: String, validate: numberValidator },
})

phoneSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
    }
})

module.exports = mongoose.model('People', phoneSchema)
