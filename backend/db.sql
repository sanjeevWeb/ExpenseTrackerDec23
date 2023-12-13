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