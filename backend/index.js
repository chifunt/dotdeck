require("dotenv").config(); // Loads variables from backend/.env

const app = require("./app").default.default;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
