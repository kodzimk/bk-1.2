# Redis Celery AI Project

A comprehensive full-stack application with Redis, Celery, AI assistants, and automated data collection.

## Features

- 🔄 **Redis & Celery**: Distributed task queue with Redis broker
- 🤖 **Multi-AI Support**: OpenAI, Anthropic Claude, and Google Gemini integration
- 📊 **Data Collection**: Automated daily web scraping and data storage
- 💬 **AI Chatbot**: Interactive chat interface with multiple AI providers
- 🐳 **Docker**: Fully containerized with Docker Compose
- ☁️ **Cloud Ready**: Deployment scripts for DigitalOcean Droplets

## Quick Start

### Local Development

1. **Clone and setup**:
   \`\`\`bash
   git clone <repository>
   cd redis-celery-ai-project
   cp .env.example .env
   \`\`\`

2. **Configure environment variables** in `.env`:
   \`\`\`env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/appdb
   REDIS_URL=redis://localhost:6379/0
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   GOOGLE_API_KEY=your_google_api_key
   \`\`\`

3. **Start with Docker Compose**:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

4. **Initialize database**:
   \`\`\`bash
   # Run the SQL script to create tables
   docker-compose exec postgres psql -U postgres -d appdb -f /scripts/001_create_tables.sql
   \`\`\`

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Redis: localhost:6379
   - PostgreSQL: localhost:5432

### Production Deployment

1. **Prepare your DigitalOcean Droplet**:
   \`\`\`bash
   # Install Docker and Docker Compose on your droplet
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   \`\`\`

2. **Deploy**:
   \`\`\`bash
   export DROPLET_IP=your_droplet_ip
   chmod +x deploy.sh
   ./deploy.sh
   \`\`\`

## Architecture

### Components

- **Next.js Frontend**: React-based UI with chat interface and dashboard
- **Redis**: Message broker and caching layer
- **Celery Workers**: Background task processing
- **Celery Beat**: Scheduled task execution
- **PostgreSQL**: Primary database for data storage
- **AI Assistants**: Multi-provider AI integration

### Task Scheduling

The application includes automated tasks:

- **Daily Data Fetching**: Scrapes websites every day at midnight
- **Data Cleanup**: Removes old data (30+ days)
- **AI Processing**: Handles AI requests asynchronously

### API Endpoints

- `POST /api/chat`: Chat with AI assistants
- `GET /api/data`: Retrieve scraped data
- `POST /api/tasks/fetch-data`: Trigger data collection

## AI Assistant Integration

The project supports multiple AI providers through the AI SDK[^2]:

\`\`\`typescript
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

const { text } = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Your prompt here'
})
\`\`\`

### Supported Providers

- **OpenAI**: GPT-4, GPT-3.5-turbo
- **Anthropic**: Claude 3 Sonnet, Claude 3 Haiku
- **Google**: Gemini Pro, Gemini Pro Vision

## Celery Configuration

The project uses Celery with Redis as both broker and result backend[^1]:

```python
# Celery configuration with Upstash Redis
connection_link = f"rediss://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}?ssl_cert_reqs=required"
celery_app = Celery("tasks", broker=connection_link, backend=connection_link)
