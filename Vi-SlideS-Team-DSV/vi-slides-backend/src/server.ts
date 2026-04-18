import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js'; 
import sessionRoutes from './routes/sessionRoutes.js'; 

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes); 


const mongoURI = process.env.MONGO_URI || "";
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Error:", err));


app.get('/', (req, res) => {
  res.send("Vi-SlideS Backend is Live and Healthy!");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});