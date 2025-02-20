const express = require('express');

const { PORT } = process.env;
const app = express();

const established = () => app.listen(PORT, () => console.log(`Server is running at: http://localhost:${PORT}`));

module.exports = { app, established };
