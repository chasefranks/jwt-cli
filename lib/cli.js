#!/usr/bin/env node
"use strict";

var _commander = _interopRequireDefault(require("commander"));

var _commands = require("./commands");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander.default.version('1.0.1', '-v, --version').description('A simple command-line tool for JSON web tokens');

_commander.default.command('parse <jwt>').description('Simply parses a jwt and prints out contents as a JSON string without performing verification.').action((jwt, cmd) => {
  (0, _commands.parse)(jwt);
});

_commander.default.command('verify <jwt>').description('verifies a jwt using a secret and the default HS256 signing algorithm').option('-s, --secret <secret>', 'secret to verify jwt').action((jwt, cmd) => {
  (0, _commands.verify)(jwt, cmd.secret);
});

_commander.default.command('sign <payload>').description('forms a jwt signed using a secret with the default HS256 algorithm').option('-s, --secret <secret>', 'secret to sign with (uses default algorithm HS256)').action((payload, cmd) => {
  (0, _commands.sign)(payload, cmd.secret);
});

_commander.default.command('patch <jwt>').description('prints out a new jwt updating the contents of the payload based on the options, and refreshing the signature with a secret').option('-s, --secret <secret>', 'secret to sign with (uses default algorithm HS256)').option('-p --path <path>', 'a list of key value pairs in the form jsonPath1=value1, jsonPath2=value2, ...').action((jwt, cmd) => {
  (0, _commands.patch)(jwt, cmd.path, cmd.secret);
});

_commander.default.command('refresh <jwt>').description('refreshes the token by setting iat to now and setting exp based on the token\'s previous lifetime').option('-s, --secret <secret>', 'secret to sign with (uses default algorithm HS256)').action((jwt, cmd) => {
  (0, _commands.refresh)(jwt, cmd.secret);
});

_commander.default.parse(process.argv);