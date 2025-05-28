const app = require('./app');
const connectDB = require('./config/db');
const analyticsRoutes = require('./routes/analytics');

const PORT = process.env.PORT || 5001;

// Connect to the database and start the server
connectDB().then(() => {
    app.use('/api/analytics', analyticsRoutes);
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
});
