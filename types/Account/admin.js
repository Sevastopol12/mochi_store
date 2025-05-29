import BaseAccount from "./base.js";

class Admin extends BaseAccount {
  constructor(username, password, email, phone_number) {
    super(username, password, email, phone_number);
    this.role = 'admin';
  }
  
  displayInfo() {
    super.displayInfo();
  }
  
}

export default Admin;