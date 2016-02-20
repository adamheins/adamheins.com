# Personal Website
This is the source code for my [personal website](https://adamheins.com). This
website is home to my blog, project portfolio, and resume. The website includes
a custom content management system for creating and editing blog posts.

## Build and Run
Node.js, npm and mongoDB are required to run the website locally. After cloning
the repo, install the node module dependencies by running `npm install` in the
root directory.

The project requires a file called `.env` in the root directory from which to
source environment variables.

To start and stop the server, run one of the following:
```
npm start
npm stop
npm restart
```

To check the status of the Node.js and mongod processes, run `npm run status`.


This website uses [gulp](http://gulpjs.com) for it's build system. To build the
client-side resources, run `gulp`.

## License
MIT license. See the included LICENSE file for the full terms.
