#!/bin/sh
":" //# comment; exec /usr/bin/env node --experimental-modules --no-warnings "$0" "$@"

import program from 'commander';

import {
    parse,
    verify,
    sign,
    patch,
    refresh
} from './commands';

program
    .version('0.0.1', '-v, --version')
    .description('A simple command-line tool for JSON web tokens')

program
    .command('parse <jwt>')
    .description('Simply parses a jwt and prints out contents as a JSON string without performing verification.')
    .action((jwt, cmd) => { parse(jwt); })

program
    .command('verify <jwt>')
    .description('verifies a jwt using a secret and the default HS256 signing algorithm')
    .option('-s, --secret <secret>', 'secret to verify jwt')
    .action((jwt, cmd) => { verify(jwt, cmd.secret); })

program
    .command('sign <payload>')
    .description('forms a jwt signed using a secret with the default HS256 algorithm')
    .option('-s, --secret <secret>', 'secret to sign with (uses default algorithm HS256)')
    .action((payload, cmd) => { sign(payload, cmd.secret); })

////////////////////////////////////////TO BE RELEASED
if (process.env.ENABLE_DEV_FEATURES) {
program
    .command('patch <jwt>')
    .description('prints out a new jwt updating the contents of the payload based on the options, and refreshing the signature with a secret')
    .option('-s, --secret <secret>', 'secret to sign with (uses default algorithm HS256)')
    .option('-p --path <path>', 'a list of key value pairs in the form jsonPath1=value1, jsonPath2=value2, ...')
    .action((jwt, cmd) => { patch(jwt, cmd.path, cmd.secret) });

program
    .command('refresh <jwt>')
    .description('refreshes the token by setting iat to now and setting exp based on the token\'s previous lifetime')
    .option('-s, --secret <secret>', 'secret to sign with (uses default algorithm HS256)')
    .action((jwt, cmd) => { refresh(jwt, cmd.secret) });
}
////////////////////////////////////////

program.parse(process.argv);
