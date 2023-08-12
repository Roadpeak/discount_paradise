// jshint esversion:6
const bcrypt = require('bcrypt');
class Password {
    static toHash(password) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        return hashedPassword;
    }
    static compare(storedPassword, suppliedPossword) {
        return bcrypt.compareSync(suppliedPossword, storedPassword);
    }
}

module.exports = Password;