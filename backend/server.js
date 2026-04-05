import dotenv from "dotenv";
dotenv.config();
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

// Resolve server port from environment with a safe fallback for local development.
const PORT = process.env.PORT || 3000;

// Start the HTTP server only after a successful database connection.
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    // Exit immediately so the process supervisor can restart with corrected config.
    console.error("Server startup failed:", error.message);
    process.exit(1);
  });
