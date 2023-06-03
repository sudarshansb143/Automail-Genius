# Automail Genius

## Description

This project utilizes the Node.js Gmail SDK to detect new emails and replies only once to the newer emails that do not have prior replies. It incorporates the node-cron scheduler to perform these steps every 1 minute. The project adheres to the latest code standards and includes detailed comments for better code understanding.

## Prerequisites

To run this project, ensure you have the following installed on your system:
```bash 
Node.js (v16.13.2)
NPM (v8.1.2)
Gmail API credentials
GCP Project credentials

```

## Installation

- Clone the repository 

- Navigate to the project directory: 

```bash 
cd project-directory
```

- Install dependencies: 

```bash
npm install
```

## Configuration

Rename the config.example.js file to config.js.

Open config.js and replace YOUR_GMAIL_API_CREDENTIALS with your Gmail API credentials.

## Usage

To start the project, follow these steps:

Open a terminal in the project directory.
Run the following command:

```bash
node index.js
```

The project will now start running and will check for new emails every 1 minute using the Gmail SDK. It will reply only once to newer emails that do not have prior replies.

## Code Structure

The project code is structured as follows:

- index.js: The main entry point of the application.
- src.js: Contains function which will trigger the mail and update the label.
- credentials.json: Contains the credentials needed to configure GMAIL SDK.
- token.json: Contains configration to enable SDK interaction.

## Contributing

Contributions are welcome! If you find any issues or want to enhance the project, please open an issue or submit a pull request.

## Planned Improvements

- Ommit no-reply mails.
- Add more concrete logic of schduling.
- Reporting dashboard.


## License

This project is licensed under the MIT License.

## Contact

For any questions or support, please reach out to sudarshansb143@gmail.com.
