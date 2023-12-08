import emailjs from "@emailjs/browser"

class Email {
    constructor() {
        emailjs.init("syqCDHF4AxoLIUJRH")
        this.serviceId = ""
    }

    async sendQuery(payload) {
        const { name, email, message } = payload
        
        const templateId = ""
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