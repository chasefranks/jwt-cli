"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isExpired = void 0;

const isExpired = seconds => {
  let now = new Date();

  if (seconds * 1000 < now.getTime()) {
    return true;
  } else {
    return false;
  }
};

exports.isExpired = isExpired;