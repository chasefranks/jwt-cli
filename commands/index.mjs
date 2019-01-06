import jwt from 'jsonwebtoken';
import jp from 'jsonpath';
import colors from 'colors';

import { isExpired } from '../date';

export const parse = (token) => {
    let decoded = jwt.decode(token, { complete: true });
    process.stdout.write(json(decoded));
}

export const verify = ( token, secret ) => {
    try {
        let verified = jwt.verify(token, secret);
        process.stdout.write(json(verified))
    } catch(error) {
        process.stdout.write(`token not valid!\n${error.message}\n`);
    }
}

export const sign = ( payload, secret ) => {
    // parse and cleanse the input
    let payloadObj = JSON.parse(payload);
    let signedToken = jwt.sign(payloadObj, secret, { header: { typ: 'JWT' } });
    printToken(signedToken);
}

export const patch = ( token, path, secret ) => {

    // path will be list of pairs like jsonPath=newValue separated by commas
    let pairs = path.split(',');

    let decoded = jwt.decode(token, { complete: true });
    let { payload } = decoded;

    // set new claims
    pairs.forEach((pair) => {
        let jpath = pair.split('=')[0].trim();
        let val = pair.split('=')[1].trim();

        jp.apply(payload, jpath, (value) => {
            // determine type of value here
            if (Number.isInteger(value)) {
                return parseInt(val);
            } else {
                return val;
            }
        })
    });

    // sign with secret
    let signedToken = jwt.sign(payload, secret, { header: { typ: 'JWT' } });
    printToken(signedToken);

}

export const refresh = (token, secret) => {

    let decoded = jwt.decode(token, { complete:true });

    let { header, payload } = decoded;

    let now = new Date();

    // get lifetime of token in seconds if available (if exp is present)
    if (payload.exp) {
        let lifetime = payload.exp - payload.iat;

        payload.iat = Math.floor(now.getTime() / 1000);
        payload.exp = payload.iat + lifetime;
    } else {
        payload.iat = Math.floor(now.getTime() / 1000);
    }

    // sign and return
    let refreshedToken = jwt.sign(payload, secret, { header });
    printToken(refreshedToken);

}

const printToken = (token) => {
    process.stdout.write(token + '\n')
}

const json = (obj) => {
    let objToJson = JSON.stringify(obj, null, 4) + '\n';
    return color(objToJson);
}

const color = (jsonString) => {
    return jsonString.split('\n')
        .map(line => line.cyan)
        .map(line => {
            // check if line is an expiration date
            if (line.includes('"exp":')) {
                let keyValue = line.split(':');
                if (isExpired(parseInt(keyValue[1])))
                    keyValue[1] = keyValue[1].red;
                return keyValue.join(':');
            } else {
                return line;
            }
        }).join('\n');
}
