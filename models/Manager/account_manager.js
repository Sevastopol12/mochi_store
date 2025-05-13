import BaseManager from './base_manager.js';
import User from '../Account/user.js';
import Admin from '../Account/admin.js';
import { ObjectId } from 'mongodb';

export default class AccountManager extends BaseManager {
  /**
   * A class that works with the Account database, have all access and permission to manipulate the Account database
  */
  constructor() {
    super();
    this.collection = 'accounts';
  }

  // Add an account
  async add({name, password, email, phone_number }) {
    let db = await this.dbPromise;
    let accountsCollection = db.collection(this.collection);
    let new_account = new User(name, password, email, phone_number);

    try {
      let result = await accountsCollection.insertOne(new_account);
      new_account.id = result.insertedId.toString();
      return this;
    } 
    
    catch (error) {
      console.error('Error adding account to database:', error);
      throw error;
    }
  }

  // Delete an account by its id
  async remove(id) {
    return this;
  }

  // List all existing accounts
  async listAll() {
    return this;
  }

  // Find and returns account by username
  async getByUsername(username) {
    return this;
  }

}
