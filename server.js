const express = require('express');
const path = require('path');
const app = express();

// Example route
// app.use('/test', (res, req) => {
//   req.send('hi');
// });

// Set static folder
app.use(express.static(path.join(__dirname, './public')));

// Local and or environment variable named port
const PORT = 3000 || process.env.PORT;
// Run the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
