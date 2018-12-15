# JWT-CLI

> A command-line parser for JSON web tokens

because I needed one.

## Installing

```
npm install -g jwt-tools
```

## Usage

Signing a token is easy. Just give it a payload and a secret

```
jwt-tools sign -s verysecret '{ "sub": 1234567890, "name": "Mr Bigglesworth", "iat": 1544889736, "exp": 1544896936 }'
```

Output:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMzQ1Njc4OTAsIm5hbWUiOiJNciBCaWdnbGVzd29ydGgiLCJpYXQiOjE1NDQ4ODk3MzYsImV4cCI6MTU0NDg5NjkzNn0.l0YJqpInkK70lrSmy1KXtdXL2g4uHZS_vK-D4PnrrlA
```

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
