# Personal Website
This is the source code for my [personal website](https://adamheins.com). This
website is home to my blog, project portfolio, and resume.

## Build and Run
Node.js, npm and mongoDB are required to run the website locally. After cloning
the repo, install the node module dependencies by running `npm install` in the
root directory.

The project requires a file called `.env` in the root directory from which to
source environment variables. The required variables are:
```
NODE_ENV        # Environment, either 'dev' or 'production'.
HOST            # Host name.
MONGO_URI       # URI of mongodb instance.
AUTH_EMAIL_USER # Email address used to send auth tokens.
AUTH_EMAIL_PASS # Password for the auth email account.
AUTH_EMAIL_SMTP # SMTP server of the auth email account.
SESSION_SECRET  # Secret used for user sessions.
PORT            # The port to run on.
STATIC_HOST     # URI pointing to static files.
```

To start and stop the server, run one of the following:
```
npm start
npm stop
npm restart
```

To check the status of the Node.js and mongod processes, run `npm run status`.

## License
MIT license. See the included LICENSE file for the full terms.
