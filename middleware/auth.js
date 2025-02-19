function ensureAuthenticated(req, res, next) {
    if (req.session.userId) {
      return next();
    } else {
      res.status(401).send('You need to log in to access this page');
    }
  }
  
  module.exports = { ensureAuthenticated };