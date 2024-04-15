//You can add and export any helper functions you want here. If you aren't using any, then you can just leave this file as is.

const exportedMethods = {
    checkName(name) {
        if(typeof name !== 'string' || name.trim() === '') {
            throw 'Name must be non empty string';
        }
        if(/\d/.test(name)) {
            throw 'Name cannot contain numbers';
        }
        if(name.length < 2 || name.length > 25) {
            throw 'Name must be between 2 and 25 chars';
        }
        name = name.trim();
        return name;
    },

    checkEmail(email) {
        if (typeof email !== 'string' || email.trim() === '') {
            throw 'Email must be a non-empty string.';
        }
        const split = email.split('@');
        if(split.length !== 2) {
            throw ' invalid email';
        }
        const [a,b] = split;
        if(a.trim() === '' || b.trim() === '' || b.length < 5) {
            throw 'invalid email';
        }
        if(!b.endsWith('.com')) {
            throw 'invalid email';
        }
        email = email.toLowerCase().trim();
        return email;
    },
    checkPassword(password) {
        if(typeof password !== 'string' || password.trim() === '' || password.length < 8) {
            throw 'Password invalid'
        }
        if (!/[A-Z]/.test(password)) {
            throw 'password must have 1 uppercase'
        }
        if(!/\d/.test(password)) {
            throw 'password must have 1 number'
        }
        if (!/[!@#$%^&*()_+{}\[\]:;<>,.?\/\\~-]/.test(password)) {
            throw 'password must contain one special char'
        }
        return password;
    },
    checkRole(role) {
        role = role.toLowerCase().trim();
        if(role !== 'admin' && role !== 'user') {
            throw 'role must be admin or user'
        }
        return role; 
    }

}

export default exportedMethods;