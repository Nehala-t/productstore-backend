# Product App Backend

Backend API for a product management application built with **Node.js, Express.js, and MongoDB**.

This backend provides APIs for user authentication, product management, seller management, and cart functionality.

## 🛠️ Technologies Used

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Multer
* Express Validator
* CORS

## ✨ Features

### User Authentication

* User registration
* User login
* JWT authentication
* Password hashing
* Role-based access control
* User and seller roles

### Product Management

* Add products
* View all products
* View product details
* Update products
* Delete products
* Search products
* Pagination
* Seller-specific products
* Product image upload

### Cart

* Add products to cart
* Update product quantity
* View cart
* Remove products from cart

## 📂 Project Structure

```text
Backend/
│
├── controllers/
├── models/
├── routes/
├── middleware/
├── validater/
├── upload/
│
├── .env
├── .gitignore
├── package.json
├── server.js
└── README.md
```

## ⚙️ Installation

Clone the repository:

```bash
git clone <repository-url>
```

Navigate to the backend folder:

```bash
cd Backend
```

Install dependencies:

```bash
npm install
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Do not commit the `.env` file to GitHub.

## ▶️ Run the Application

Start the server:

```bash
npm start
```

For development with Nodemon:

```bash
npm run dev
```

The server will run on:

```text
http://localhost:5000
```

## 🔑 Authentication

Protected APIs require a JWT access token.

Send the token in the request header:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint              | Description         |
| ------ | --------------------- | ------------------- |
| POST   | `/api/users/register` | Register a new user |
| POST   | `/api/users/login`    | Login user          |

### Products

| Method | Endpoint                  | Description         |
| ------ | ------------------------- | ------------------- |
| POST   | `/api/AddProducts`        | Add a new product   |
| GET    | `/api/AllProducts`        | Get all products    |
| GET    | `/api/ViewProduct/:id`    | Get product details |
| PUT    | `/api/update/:id`         | Update a product    |
| DELETE | `/api/deleteProduct/:id`  | Delete a product    |
| GET    | `/api/viewSellerProducts` | Get seller products |

### Cart

| Method | Endpoint              | Description          |
| ------ | --------------------- | -------------------- |
| POST   | `/api/addCart`        | Add product to cart  |
| GET    | `/api/viewCart`       | Get user's cart      |
| PUT    | `/api/updateCart`     | Update cart quantity |
| DELETE | `/api/deleteCart/:id` | Remove cart item     |

## 🖼️ Product Images

Product images are uploaded using **Multer**.

Images are stored in the `upload/` directory.

Example image URL:

```text
http://localhost:5000/upload/product-image.jpg
```

## 🔒 Security

The backend uses:

* JWT authentication
* bcrypt password hashing
* Express Validator
* Role-based authorization
* Environment variables for sensitive information

## 🚀 Future Improvements

* Order management
* Online payment integration
* Product reviews and ratings
* Wishlist
* Admin dashboard
* Email verification
* Password reset
* Cloud image storage

## 👨‍💻 Author

**Your Name**

GitHub: `<your-github-profile>`

## 📄 License

This project is for educational and development purposes.
