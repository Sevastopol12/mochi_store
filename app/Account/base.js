class BaseAccount{
    constructor(username, password, phone_number) {
        this.username = username, 
        this.password = password,
        this.email = email,
        this.phone_number = phone_number
    }

    displayInfo() {
        return {
            'username' : this.username, 
            'email': this.email,
            'phone_number': this.phone_number
        };
    }
}

export default BaseAccount;
