USE Clinic360;

-- Create a table for users
CREATE TABLE Users(
	UserId INT PRIMARY KEY,
	FirstName VARCHAR(50),
	LastName VARCHAR(50),
	Address VARCHAR(50),
	City VARCHAR(20),
	State CHAR(2),
	ZipCode CHAR(5),
	BirthDate DATE,
	Gender CHAR(1), -- 'M' or 'F'
	PhoneNumber CHAR(10),
	Email VARCHAR(254),
	PasswordHash BINARY(32) -- sha256 is 32 bits long
);
