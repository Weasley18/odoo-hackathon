import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db
from app.models import Base, User, Product, ProductImage, Cart, CartItem, Order, OrderItem
from app.auth import get_password_hash, create_access_token

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create test database
Base.metadata.create_all(bind=engine)

client = TestClient(app)

@pytest.fixture
def test_user():
    """Create a test user."""
    db = TestingSessionLocal()
    user = User(
        email="test@example.com",
        password_hash=get_password_hash("testpassword"),
        name="Test User"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    yield {
        "user": user,
        "token": access_token,
        "headers": {"Authorization": f"Bearer {access_token}"}
    }
    
    db.delete(user)
    db.commit()
    db.close()

@pytest.fixture
def test_seller():
    """Create a test seller."""
    db = TestingSessionLocal()
    seller = User(
        email="seller@example.com",
        password_hash=get_password_hash("testpassword"),
        name="Test Seller"
    )
    db.add(seller)
    db.commit()
    db.refresh(seller)
    
    yield seller
    
    db.delete(seller)
    db.commit()
    db.close()

@pytest.fixture
def test_product(test_seller):
    """Create a test product."""
    db = TestingSessionLocal()
    product = Product(
        seller_id=test_seller.id,
        name="Test Product",
        description="A test product description",
        price=29.99,
        category="Electronics",
        condition="Good",
        eco_rating=4,
        eco_details="Eco-friendly product",
        status="active"
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    
    # Add product image
    image = ProductImage(
        product_id=product.id,
        image_url="https://example.com/image.jpg",
        is_primary=True
    )
    db.add(image)
    db.commit()
    
    yield product
    
    db.delete(product)
    db.commit()
    db.close()

class TestCart:
    def test_get_empty_cart(self, test_user):
        """Test getting an empty cart."""
        response = client.get("/api/cart", headers=test_user["headers"])
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total_items"] == 0
        assert data["total_amount"] == 0.0

    def test_add_to_cart_success(self, test_user, test_product):
        """Test adding a product to cart successfully."""
        cart_data = {
            "product_id": test_product.id,
            "quantity": 2
        }
        
        response = client.post(
            "/api/cart",
            json=cart_data,
            headers=test_user["headers"]
        )
        assert response.status_code == 200
        
        # Verify item is in cart
        response = client.get("/api/cart", headers=test_user["headers"])
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["product_id"] == test_product.id
        assert data["items"][0]["quantity"] == 2
        assert data["total_items"] == 2
        assert data["total_amount"] == 59.98

    def test_add_to_cart_product_not_found(self, test_user):
        """Test adding a non-existent product to cart."""
        cart_data = {
            "product_id": 999,
            "quantity": 1
        }
        
        response = client.post(
            "/api/cart",
            json=cart_data,
            headers=test_user["headers"]
        )
        assert response.status_code == 404

    def test_add_to_cart_own_product(self, test_user, test_seller):
        """Test adding own product to cart (should fail)."""
        # Create product owned by test_user
        db = TestingSessionLocal()
        product = Product(
            seller_id=test_user["user"].id,
            name="Own Product",
            description="A product owned by the user",
            price=19.99,
            category="Electronics",
            condition="Good",
            status="active"
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        
        cart_data = {
            "product_id": product.id,
            "quantity": 1
        }
        
        response = client.post(
            "/api/cart",
            json=cart_data,
            headers=test_user["headers"]
        )
        assert response.status_code == 400
        
        db.delete(product)
        db.commit()
        db.close()

    def test_add_to_cart_unauthorized(self, test_product):
        """Test adding to cart without authentication."""
        cart_data = {
            "product_id": test_product.id,
            "quantity": 1
        }
        
        response = client.post("/api/cart", json=cart_data)
        assert response.status_code == 401

    def test_remove_from_cart_success(self, test_user, test_product):
        """Test removing a product from cart successfully."""
        # First add item to cart
        cart_data = {
            "product_id": test_product.id,
            "quantity": 1
        }
        client.post("/api/cart", json=cart_data, headers=test_user["headers"])
        
        # Then remove it
        response = client.delete(
            f"/api/cart/{test_product.id}",
            headers=test_user["headers"]
        )
        assert response.status_code == 200
        
        # Verify cart is empty
        response = client.get("/api/cart", headers=test_user["headers"])
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 0

    def test_remove_from_cart_not_found(self, test_user):
        """Test removing a non-existent product from cart."""
        response = client.delete(
            "/api/cart/999",
            headers=test_user["headers"]
        )
        assert response.status_code == 404

    def test_remove_from_cart_unauthorized(self, test_product):
        """Test removing from cart without authentication."""
        response = client.delete(f"/api/cart/{test_product.id}")
        assert response.status_code == 401

class TestOrders:
    def test_create_order_success(self, test_user, test_product):
        """Test creating an order successfully."""
        # First add item to cart
        cart_data = {
            "product_id": test_product.id,
            "quantity": 2
        }
        client.post("/api/cart", json=cart_data, headers=test_user["headers"])
        
        # Create order
        order_data = {
            "shipping_address": "123 Test St",
            "shipping_city": "Test City",
            "shipping_state": "Test State",
            "shipping_zip": "12345",
            "shipping_country": "Test Country"
        }
        
        response = client.post(
            "/api/orders",
            json=order_data,
            headers=test_user["headers"]
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "processing"
        assert data["total_amount"] == 59.98
        assert len(data["items"]) == 1
        assert data["items"][0]["quantity"] == 2
        
        # Verify cart is now empty
        response = client.get("/api/cart", headers=test_user["headers"])
        assert response.status_code == 200
        cart_data = response.json()
        assert len(cart_data["items"]) == 0

    def test_create_order_empty_cart(self, test_user):
        """Test creating an order with empty cart."""
        order_data = {
            "shipping_address": "123 Test St",
            "shipping_city": "Test City",
            "shipping_state": "Test State",
            "shipping_zip": "12345",
            "shipping_country": "Test Country"
        }
        
        response = client.post(
            "/api/orders",
            json=order_data,
            headers=test_user["headers"]
        )
        assert response.status_code == 400

    def test_create_order_unauthorized(self, test_product):
        """Test creating an order without authentication."""
        order_data = {
            "shipping_address": "123 Test St",
            "shipping_city": "Test City",
            "shipping_state": "Test State",
            "shipping_zip": "12345",
            "shipping_country": "Test Country"
        }
        
        response = client.post("/api/orders", json=order_data)
        assert response.status_code == 401

    def test_get_orders_empty(self, test_user):
        """Test getting orders when none exist."""
        response = client.get("/api/orders", headers=test_user["headers"])
        assert response.status_code == 200
        data = response.json()
        assert data == []

    def test_get_orders_with_data(self, test_user, test_product):
        """Test getting orders with existing data."""
        # Create an order
        cart_data = {
            "product_id": test_product.id,
            "quantity": 1
        }
        client.post("/api/cart", json=cart_data, headers=test_user["headers"])
        
        order_data = {
            "shipping_address": "123 Test St",
            "shipping_city": "Test City",
            "shipping_state": "Test State",
            "shipping_zip": "12345",
            "shipping_country": "Test Country"
        }
        client.post("/api/orders", json=order_data, headers=test_user["headers"])
        
        # Get orders
        response = client.get("/api/orders", headers=test_user["headers"])
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["status"] == "processing"
        assert data[0]["total_amount"] == 29.99

    def test_get_orders_unauthorized(self):
        """Test getting orders without authentication."""
        response = client.get("/api/orders")
        assert response.status_code == 401
