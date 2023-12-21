
// this code can be used to integrate mailing service from sendinblue in any project
const Sib = require('sib-api-v3-sdk') // return a constructor
require('dotenv').config()

const client = Sib.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.SB_API_KEY

const tranEmailApi = new Sib.TransactionalEmailsApi()

const sender = {
    email: process.env.email,
    name: 'Sanjeev',
}

const receivers = [
    {
        email: process.env.email,
    },
    {
        email: process.env.email,
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
        <a href="https://github.com">Visit</a>
                `,
        params: {
            role: 'Backend and Full stack',
        },
    })
    .then(console.log)
    .catch(console.log)