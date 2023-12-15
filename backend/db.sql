CREATE DATABASE expencetrac;
USE expencetrac;

CREATE TABLE expenses (
    id INT UNIQUE AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    pass VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE userentry (
    id INT UNIQUE AUTO_INCREMENT,
    amount INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    exptype VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ALTER userentry
ALTER TABLE expenses
ADD PRIMARY KEY (id);

-- First, add the foreign key column to the userentry table
ALTER TABLE userentry
ADD COLUMN expense_id INT;

-- Then, add the foreign key constraint
ALTER TABLE userentry
ADD CONSTRAINT fk_userentry_expenses
FOREIGN KEY (expense_id) REFERENCES expenses(id);


-- i have to create a table to store the payment info of users

-- table--> order, fields-> id, paymentid, orderid,status

-- add a new field/column in user table 'isPremium' type boolen if using sequalize

ALTER TABLE expenses
ADD COLUMN isPremium VARCHAR(255);

-- order was throwing error so changed to orders
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY UNIQUE,
    orderid VARCHAR(255),
    paymentid VARCHAR(255),
    status VARCHAR(255),
    userid INT,
    CONSTRAINT fk_orders_expenses FOREIGN KEY (userid)
    REFERENCES expenses(id)
);