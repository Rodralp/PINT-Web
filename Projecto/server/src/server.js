import app from './app.js';
import { connectToDatabase, syncDatabase } from './config/database.js';
import { seedDatabase } from './config/seedData.js';

const PORT = Number(globalThis.process?.env?.PORT) || 4000;

const startServer = async () => {
  try {
    await connectToDatabase();
    await syncDatabase();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start API server:', error);
    globalThis.process?.exit(1);
  }
};

startServer();
