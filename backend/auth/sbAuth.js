const Sib = require('sib-api-v3-sdk') // return a constructor
require('dotenv').config()
const { obj } = require('../controller/routeControllers.js')
console.log(obj.email);

const client = Sib.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.SB_API_KEY

const tranEmailApi = new Sib.TransactionalEmailsApi()

const sender = {
    email: 'kumarsanjeevdutta02@gmail.com',
    name: 'Sanjeev',
}

const receivers = [
    {
        email: 'kumaranshudutt94@gmail.com',
    },
    {
        email: obj.email,
    },
]

tranEmailApi
    .sendTransacEmail({
        sender,
        to: receivers,
        subject: 'testing nodejs and sendinblue mail service',
        textContent: `
        Nmaste dost, you receiving this mail because i am testing nodejs app.
        `,
        htmlContent: `
        <h1>Hello to you</h1>
        <p>Nmaste dost, you receiving this mail because i am testing nodejs app password resetting</p>
        <a href="https://github.com/sanjeevWeb">Visit</a>
                `,
        params: {
            role: 'Backend and Full stack',
        },
    })
    .then(console.log)
    .catch(console.log)