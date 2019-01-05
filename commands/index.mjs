import jwt from 'jsonwebtoken';
import jp from 'jsonpath';
import util from 'util';

import '../expiredDates';

export const parse = (token) => {
    let decoded = jwt.decode(token, { complete: true });
    process.stdout.write(inspect(decoded));
}

export const verify = ( token, secret ) => {
    try {
        let verified = jwt.verify(token, secret);
        process.stdout.write(inspect(verified))
    } catch(error) {
        process.stdout.write(`token not valid!\n${error.message}\n`);
    }
}

export const sign = ( payload, secret ) => {
    // parse and cleanse the input
    let payloadObj = JSON.parse(payload);
    let signedToken = jwt.sign(payloadObj, secret, { header: { typ: 'JWT' } });
    process.stdout.write(signedToken + '\n');
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

    process.stdout.write(signedToken + '\n');

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
    process.stdout.write(refreshedToken + '\n');

}

const inspect = (obj) => {

    // convert exp to date so it can be rendered by our
    // custom util inspect function
    if (obj.payload && obj.payload.exp && process.env.ENABLE_DEV_FEATURES) {
        let time = obj.payload.exp * 1000;
        obj.payload.exp = new Date(time);
    }

    return util.inspect(obj, {
        compact: false,
        colors: true
    }) + '\n';

}
