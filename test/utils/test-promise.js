'use strict';

const assert = require('assert');

const shouldEventuallyEqual = (actual, expected) => {
  return new Promise((resolve, reject) => {
    if(actual === expected) {
      resolve();
    } else {
      reject(new Error(
        'Actual value does not equal expected value: Act ' +
        actual + ' ' + typeof actual +
        ' | Exp ' +
        expected + ' ' + typeof expected
      ));
    }
  });
};

exports.shouldEventuallyEqual = shouldEventuallyEqual;

