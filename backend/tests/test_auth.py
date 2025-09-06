import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models import User

# Create a test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the get_db dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create a test client
client = TestClient(app)

@pytest.fixture
def test_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop tables
    Base.metadata.drop_all(bind=engine)

def test_signup(test_db):
    # Test signup with valid data
    response = client.post(
        "/api/auth/signup",
        json={
            "email": "test@example.com",
            "password": "Password123",
            "username": "testuser"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "testuser"
    assert "id" in data
    assert "password_hash" not in data

    # Test signup with duplicate email
    response = client.post(
        "/api/auth/signup",
        json={
            "email": "test@example.com",
            "password": "Password123",
            "username": "testuser2"
        }
    )
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]

def test_login(test_db):
    # Create a test user first
    client.post(
        "/api/auth/signup",
        json={
            "email": "login@example.com",
            "password": "Password123",
            "username": "loginuser"
        }
    )
    
    # Test login with correct credentials
    response = client.post(
        "/api/auth/login",
        json={
            "email": "login@example.com",
            "password": "Password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    
    # Test login with incorrect password
    response = client.post(
        "/api/auth/login",
        json={
            "email": "login@example.com",
            "password": "WrongPassword123"
        }
    )
    assert response.status_code == 401
    
    # Test login with non-existent user
    response = client.post(
        "/api/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "Password123"
        }
    )
    assert response.status_code == 401

def test_me_endpoint(test_db):
    # Create a test user
    signup_response = client.post(
        "/api/auth/signup",
        json={
            "email": "me@example.com",
            "password": "Password123",
            "username": "meuser"
        }
    )
    
    # Login to get token
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "me@example.com",
            "password": "Password123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Test /me endpoint with valid token
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@example.com"
    assert data["name"] == "meuser"
    
    # Test /me endpoint without token
    response = client.get("/api/auth/me")
    assert response.status_code == 401
    
    # Test updating user info
    response = client.put(
        "/api/auth/me",
        json={"username": "updatedname"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "updatedname"
