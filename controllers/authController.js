const passport = require('passport');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are logged in!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are logged out! 👋');
  res.redirect('/');
}