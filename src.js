
const { google } = require('googleapis');

// function for triggering mail
async function runSample(auth, incomingThreadID, fromAddress, subject, messageId) {
    const gmail = google.gmail({ version: 'v1', auth });

    // You can use UTF-8 encoding for the subject using the method below.
    // You can also just use a plain string if you don't need anything fancy.
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;

    // supply the message parts
    const messageParts = [
        'From: Justin Beckwith <beckwith@google.com>',
        `To: ${fromAddress}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Reference: ${messageId}`,
        `In-Reply-To: ${messageId}`,
        `Subject: ${utf8Subject}`,
        '',
        `🌴 Vacation Notice 🌴

        Hello,
        
        I hope this email finds you well. I wanted to let you know that I am currently on vacation. During this time, I will have limited access to email and may not be able to respond promptly.
        
        Thank you for your understanding. I will get back to you as soon as I return.
        
        Best regards,
        Jack`,
    ];

    // join the message parts as single string
    const message = messageParts.join('\n');

    // The body needs to be base64url encoded.
    const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    // initiate the send email mechanism
    const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: encodedMessage,
            threadId: incomingThreadID
        },
    });

    // attach a new label to sent email
    const updatedGmail = await gmail.users.messages.modify({
        userId: "me",
        id: res.data.id,
        requestBody: {
            addLabelIds: ["Label_5091976681185583145"],
        }
    })

    // console.log("after Update", updatedGmail.data);

    // return the response
    return res.data;
}

module.exports = runSample