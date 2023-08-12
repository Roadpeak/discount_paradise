// jshint esversion:8
const crypto = require('crypto');
const User = require('../../models/user');
const Password = require('../../utils/password');
const { sendMail } = require('../../utils/sendmail');

// @desc          register user
// @route         Get /api/v1/auth/register
// @access         public

exports.registeruser = async (req, res, next) => {
    if (req.session.user) {
        res.redirect('/')
    }
    if (req.method == 'POST') {
        const { username, email, phone, password, repassword } = req.body;
        if (email == "" || username == "" || phone == "" || password == "" || repassword == "") {
            req.flash('error', 'empty values cannot be submited');
            return res.redirect('/auth');
        }
        if (password != repassword) {
            req.flash('error', 'Password should match');
            return res.redirect('/auth');
        }
        const user = await User.findOne({ phone: phone });
        if (user) {
            req.flash('error', 'Phone already exists');
            return res.redirect('/auth');
        }
        User.findOne({ email: email })
            .then(userDocs => {
                if (userDocs) {
                    req.flash('error', 'Email already exists');
                    return res.redirect('/auth');
                }
                const user = new User({ username: username, email: email, password: password, phone: phone, });
                return user.save()
                    .then(async newuser => {
                        if (req.query.upline) {
                            const upline = await User.findOne({ _id: req.query.upline })
                            if (upline) {
                                console.log(upline);
                                user.upline = req.query.upline;
                                user.save();
                            }
                        }
                        const activateUrl = `https://${req.get('host')}/activate/${newuser.id}`;
                        const message = `Welcome to infinace ${newuser.username}. Please activate your account to get started. Click this link ${activateUrl}`;
                        const subj = "Welcome";
                        await sendMail(user.username, user.email, subj, message);
                        req.flash('success', 'Registration successful.Head to your email to activate account');
                        return res.redirect('/auth');
                    });
            })
            .catch(error => {
                console.log(error);
                req.flash('error', 'Error occured plese contact admin');
                return res.redirect('/auth');
            });
    } else {
        res.render('signup', { message: req.flash('error') })
    }
};

exports.loginuser = async (req, res, next) => {
    if (req.session.user) {
        console.log(req.session.user);
        return res.redirect('/')
    }
    if (req.method == 'POST') {
        if (req.body.email == "" || req.body.password == "") {
            req.flash('error', 'empty values cannot be submited');
            return res.redirect('/login');
        }
        const { email, password } = req.body;
        const existinguser = await User.findOne({ email });
        if (!existinguser) {
            req.flash('error', 'User does not exist');
            return res.redirect('/auth')
        }
        const matchpassword = await Password.compare(existinguser.password, password);
        if (!matchpassword) {
            req.flash('error', 'Wrong password');
            return res.redirect('/auth')
        }
        if (!existinguser.isActive) {
            req.flash('error', 'User is not activated');
            return res.redirect('/auth')
        }
        req.session.user = existinguser;
        req.session.is_loggedin = true;
        return res.redirect('/')
    } else {
        res.render('signin', { successmessage: req.flash('success'), errormessage: req.flash('error') })
    }

};


exports.logout = (req, res, next) => {
    console.log('hey');
    req.session.destroy(function (err) {
        if (err) {
            return next(err);
        } else {
            req.session = null;
            console.log(req.session);
            console.log("logout successful");
            return res.redirect('/');
        }
    });
};

exports.forgotpass = async (req, res, next) => {
    if (req.session.user) {
        res.redirect('/')
    }
    if (req.method == 'POST') {
        if (req.body.email == "") {
            req.flash('error', 'empty values cannot be submited');
            return res.redirect('/auth');
        }
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            req.flash('error', 'User does not exist');
            return res.redirect('/auth');
        }

        const resetToken = user.getResetPasswordToken();
        console.log(resetToken);
        const reseturl = `https://${req.get('host')}/resetpassword/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) has requested a reset of password. Please click this link ${reseturl}`;
        const subj = "Password Renewal";
        try {
            await sendMail(user.username, user.email, subj, message);
            req.flash('success', 'Instructiions were sent to your email');
            res.redirect('/auth');
        } catch (error) {
            console.log(error);
            user.resetPasswordToken = undefined;
            user.resetPassworExpire = undefined;
            await user.save({ validateBeforeSave: false });
            req.flash('error', 'something went wrong');
            res.redirect('/auth');
        }
        await user.save(
            {
                validateBeforeSave: false
            }
        );
    } else {

        res.render('auth', { successmessage: req.flash('success'), errormessage: req.flash('error') });
    }

};

exports.resetPassword = async (req, res, next) => {
    // get hashed token
    const resetpassToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
    console.log(resetpassToken);
    const user = await User.findOne({
        resetPasswordToken: resetpassToken,
    });

    console.log(user);
    if (!user) {
        req.flash('error', 'User does not exist');
        return res.redirect('/auth')
    }
    if (req.method == 'POST') {
        if (req.body.password == "") {
            req.flash('error', 'empty values cannot be submited');
            return res.redirect('/auth');
        }
        if (req.body.password !== req.body.repassword) {
            req.flash('error', 'passwords should match')
            return res.redirect(`/resetpassword/${req.params.resettoken}`)
        }
        // set new pass
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPassworExpire = undefined;
        await user.save();
        req.session.user = user;
        req.session.is_loggedin = true
        req.flash('success', 'Password reset');
        res.redirect('/')
    } else {
        res.render('resetpassword', { successmessage: req.flash('success'), errormessage: req.flash('error') })
    }
};