"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.refresh = exports.patch = exports.sign = exports.verify = exports.parse = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _jsonpath = _interopRequireDefault(require("jsonpath"));

var _colors = _interopRequireDefault(require("colors"));

var _date = require("../date");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const parse = token => {
  let decoded = _jsonwebtoken.default.decode(token, {
    complete: true
  });

  process.stdout.write(json(decoded));
};

exports.parse = parse;

const verify = (token, secret) => {
  try {
    let verified = _jsonwebtoken.default.verify(token, secret);

    process.stdout.write(json(verified));
  } catch (error) {
    process.stdout.write(`token not valid!\n${error.message}\n`);
  }
};

exports.verify = verify;

const sign = (payload, secret) => {
  // parse and cleanse the input
  let payloadObj = JSON.parse(payload);

  let signedToken = _jsonwebtoken.default.sign(payloadObj, secret, {
    header: {
      typ: 'JWT'
    }
  });

  printToken(signedToken);
};

exports.sign = sign;

const patch = (token, path, secret) => {
  // path will be list of pairs like jsonPath=newValue separated by commas
  let pairs = path.split(',');

  let decoded = _jsonwebtoken.default.decode(token, {
    complete: true
  });

  let {
    payload
  } = decoded; // set new claims

  pairs.forEach(pair => {
    let jpath = pair.split('=')[0].trim();
    let val = pair.split('=')[1].trim();

    _jsonpath.default.apply(payload, jpath, value => {
      // determine type of value here
      if (Number.isInteger(value)) {
        return parseInt(val);
      } else {
        return val;
      }
    });
  }); // sign with secret

  let signedToken = _jsonwebtoken.default.sign(payload, secret, {
    header: {
      typ: 'JWT'
    }
  });

  printToken(signedToken);
};

exports.patch = patch;

const refresh = (token, secret) => {
  let decoded = _jsonwebtoken.default.decode(token, {
    complete: true
  });

  let {
    header,
    payload
  } = decoded;
  let now = new Date(); // get lifetime of token in seconds if available (if exp is present)

  if (payload.exp) {
    let lifetime = payload.exp - payload.iat;
    payload.iat = Math.floor(now.getTime() / 1000);
    payload.exp = payload.iat + lifetime;
  } else {
    payload.iat = Math.floor(now.getTime() / 1000);
  } // sign and return


  let refreshedToken = _jsonwebtoken.default.sign(payload, secret, {
    header
  });

  printToken(refreshedToken);
};

exports.refresh = refresh;

const printToken = token => {
  process.stdout.write(token + '\n');
};

const json = obj => {
  return JSON.stringify(obj, null, 4) + '\n';
};
/**
 * Can be used to color json string to highlight or warn. For example,
 * this example highlights expired dates.
 *
 * TODO we want to make this feature togglable so colors can be disabled.
 */


const color = jsonString => {
  return jsonString.split('\n').map(line => {
    // check if line is an expiration date
    if (line.includes('"exp":')) {
      let keyValue = line.split(':');
      if ((0, _date.isExpired)(parseInt(keyValue[1]))) keyValue[1] = keyValue[1].red;
      return keyValue.join(':');
    } else {
      return line;
    }
  }).join('\n');
};