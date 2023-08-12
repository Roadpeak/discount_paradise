// jshint esversion:6
const RequireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/')
    }
    next();
};

module.exports = RequireAuth;