from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from .database import get_db
from .models import Cart, CartItem, Product, Order, OrderItem, User, ProductImage
from .auth import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Pydantic models
class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    added_at: datetime
    product_name: str
    product_price: float
    product_image_url: str
    total_price: float

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: int
    items: List[CartItemResponse]
    total_items: int
    total_amount: float

class AddToCartRequest(BaseModel):
    product_id: int
    quantity: int = 1

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_per_unit: float
    total_price: float
    product_name: str
    product_image_url: str

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    status: str
    total_amount: float
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_zip: str
    shipping_country: str
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

class CheckoutRequest(BaseModel):
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_zip: str
    shipping_country: str

@router.get("/api/cart", response_model=CartResponse)
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the current user's cart."""
    
    # Get or create cart
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    
    if not cart:
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    
    # Get cart items with product details
    cart_items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
    
    items = []
    total_amount = 0.0
    total_items = 0
    
    for item in cart_items:
        # Get product details
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product or product.status != "active":
            # Remove invalid items
            db.delete(item)
            continue
        
        # Get primary image
        primary_image = db.query(ProductImage).filter(
            and_(
                ProductImage.product_id == product.id,
                ProductImage.is_primary == True
            )
        ).first()
        
        image_url = primary_image.image_url if primary_image else ""
        item_total = float(product.price) * item.quantity
        
        items.append(CartItemResponse(
            id=item.id,
            product_id=item.product_id,
            quantity=item.quantity,
            added_at=item.added_at,
            product_name=product.name,
            product_price=float(product.price),
            product_image_url=image_url,
            total_price=item_total
        ))
        
        total_amount += item_total
        total_items += item.quantity
    
    db.commit()
    
    return CartResponse(
        id=cart.id,
        items=items,
        total_items=total_items,
        total_amount=total_amount
    )

@router.post("/api/cart")
def add_to_cart(
    request: AddToCartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a product to the cart."""
    
    # Check if product exists and is active
    product = db.query(Product).filter(
        and_(Product.id == request.product_id, Product.status == "active")
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or not available"
        )
    
    # Check if user is trying to buy their own product
    if product.seller_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add your own product to cart"
        )
    
    # Get or create cart
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    
    if not cart:
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    
    # Check if item already exists in cart
    existing_item = db.query(CartItem).filter(
        and_(
            CartItem.cart_id == cart.id,
            CartItem.product_id == request.product_id
        )
    ).first()
    
    if existing_item:
        # Update quantity
        existing_item.quantity += request.quantity
    else:
        # Create new cart item
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=request.product_id,
            quantity=request.quantity
        )
        db.add(cart_item)
    
    db.commit()
    
    return {"message": "Product added to cart successfully"}

@router.delete("/api/cart/{product_id}")
def remove_from_cart(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a product from the cart."""
    
    # Get cart
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    
    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )
    
    # Find cart item
    cart_item = db.query(CartItem).filter(
        and_(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id
        )
    ).first()
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found in cart"
        )
    
    db.delete(cart_item)
    db.commit()
    
    return {"message": "Product removed from cart successfully"}

@router.post("/api/orders", response_model=OrderResponse)
def create_order(
    request: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create an order from the current cart."""
    
    # Get cart
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    
    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )
    
    # Get cart items
    cart_items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
    
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )
    
    # Calculate total amount
    total_amount = 0.0
    order_items_data = []
    
    for item in cart_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        
        if not product or product.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {item.product_id} is no longer available"
            )
        
        item_total = float(product.price) * item.quantity
        total_amount += item_total
        
        order_items_data.append({
            "product_id": product.id,
            "quantity": item.quantity,
            "price_per_unit": float(product.price)
        })
    
    # Create order
    order = Order(
        user_id=current_user.id,
        status="processing",
        total_amount=total_amount,
        shipping_address=request.shipping_address,
        shipping_city=request.shipping_city,
        shipping_state=request.shipping_state,
        shipping_zip=request.shipping_zip,
        shipping_country=request.shipping_country
    )
    
    db.add(order)
    db.commit()
    db.refresh(order)
    
    # Create order items
    for item_data in order_items_data:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data["product_id"],
            quantity=item_data["quantity"],
            price_per_unit=item_data["price_per_unit"]
        )
        db.add(order_item)
        
        # Mark product as sold
        product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
        product.status = "sold"
    
    # Clear cart
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    
    db.commit()
    
    # Get order items with product details for response
    order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    
    items = []
    for item in order_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        
        # Get primary image
        primary_image = db.query(ProductImage).filter(
            and_(
                ProductImage.product_id == product.id,
                ProductImage.is_primary == True
            )
        ).first()
        
        image_url = primary_image.image_url if primary_image else ""
        
        items.append(OrderItemResponse(
            id=item.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_per_unit=float(item.price_per_unit),
            total_price=float(item.price_per_unit) * item.quantity,
            product_name=product.name if product else "Product no longer available",
            product_image_url=image_url
        ))
    
    return OrderResponse(
        id=order.id,
        status=order.status,
        total_amount=float(order.total_amount),
        shipping_address=order.shipping_address,
        shipping_city=order.shipping_city,
        shipping_state=order.shipping_state,
        shipping_zip=order.shipping_zip,
        shipping_country=order.shipping_country,
        created_at=order.created_at,
        items=items
    )

@router.get("/api/orders", response_model=List[OrderResponse])
def get_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the current user's order history."""
    
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    
    order_responses = []
    for order in orders:
        # Get order items with product details
        order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        
        items = []
        for item in order_items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            
            # Get primary image
            primary_image = db.query(ProductImage).filter(
                and_(
                    ProductImage.product_id == product.id,
                    ProductImage.is_primary == True
                )
            ).first()
            
            image_url = primary_image.image_url if primary_image else ""
            
            items.append(OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price_per_unit=float(item.price_per_unit),
                total_price=float(item.price_per_unit) * item.quantity,
                product_name=product.name if product else "Product no longer available",
                product_image_url=image_url
            ))
        
        order_responses.append(OrderResponse(
            id=order.id,
            status=order.status,
            total_amount=float(order.total_amount),
            shipping_address=order.shipping_address,
            shipping_city=order.shipping_city,
            shipping_state=order.shipping_state,
            shipping_zip=order.shipping_zip,
            shipping_country=order.shipping_country,
            created_at=order.created_at,
            items=items
        ))
    
    return order_responses
