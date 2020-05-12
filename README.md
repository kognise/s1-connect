# S1 Connect

S1 session store for [Express](http://expressjs.com/) and [Connect](https://github.com/senchalabs/connect).

## Installation

Install it with either NPM or Yarn like so:

```
npm install s1-connect
yarn add s1-connect
```

## Usage

### Express or Connect integration

Express `4.x`, `5.0` and Connect `3.x`:

```js
const session = require('express-session')
const S1Store = require('connect-s1')(session)

app.use(
  session({
    secret: 'foo',
    store: new S1Store({ token: 'token for s1' })
  })
)
```

### Generate a token

You probably want to generate a token for your database - just head over to [s1.kognise.dev/token](https://s1.kognise.dev/token) and copy that. I recommend you put it in an environment variable since it can be used to access all your precious session data.
