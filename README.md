# JWT Tools

> A command-line parser for JSON web tokens

because I needed one.

## Installing

```
npm install -g jwt-tools
```

## Usage

### Signing

Signing a token is easy. Just give it a payload and a secret

```
jwt-tools sign -s verysecret '{ "sub": 1234567890, "name": "Mr Bigglesworth", "iat": 1544889736, "exp": 1544896936 }'
```

Output:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMzQ1Njc4OTAsIm5hbWUiOiJNciBCaWdnbGVzd29ydGgiLCJpYXQiOjE1NDQ4ODk3MzYsImV4cCI6MTU0NDg5NjkzNn0.l0YJqpInkK70lrSmy1KXtdXL2g4uHZS_vK-D4PnrrlA
```

### Parsing

Now let's parse the token we just created:

```
jwt-tools parse eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMzQ1Njc4OTAsIm5hbWUiOiJNciBCaWdnbGVzd29ydGgiLCJpYXQiOjE1NDQ4ODk3MzYsImV4cCI6MTU0NDg5NjkzNn0.l0YJqpInkK70lrSmy1KXtdXL2g4uHZS_vK-D4PnrrlA
```

Output:
```json
{
    "header": {
        "alg": "HS256",
        "typ": "JWT"
    },
    "payload": {
        "sub": 1234567890,
        "name": "Mr Bigglesworth",
        "iat": 1544889736,
        "exp": 1544896936
    },
    "signature": "l0YJqpInkK70lrSmy1KXtdXL2g4uHZS_vK-D4PnrrlA"
}
```

### Verifying

Verifying with our secret is easy as well

```
jwt-tools verify -s verysecret eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMzQ1Njc4OTAsIm5hbWUiOiJNciBCaWdnbGVzd29ydGgiLCJpYXQiOjE1NDQ4ODk3MzYsImV4cCI6MTU0NDg5NjkzNn0.l0YJqpInkK70lrSmy1KXtdXL2g4uHZS_vK-D4PnrrlA
```

Output:
```json
{
    "sub": 1234567890,
    "name": "Mr Bigglesworth",
    "iat": 1544889736,
    "exp": 1544896936
}
```

whereas

```
jwt-tools verify -s verysecretive eyJhbG
ciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMzQ1Njc4OTAsIm5hbWUiOiJNciBCaWdnbGVzd29ydGgiLCJpYXQiOjE1ND
Q4ODk3MzYsImV4cCI6MTU0NDg5NjkzNn0.l0YJqpInkK70lrSmy1KXtdXL2g4uHZS_vK-D4PnrrlA
```

gives

```
token not valid!
invalid signature
```

### Patching

Sometimes it is useful to be able to simply update one of the token claims and re-sign with the shared secret. For example, to extend the life of the token we may want to push the `exp` claim out by a couple of hours:

```
jwt-tools patch -s verysecret -p '$.exp=1544904136' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMzQ1Njc4OTAsIm5hbWUiOiJNciBCaWdnbGVzd29ydGgiLCJpYXQiOjE1NDQ4ODk3MzYsImV4cCI6MTU0NDg5NjkzNn0.l0YJqpInkK70lrSmy1KXtdXL2g4uHZS_vK-D4PnrrlA
```

Output:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMzQ1Njc4OTAsIm5hbWUiOiJNciBCaWdnbGVzd29ydGgiLCJpYXQiOjE1NDQ4ODk3MzYsImV4cCI6MTU0NDkwNDEzNn0.cD6gaA7mOwwB_1spZWhZsVwyzXuOO6Rj3uQYwnqX70M
```

A shortcut command to perform refreshing a token is [refresh](#refresh).

Note the syntax `$.exp` to target the `exp` field of the JWT's payload. In general, the -p option accepts any [JSON path](http://goessner.net/articles/JsonPath/) expression to reference one or more fields in the payload. For example to change the identity of the claimed subject,

```
jwt-tools patch -s verysecret -p `$.sub=1234567891, $.name=Fat Bastard` eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMzQ1Njc4OTAsIm5hbWUiOiJNciBCaWdnbGVzd29ydGgiLCJpYXQiOjE1NDQ4ODk3MzYsImV4cCI6MTU0NDg5NjkzNn0.l0YJqpInkK70lrSmy1KXtdXL2g4uHZS_vK-D4PnrrlA
```

### Refresh

Use `refresh` to simply refresh a token with an issued-at (`iat`) and expiration (`exp`) claim. For example, lets capture a new token in an environment variable `TOKEN`

```
export TOKEN=$(jwt-tools sign -s verysecret '{ "sub": 1234567890, "name": "Mr Bigglesworth", "iat": 1544889736, "exp": 1544896936 }')
```

We can easily verify that the token is expired

```
jwt-tools verify -verysecret $TOKEN
```

Output:

```
token not valid!
jwt expired
```

Now let's refresh the token

```
TOKEN=$(jwt-tools refresh -s verysecret $TOKEN)
```

Running verify again now returns the payload

```
{
  sub: 1234567890,
  name: 'Mr Bigglesworth',
  iat: 1546714663,
  exp: 1546721863
}
```

and we can see the timestamps have been updated (at time of this writing) with expiration set to the same 2 hour lifetime from the original token.

## Development

To set up a local development environment from a clone of this project, run a build with

```
npm build
```

then symlink to the local bin script with

```
npm link
```

from the project directory. The command `jwt-tools` should be on your `PATH` now

```
which jwt-tools
```

and should ultimately resolve to `./lib/cli.js`.

Any changes you make for development will now be reflected when you invoke the `jwt-tools` command from a terminal.

## Issues

Feel free to raise any issues on GitHub.
