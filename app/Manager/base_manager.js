import AppConfig from "../Config.js"

export default class BaseManager {
    /**
     * Design to be an abstract class, defining fundamental attributes/methods for Manager-based classes
     */
    constructor() {
        this.config = new AppConfig();
        this.dbPromise = this.config.initDB();
    }

    async add() {
        throw new Error("Subclasses must implement abstractMethod.");
        // Insert data
    }

    async remove() {
        throw new Error("Subclasses must implement abstractMethod.");
        // Drop data
    }
    
    async listAll() {
        throw new Error("Subclasses must implement abstractMethod.");
        // Return all existing data 
    }
}