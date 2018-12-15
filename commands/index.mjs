import jwt from 'jsonwebtoken';

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
    process.stdout.write(signedToken + '\n');
}

export const patch = ( token, path, secret ) => {
    console.log(`${ JSON.stringify({ token, path, secret }) }`);
}

const json = (obj) => {
    return JSON.stringify(obj, null, 4) + '\n';
}
