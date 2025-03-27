const { createAdminUser } = require("./client");

createAdminUser("admin", "admin", "admin@gmail.com", ["MANAGE_PRODUCTS", "MANAGE_USERS"], true);
