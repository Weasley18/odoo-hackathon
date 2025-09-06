# feat(products): implement listings, search/filter, cart and orders

This PR implements the product CRUD operations, product feed with search and category filtering, cart endpoints, and previous purchases pages.

## Backend Changes

### API Endpoints

#### Products
- `GET /api/products?category=&q=&cursor=&limit=` - Returns paginated products with filtering by category and search
- `GET /api/products/{id}` - Get product detail
- `POST /api/products` - Create product (auth required)
- `PUT /api/products/{id}` - Edit product (auth required, owner only)
- `DELETE /api/products/{id}` - Delete/mark product as removed (auth required, owner only)
- `GET /api/categories` - Get list of available product categories

#### Cart & Orders
- `GET /api/cart` - Get current user's cart
- `POST /api/cart` - Add product to cart
- `DELETE /api/cart/{product_id}` - Remove product from cart
- `POST /api/orders` - Create order from cart items
- `GET /api/orders` - Get user's order history

### Database Models
- Added SQLAlchemy models for products, cart, orders
- Implemented relationships between models
- Added appropriate constraints and indexes

### Authentication
- Implemented JWT authentication for protected endpoints
- Added owner-only validation for product editing/deletion

## Frontend Changes

### Pages
- **Feed** - Product listing with search and category filtering
- **ProductDetail** - Product details with add to cart functionality
- **AddProduct** - Form to create new product listings
- **MyListings** - User's product listings with edit/delete functionality
- **Cart** - Shopping cart with checkout flow
- **Orders** - Order history and details

### Components
- **ProductCard** - Reusable product card component

### Tests
- Added unit tests for ProductCard component
- Added integration test for cart flow

## How to Test

1. **Create a product listing:**
   - Navigate to "Add Product"
   - Fill in product details and submit
   - Verify product appears in "My Listings"

2. **Browse products:**
   - Go to home page
   - Try searching for products
   - Filter by category
   - Click on a product to view details

3. **Shopping flow:**
   - View a product detail
   - Add to cart
   - View cart
   - Complete checkout
   - Verify order appears in "Orders" page

4. **Product management:**
   - Go to "My Listings"
   - Edit a product
   - Delete a product
   - Verify changes are reflected

## Notes
- The frontend uses data URLs for images instead of S3 uploads for simplicity
- Authentication is handled via JWT tokens stored in localStorage
