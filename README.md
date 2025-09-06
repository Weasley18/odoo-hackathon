# EcoFinds

A marketplace for eco-friendly products where users can buy and sell sustainable items.

## Project Overview

EcoFinds connects eco-conscious buyers and sellers, helping promote sustainable products and reduce environmental impact. The platform features:

- User authentication and profiles
- Product listings with sustainability ratings
- Shopping cart and checkout flow
- Order management and tracking
- Seller dashboard with analytics

## Tech Stack

### Frontend
- React with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- React Router for navigation

### Backend
- FastAPI (Python)
- PostgreSQL database
- SQLAlchemy ORM

### Infrastructure
- Docker for containerization
- GitHub Actions for CI/CD

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Git

### Running Locally

1. Clone the repository
```bash
git clone https://github.com/yourusername/ecofinds.git
cd ecofinds
```

2. Create a `.env` file based on the example
```bash
cp env.example .env
# Edit .env with your values if needed
```

3. Start the application with Docker Compose
```bash
docker-compose up
```

4. Access the application
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Development Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature branches

### Pull Request Process
1. Create a branch from `develop`
2. Implement your changes
3. Write tests
4. Submit a PR to `develop`
5. Ensure CI passes
6. Get a code review
7. Merge to `develop`

## Next Steps

### Immediate Tasks
1. Implement user authentication
2. Create product CRUD operations
3. Set up image upload to S3/cloud storage
4. Implement search and filtering
5. Build checkout flow

### Future Enhancements
- Sustainability scoring algorithm
- Social sharing features
- Seller ratings and reviews
- Carbon footprint tracking
- Wishlist functionality

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributors

- Your Name - Initial work
