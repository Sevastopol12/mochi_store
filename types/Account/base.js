class BaseAccount{
    constructor(id, username, password, email, phone_number) {
        this.id = id;
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
