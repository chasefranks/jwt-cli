const { exec } = require('child_process');
const { expect } = require('chai');

/*
* This test script runs against the jwt-tools command
* found on your current PATH. You may need to link your
* development version into your path by running `npm link`
* before running `npm test`.
*/
describe('jwt-tools', () => {
  describe('--help', () => {
    it('should print the help menu', (done) => {
      exec('jwt-tools --help', (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }
        expect(stdout).to.contain('A simple command-line tool for JSON web tokens');
        done();
      })
    })
  })
  describe('sign', () => {
    it('should create a signed jwt with the requested claims', (done) => {
      let secret = 'verysecret';
      let payload = '\'{ "sub": 1234567890, "name": "Mr Bigglesworth", "iat": 1544889736, "exp": 1544896936 }\'';

      exec(`jwt-tools sign -s ${secret} ${payload}`, (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }

        let token = stdout.trim();
        let [header_b64, payload_b64, signature_b64] = token.split('.');

        // expect the usual header
        expect(header_b64).to.equal('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')

        // expect signature to be 256 bits
        let signatureBuffer = Buffer.from(signature_b64, 'base64');
        expect(signatureBuffer).to.have.length(32);

        let payloadBuffer = Buffer.from(payload_b64, 'base64');
        let claims = JSON.parse(payloadBuffer.toString());

        expect(claims.sub).to.equal(1234567890);
        expect(claims.name).to.equal("Mr Bigglesworth");
        expect(claims.iat).to.equal(1544889736);
        expect(claims.exp).to.equal(1544896936);

        done();
      })
    })
  })
  describe('parse', () => {
    it('should parse the token', (done) => {
      let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMzQ1Njc4OTAsIm5hbWUiOiJNciBCaWdnbGVzd29ydGgiLCJpYXQiOjE1NDQ4ODk3MzYsImV4cCI6MTU0NDg5NjkzNn0.l0YJqpInkK70lrSmy1KXtdXL2g4uHZS_vK-D4PnrrlA';
      exec(`jwt-tools parse ${token}`, (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }

        let result = stdout;

        // should always give a json string
        let parsedResult;
        try {
          parsedResult = JSON.parse(result)
        } catch (error) {
          done(error);
          return;
        }

        done();
      })
    })
  })
  describe('verify', () => {
    it('should reject expired token', (done) => {
      let secret = 'verysecret';
      let expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMzQ1Njc4OTAsIm5hbWUiOiJNciBCaWdnbGVzd29ydGgiLCJpYXQiOjE1NDQ4ODk3MzYsImV4cCI6MTU0NDg5NjkzNn0.l0YJqpInkK70lrSmy1KXtdXL2g4uHZS_vK-D4PnrrlA';

      exec(`jwt-tools verify -s ${secret} ${expiredToken}`, (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }
        expect(stdout).to.contain('jwt expired');
        done();
      })
    })

    let token;
    let secret = 'verysecret';
    let payload = '\'{ "sub": 12345, "name": "Austin Powers" }\'';

    before('create a valid token', (done) => {
      exec(`jwt-tools sign -s ${secret} ${payload}`, (error, stdout, stderr) => {
        token = stdout;
        done();
      })
    })
    it('should reject token with invalid signature', (done) => {
      let wrongSecret = 'verysecretive';
      exec(`jwt-tools verify -s ${wrongSecret} ${token}`, (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }
        expect(stdout).to.contain('invalid signature');
        done();
      });
    });
    it('should display payload if token is valid', (done) => {
      exec(`jwt-tools verify -s ${secret} ${token}`, (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }

        try {
          let claims = JSON.parse(stdout);
          expect(claims.name).to.equal("Austin Powers");
          expect(claims.sub).to.equal(12345);
          done();
        } catch (error) {
          done(error);
          return;
        }

      });
    })
  })
  describe('patch', () => {

    let token;
    let secret = 'verysecret';
    let payload = '\'{ "sub": 12345, "name": "Austin Powers", "scope": "profile email" }\'';

    before('create a valid token', (done) => {
      exec(`jwt-tools sign -s ${secret} ${payload}`, (error, stdout, stderr) => {
        token = stdout;
        done();
      })
    });
    it('should patch the token with specified json path and value', (done) => {
      exec(`jwt-tools patch -s ${secret} -p \'$.scope=profile email picture\' ${token}`, (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }
        let patchedToken = stdout;
        // ensure patched token verifies and has the
        exec(`jwt-tools verify -s ${secret} ${patchedToken}`, (error, stdout, stderr) => {
          if (error) {
            done(error);
            return;
          }
          let verifiedClaims = JSON.parse(stdout);
          expect(verifiedClaims.sub).to.equal(12345);
          expect(verifiedClaims.name).to.equal("Austin Powers");
          expect(verifiedClaims.scope).to.equal("profile email picture");
          done();
        })
      })
    })
  });
  describe('refresh', () => {
    it('should refresh the token', (done) => {
      let secret = 'verysecret';
      let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMzQ1Njc4OTAsIm5hbWUiOiJNciBCaWdnbGVzd29ydGgiLCJpYXQiOjE1NDQ4ODk3MzYsImV4cCI6MTU0NDg5NjkzNn0.l0YJqpInkK70lrSmy1KXtdXL2g4uHZS_vK-D4PnrrlA";

      // verify we have an expired token
      exec(`jwt-tools verify -s ${secret} ${token}`, (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }
        expect(stdout).to.contain('jwt expired');

        // token is expired, now we refresh
        exec(`jwt-tools refresh -s ${secret} ${token}`, (error, stdout, stderr) => {
          let refreshed = stdout;
          // should verify
          exec(`jwt-tools verify -s ${secret} ${refreshed}`, (error, stdout, stderr) => {
            if (error) {
              done(error);
              return;
            }
            try {
              // token is verified if payload returned as JSON
              JSON.parse(stdout)
            } catch (error) {
              done(error);
            }
            done();
          })
        });
      });
    });
  });
});
