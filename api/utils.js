const express = require('express');

// utility function that sends an error if there is no user logged in
function requireUser(req, res, next) {
  // if the request body does not contain a user object, execute the next function in 
  // the if statement. 
  if (!req.user) {
    next({
      name: "MissingUserError",
      message: "You must be logged in to perform this action"
    });
  }
  // if there is a user logged in, execute this next function so that the server
  // can proceed with the user's request
  next();
}

module.exports = {
  requireUser
}