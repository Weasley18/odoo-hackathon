import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db
from app.models import Base, User, Product, ProductImage
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
def test_product(test_user):
    """Create a test product."""
    db = TestingSessionLocal()
    product = Product(
        seller_id=test_user["user"].id,
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

class TestProducts:
    def test_get_products_empty(self):
        """Test getting products when none exist."""
        response = client.get("/api/products")
        assert response.status_code == 200
        data = response.json()
        assert data["products"] == []
        assert data["has_more"] == False
        assert data["next_cursor"] is None

    def test_get_products_with_data(self, test_product):
        """Test getting products with existing data."""
        response = client.get("/api/products")
        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) == 1
        assert data["products"][0]["name"] == "Test Product"
        assert data["products"][0]["price"] == 29.99
        assert data["products"][0]["category"] == "Electronics"

    def test_get_products_with_category_filter(self, test_product):
        """Test getting products with category filter."""
        response = client.get("/api/products?category=Electronics")
        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) == 1
        
        response = client.get("/api/products?category=Clothing")
        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) == 0

    def test_get_products_with_search(self, test_product):
        """Test getting products with search query."""
        response = client.get("/api/products?q=Test")
        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) == 1
        
        response = client.get("/api/products?q=Nonexistent")
        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) == 0

    def test_get_product_by_id(self, test_product):
        """Test getting a specific product by ID."""
        response = client.get(f"/api/products/{test_product.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Product"
        assert data["views"] == 1  # View count should increment

    def test_get_product_not_found(self):
        """Test getting a non-existent product."""
        response = client.get("/api/products/999")
        assert response.status_code == 404

    def test_create_product_success(self, test_user):
        """Test creating a product successfully."""
        product_data = {
            "name": "New Product",
            "description": "A new product description",
            "price": 49.99,
            "category": "Electronics",
            "condition": "Excellent",
            "eco_rating": 5,
            "eco_details": "Very eco-friendly",
            "image_urls": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
        }
        
        response = client.post(
            "/api/products",
            json=product_data,
            headers=test_user["headers"]
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "New Product"
        assert data["price"] == 49.99
        assert len(data["image_urls"]) == 2

    def test_create_product_invalid_category(self, test_user):
        """Test creating a product with invalid category."""
        product_data = {
            "name": "New Product",
            "description": "A new product description",
            "price": 49.99,
            "category": "InvalidCategory",
            "condition": "Excellent"
        }
        
        response = client.post(
            "/api/products",
            json=product_data,
            headers=test_user["headers"]
        )
        assert response.status_code == 400

    def test_create_product_invalid_eco_rating(self, test_user):
        """Test creating a product with invalid eco rating."""
        product_data = {
            "name": "New Product",
            "description": "A new product description",
            "price": 49.99,
            "category": "Electronics",
            "condition": "Excellent",
            "eco_rating": 6
        }
        
        response = client.post(
            "/api/products",
            json=product_data,
            headers=test_user["headers"]
        )
        assert response.status_code == 400

    def test_create_product_unauthorized(self):
        """Test creating a product without authentication."""
        product_data = {
            "name": "New Product",
            "description": "A new product description",
            "price": 49.99,
            "category": "Electronics",
            "condition": "Excellent"
        }
        
        response = client.post("/api/products", json=product_data)
        assert response.status_code == 401

    def test_update_product_success(self, test_user, test_product):
        """Test updating a product successfully."""
        update_data = {
            "name": "Updated Product",
            "price": 39.99
        }
        
        response = client.put(
            f"/api/products/{test_product.id}",
            json=update_data,
            headers=test_user["headers"]
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Product"
        assert data["price"] == 39.99

    def test_update_product_unauthorized(self, test_product):
        """Test updating a product without authentication."""
        update_data = {"name": "Updated Product"}
        
        response = client.put(f"/api/products/{test_product.id}", json=update_data)
        assert response.status_code == 401

    def test_delete_product_success(self, test_user, test_product):
        """Test deleting a product successfully."""
        response = client.delete(
            f"/api/products/{test_product.id}",
            headers=test_user["headers"]
        )
        assert response.status_code == 200
        
        # Verify product is marked as deleted
        response = client.get(f"/api/products/{test_product.id}")
        assert response.status_code == 404

    def test_delete_product_unauthorized(self, test_product):
        """Test deleting a product without authentication."""
        response = client.delete(f"/api/products/{test_product.id}")
        assert response.status_code == 401

    def test_get_categories(self):
        """Test getting available categories."""
        response = client.get("/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data
        assert "Electronics" in data["categories"]
