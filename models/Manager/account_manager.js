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
  async add(name, password, email, phone_number, role) {
    const newId = String(this.listAll().length + 1)
    const db = await this.dbPromise;
    const accounts = db.collection(this.collection);
    let new_account;
    if (role === 'user') {new_account = new User(newId, name, password, email, phone_number, role);}
    else {new_account = new Admin(newId, name, password, email, phone_number, role);}
    await accounts.insertOne(new_account);
  }

  // Find and returns account by username
  async getByUsername(name) {
    let db = await this.dbPromise;
    let accountsCollection = db.collection(this.collection);

    try {
      let account = await accountsCollection.findOne({name: name});
      if (account) {
        return account.role === 'admin'
          ? new Admin(
              account.name,
              account.password,
              account.email,
              account.phone_number,
              account.name,
              account._id.toString()
            )
          : new User(
              account.name,
              account.password,
              account.email,
              account.phone_number,
              account.name,
              account._id.toString()
            );
      }
    } 
  
  catch (error) {
    console.error(`Error getting account by username "${name}" from database:`, error);
    throw error;
  }
  }

  // Delete an account by its id
  async remove(id) {
    let db = await this.dbPromise; 
    let accounts = db.collection(this.collection);

    try {
      let result = await accounts.deleteOne({ id: id});
      return result.deletedCount > 0;
    } 
    catch (error) {
      console.error(`Error removing account with ID "${id}" from database:`, error);
      throw error;
    }
  }

  // List all accounts
  async listAll() {
    const db = await this.dbPromise;
    const accounts = db.collection(this.collection);
    return accounts.find({}).toArray() || null;
  }
  
  // Authentication
  async authenticate(email, password) {
    const db = await this.dbPromise;
    const accounts = db.collection(this.collection);
    return await accounts.findOne({ email: email, password: password }) || null;
  }

  // Validate new account's password
  async isExisted(email) {
    const db = await this.dbPromise;
    const accounts = db.collection(this.collection);
    const existed = await accounts.findOne({email: email}) || null;
    return existed ? 1: 0;
  }
}