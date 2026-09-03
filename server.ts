import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// @ts-ignore
import authHandler from './api/auth.ts';
// @ts-ignore
import permitsHandler from './api/permits.ts';
// @ts-ignore
import attendanceHandler from './api/attendance.ts';
// @ts-ignore
import configHandler from './api/config.ts';
// @ts-ignore
import cronCleanupHandler from './api/cron-cleanup.ts';
// @ts-ignore
import emailLogsHandler from './api/email-logs.ts';
// @ts-ignore
import employeesHandler from './api/employees.ts';
// @ts-ignore
import initDbHandler from './api/init-db.ts';
// @ts-ignore
import usersHandler from './api/users.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Vercel Serverless Function Adapter
const adaptVercelHandler = (handler: any) => {
  return async (req: express.Request, res: express.Response) => {
    try {
      // Pass the express req and res to the vercel handler
      // They are largely compatible for standard JSON APIs
      await handler(req, res);
    } catch (error) {
      console.error('Error in API handler:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  };
};

// API Routes Map
app.all('/api/auth', adaptVercelHandler(authHandler));
app.all('/api/permits', adaptVercelHandler(permitsHandler));
app.all('/api/attendance', adaptVercelHandler(attendanceHandler));
app.all('/api/config', adaptVercelHandler(configHandler));
app.all('/api/cron-cleanup', adaptVercelHandler(cronCleanupHandler));
app.all('/api/email-logs', adaptVercelHandler(emailLogsHandler));
app.all('/api/employees', adaptVercelHandler(employeesHandler));
app.all('/api/init-db', adaptVercelHandler(initDbHandler));
app.all('/api/users', adaptVercelHandler(usersHandler));

// Serve static frontend files
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn('Frontend build (dist folder) not found. Only API is running.');
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
