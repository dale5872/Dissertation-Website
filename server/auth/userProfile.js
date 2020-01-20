class UserProfile {
    constructor() {
        this._userID;
        this._username;
        this._password;
        this._fname;
        this._lname;
        this._email;
    }

    registerProfile(username, password, fname, lname, email) {
        this._username = username;
        this._password = password;
        this._fname = fname;
        this._lname = lname;
        this._email = email;
    }

    loginProfile(username, password) {
        this._username = username;
        this._password = password;
    }


    set userID(userID) {
        this._userID = userID;
    }

    get userID() {
        return this._userID;
    }

    set username(username) {
        this._username = username;
    }
    
    get username() {
        return this._username;
    }

    set password(password) {
        this._password = password;
    }

    get password() {
        return this._password;
    }

    set fname(fname) {
        this._fname = fname;
    }

    get fname() {
        return this._fname;
    }

    set lname(lname) {
        this._lname = lname;
    }

    get lname() {
        return this._lname;
    }

    set email(email) {
        this._email = email;
    }

    get email() {
        return this._email;
    }
 
    generateProfile() {
        return {
            username: this._username,
            fname: this._fname,
            lname: this._lname,
            email: this._email,
        }
    }
}

module.exports = UserProfile;