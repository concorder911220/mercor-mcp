# Rialto Frontend

This is the React TypeScript frontend application for Rialto, containerized with Docker and deployed as part of the monolith Fargate service.

## Architecture

The frontend is deployed as a container within the same Fargate task as the AI service and Core service. It runs on port 80 and is served by nginx.

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker Build

The frontend uses a multi-stage Docker build:

1. **Build stage**: Uses Node.js 18 Alpine to build the React application
2. **Production stage**: Uses nginx Alpine to serve the built static files

### Building the Docker Image

```bash
# Make the build script executable
chmod +x build-and-push.sh

# Build and push to ECR (for dev environment)
STAGE=dev DEV_DISCRIMINATOR=michael ./build-and-push.sh

# Build and push to ECR (for beta environment)
STAGE=beta ./build-and-push.sh
```

### Manual Docker Build

```bash
# Build the image locally
docker build -t rialto-frontend:latest .

# Run locally to test
docker run -p 3000:80 rialto-frontend:latest
```

## Deployment

The frontend is deployed as part of the monolith stack in AWS CDK. The deployment process:

1. Build and push the Docker image to ECR
2. Deploy the CDK stack which includes the frontend container
3. The frontend will be available at `https://{subdomain}.rialto-financial.com`

### Environment Variables

- `STAGE`: The deployment stage (dev, beta, preprod, prod)

### Health Check

The frontend container includes a health check endpoint at `/health` that returns a 200 status code.

## Load Balancer Configuration

The frontend is registered with the Application Load Balancer with:
- **Port**: 80
- **Protocol**: HTTP (terminated at ALB with HTTPS)
- **Health Check Path**: `/health`
- **Priority**: 10 (lower than API services)

## File Structure

```
apps/frontend/
├── Dockerfile              # Multi-stage Docker build
├── nginx.conf              # nginx configuration for SPA
├── .dockerignore           # Files to exclude from Docker build
├── build-and-push.sh       # Script to build and push to ECR
├── package.json            # Node.js dependencies
├── vite.config.js          # Vite configuration
└── src/                    # React application source
```

## Troubleshooting

### Common Issues

1. **Build fails**: Ensure all dependencies are installed with `npm install`
2. **Container won't start**: Check the nginx configuration and health check
3. **Routing issues**: Verify the nginx configuration handles SPA routing correctly

### Logs

View container logs in CloudWatch:
- Log Group: `/aws/ecs/frontend`
- Stream Prefix: `frontend`

### Health Check Failures

If the health check is failing:
1. Verify the nginx configuration includes the `/health` endpoint
2. Check that the container is listening on port 80
3. Ensure the health check command is correct: `curl -f http://localhost/health`