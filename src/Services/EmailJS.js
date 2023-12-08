import emailjs from "@emailjs/browser"

class Email {
    constructor() {
        emailjs.init(process.env.REACT_APP_EMAILJS_SECRET_KEY)
        this.serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID
    }

    async sendQuery(payload) {
        const { name, email, message } = payload
        
        const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID_QUUERY
        try {
            await emailjs.send(
                this.serviceId,
                templateId,
                {
                    name: name,
                    email: email,
                    message: message
                }
            )    
        } catch (error) {
            throw error
        }
    }
}

const emailInstance = new Email()

export default emailInstance