const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const cron = require('node-cron');
const runSample = require('./src');


const SCOPES = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.settings.sharing',
    'https://www.googleapis.com/auth/gmail.settings.basic',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose'
];

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials-desktop.json');

// Load the already saved credentials of authenticated users
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

// Dump the newly generated credentials for authenticated user on given path
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}


// initiate authorization
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

// enlist the labels
async function listLabels(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.labels.list({
        userId: 'me',
    });
    const labels = res.data.labels;
    return [labels, auth]
}

// enlist the mails from mailbox
async function listEmails(incomingData) {

    let auth = incomingData[1]

    let threadMapping = {}

    const gmail = google.gmail({ version: 'v1', auth });

    const res = await gmail.users.messages.list({
        userId: 'me',
    });
    const Messages = res.data.messages;

    // if we don't have any messages
    if (!Messages || Messages.length === 0) {
        console.log('No Messages found.');
        return;
    }

    Messages.forEach((message) => {
        let messageThreadId = message.threadId
        if (Object.keys(threadMapping).includes(messageThreadId)) {
            threadMapping[messageThreadId]["count"] += 1
        } else {
            threadMapping[messageThreadId] = {
                messageId: message.id,
                count: 1
            }
        }
    });

    return [threadMapping, auth, incomingData[0]];
}

// initiate the replying process
async function replyThreads(incomingData) {

    if (incomingData && incomingData.length > 0) {

        let threadMapping = incomingData[0]

        let auth = incomingData[1]

        for (let element of Object.keys(threadMapping)) {
            if (threadMapping[element]["count"] === 1) {

                let messageToBeReplied = threadMapping[element]["messageId"]

                const gmail = google.gmail({ version: 'v1', auth });

                // fetch email details
                let individualMessage = await gmail.users.messages.get({
                    id: messageToBeReplied,
                    userId: "me"
                });
                
                let individualMessageDetail = individualMessage.data

                let subjectHeader = individualMessageDetail.payload.headers.find(ele => ele.name.toLocaleLowerCase() === "subject").value

                let fromAddress = individualMessageDetail.payload.headers.find(ele => ele.name.toLocaleLowerCase() === "from").value

                let messageIdHeader = individualMessageDetail.payload.headers.find(ele => ele.name === "Message-ID").value

                runSample(auth, element, fromAddress, subjectHeader, messageIdHeader)
            }
        }
        console.log("------------------Exectuted-----------------")
    } else {
        console.log("------------------No Email's in Inbox -----------------")
    }



}

// cron schduler which will execute the code once after a minute
cron.schedule('*/1 * * * *', () => {
    authorize().then(listLabels).then(listEmails).then(replyThreads).catch(console.error);
});