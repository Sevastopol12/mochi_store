import BaseAccount from "./base.js";

class Admin extends BaseAccount {
  constructor(id, username, password, email, phone_number) {
    super(id, username, password, email, phone_number);
    this.role = 'admin';
  }
  
  displayInfo() {
    super.displayInfo();
  }
  
}

export default Admin;