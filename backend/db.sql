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

-- adding a new table to get total expense
ALTER TABLE expenses
ADD COLUMN totalExpense INT DEFAULT 0;

-- to add the amount in totalExpense column
DELIMITER //

CREATE TRIGGER after_userentry_insert
AFTER INSERT ON userentry
FOR EACH ROW
BEGIN
    UPDATE expenses
    SET totalExpense = totalExpense + NEW.amount
    WHERE id = NEW.expense_id;
END;
//

DELIMITER ;

-- update above DELIMITER on deletion of row of userentry table-- not working perhaps we alredy added
-- DELIMITER //

-- CREATE TRIGGER after_userentry_insert_update
-- AFTER INSERT, UPDATE ON userentry
-- FOR EACH ROW
-- BEGIN
--     IF NEW.expense_id IS NOT NULL THEN
--         UPDATE expenses
--         SET totalExpense = totalExpense + NEW.amount
--         WHERE id = NEW.expense_id;
--     END IF;
-- END;
-- //

-- DELIMITER ;

-- working fine to deduct the amount after deletion from userentry table
DELIMITER //

CREATE TRIGGER after_userentry_delete
AFTER DELETE ON userentry
FOR EACH ROW
BEGIN
    UPDATE expenses
    SET totalExpense = totalExpense - OLD.amount
    WHERE id = OLD.expense_id;
END;
//

DELIMITER ;


-- creating table for forget password requests

CREATE TABLE fprequest (
    id INT UNIQUE PRIMARY KEY,
    userid INT,
    isactive VARCHAR(255) DEFAULT true,
    CONSTRAINT fk_fprequest_expenses FOREIGN KEY (userid)
    REFERENCES expenses(id)
);

-- changeing datatype of id column
ALTER TABLE fprequest
MODIFY COLUMN id VARCHAR(255);
