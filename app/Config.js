// Configure database settings
import { MongoClient } from 'mongodb';

class AppConfig {
  constructor() {
    // Apply singleton for database configuration
    if (!AppConfig.instance) {
      this.port = process.env.PORT || 3000;
      this.env = process.env.NODE_ENV || 'development';
      this.dbClient = null; // MongoDB client
      this.dbname = 'mochi_shop';
      this.uri = 'mongodb+srv://Sevastopol:230503@cluster0.brlhdtd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
      AppConfig.instance = this;
    }

    return AppConfig.instance;
  }

  // Init database
  async initDB() {
    if (!this.dbClient) {
      const uri = process.env.MONGO_URI || this.uri;

      try {
        this.dbClient = new MongoClient(this.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        tls: true,
        tlsAllowInvalidCertificates: true
      });
        await this.dbClient.connect();
        
        console.log('Connected to MongoDB');
      } 
      
      catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error; 
      }
    }
    
    return this.dbClient.db(this.dbname);
  }

}

export default AppConfig;