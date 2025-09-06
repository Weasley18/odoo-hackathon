from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from typing import List, Optional
from .database import get_db
from .models import Product, ProductImage, User
from .auth import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Pydantic models for request/response
class ProductImageCreate(BaseModel):
    image_url: str
    is_primary: bool = False

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    condition: str
    eco_rating: Optional[int] = None
    eco_details: Optional[str] = None
    image_urls: List[str] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    eco_rating: Optional[int] = None
    eco_details: Optional[str] = None
    image_urls: Optional[List[str]] = None

class ProductResponse(BaseModel):
    id: int
    seller_id: int
    name: str
    description: str
    price: float
    category: str
    condition: str
    eco_rating: Optional[int]
    eco_details: Optional[str]
    status: str
    views: int
    created_at: datetime
    updated_at: datetime
    image_urls: List[str]
    seller_name: str

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    next_cursor: Optional[str] = None
    has_more: bool

# Predefined categories
CATEGORIES = [
    "Electronics",
    "Clothing",
    "Home & Garden",
    "Books",
    "Sports & Outdoors",
    "Beauty & Health",
    "Toys & Games",
    "Automotive",
    "Food & Beverages",
    "Other"
]

@router.get("/api/products", response_model=ProductListResponse)
def get_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    q: Optional[str] = Query(None, description="Search query for product name"),
    cursor: Optional[str] = Query(None, description="Pagination cursor"),
    limit: int = Query(20, ge=1, le=100, description="Number of products to return"),
    db: Session = Depends(get_db)
):
    """Get a paginated list of products with optional filtering and search."""
    
    # Build query
    query = db.query(Product).filter(Product.status == "active")
    
    # Apply category filter
    if category and category in CATEGORIES:
        query = query.filter(Product.category == category)
    
    # Apply search filter
    if q:
        query = query.filter(Product.name.ilike(f"%{q}%"))
    
    # Apply cursor-based pagination
    if cursor:
        try:
            cursor_time = datetime.fromisoformat(cursor)
            query = query.filter(Product.created_at < cursor_time)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid cursor format"
            )
    
    # Order by created_at descending and limit
    query = query.order_by(desc(Product.created_at)).limit(limit + 1)
    
    products = query.all()
    
    # Check if there are more products
    has_more = len(products) > limit
    if has_more:
        products = products[:-1]
    
    # Get next cursor
    next_cursor = None
    if has_more and products:
        next_cursor = products[-1].created_at.isoformat()
    
    # Convert to response format
    product_responses = []
    for product in products:
        # Get image URLs
        image_urls = [img.image_url for img in product.images]
        
        product_responses.append(ProductResponse(
            id=product.id,
            seller_id=product.seller_id,
            name=product.name,
            description=product.description,
            price=float(product.price),
            category=product.category,
            condition=product.condition,
            eco_rating=product.eco_rating,
            eco_details=product.eco_details,
            status=product.status,
            views=product.views,
            created_at=product.created_at,
            updated_at=product.updated_at,
            image_urls=image_urls,
            seller_name=product.seller.name
        ))
    
    return ProductListResponse(
        products=product_responses,
        next_cursor=next_cursor,
        has_more=has_more
    )

@router.get("/api/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID."""
    product = db.query(Product).filter(
        and_(Product.id == product_id, Product.status == "active")
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Increment view count
    product.views += 1
    db.commit()
    
    # Get image URLs
    image_urls = [img.image_url for img in product.images]
    
    return ProductResponse(
        id=product.id,
        seller_id=product.seller_id,
        name=product.name,
        description=product.description,
        price=float(product.price),
        category=product.category,
        condition=product.condition,
        eco_rating=product.eco_rating,
        eco_details=product.eco_details,
        status=product.status,
        views=product.views,
        created_at=product.created_at,
        updated_at=product.updated_at,
        image_urls=image_urls,
        seller_name=product.seller.name
    )

@router.post("/api/products", response_model=ProductResponse)
def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new product."""
    
    # Validate category
    if product_data.category not in CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category. Must be one of: {', '.join(CATEGORIES)}"
        )
    
    # Validate eco_rating
    if product_data.eco_rating is not None and not (1 <= product_data.eco_rating <= 5):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Eco rating must be between 1 and 5"
        )
    
    # Create product
    product = Product(
        seller_id=current_user.id,
        name=product_data.name,
        description=product_data.description,
        price=product_data.price,
        category=product_data.category,
        condition=product_data.condition,
        eco_rating=product_data.eco_rating,
        eco_details=product_data.eco_details,
        status="active"
    )
    
    db.add(product)
    db.commit()
    db.refresh(product)
    
    # Add images
    for i, image_url in enumerate(product_data.image_urls):
        image = ProductImage(
            product_id=product.id,
            image_url=image_url,
            is_primary=(i == 0)  # First image is primary
        )
        db.add(image)
    
    db.commit()
    
    # Get image URLs
    image_urls = [img.image_url for img in product.images]
    
    return ProductResponse(
        id=product.id,
        seller_id=product.seller_id,
        name=product.name,
        description=product.description,
        price=float(product.price),
        category=product.category,
        condition=product.condition,
        eco_rating=product.eco_rating,
        eco_details=product.eco_details,
        status=product.status,
        views=product.views,
        created_at=product.created_at,
        updated_at=product.updated_at,
        image_urls=image_urls,
        seller_name=product.seller.name
    )

@router.put("/api/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a product (owner only)."""
    
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check ownership
    if product.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this product"
        )
    
    # Update fields
    if product_data.name is not None:
        product.name = product_data.name
    if product_data.description is not None:
        product.description = product_data.description
    if product_data.price is not None:
        product.price = product_data.price
    if product_data.category is not None:
        if product_data.category not in CATEGORIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid category. Must be one of: {', '.join(CATEGORIES)}"
            )
        product.category = product_data.category
    if product_data.condition is not None:
        product.condition = product_data.condition
    if product_data.eco_rating is not None:
        if not (1 <= product_data.eco_rating <= 5):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Eco rating must be between 1 and 5"
            )
        product.eco_rating = product_data.eco_rating
    if product_data.eco_details is not None:
        product.eco_details = product_data.eco_details
    
    # Update images if provided
    if product_data.image_urls is not None:
        # Delete existing images
        db.query(ProductImage).filter(ProductImage.product_id == product_id).delete()
        
        # Add new images
        for i, image_url in enumerate(product_data.image_urls):
            image = ProductImage(
                product_id=product.id,
                image_url=image_url,
                is_primary=(i == 0)
            )
            db.add(image)
    
    db.commit()
    db.refresh(product)
    
    # Get image URLs
    image_urls = [img.image_url for img in product.images]
    
    return ProductResponse(
        id=product.id,
        seller_id=product.seller_id,
        name=product.name,
        description=product.description,
        price=float(product.price),
        category=product.category,
        condition=product.condition,
        eco_rating=product.eco_rating,
        eco_details=product.eco_details,
        status=product.status,
        views=product.views,
        created_at=product.created_at,
        updated_at=product.updated_at,
        image_urls=image_urls,
        seller_name=product.seller.name
    )

@router.delete("/api/products/{product_id}")
def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a product (owner only)."""
    
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check ownership
    if product.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this product"
        )
    
    # Mark as deleted instead of actually deleting
    product.status = "deleted"
    db.commit()
    
    return {"message": "Product deleted successfully"}

@router.get("/api/categories")
def get_categories():
    """Get list of available product categories."""
    return {"categories": CATEGORIES}
