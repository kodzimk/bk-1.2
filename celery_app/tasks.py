import os
import requests
from celery import Celery
from celery.schedules import crontab
import psycopg2
from datetime import datetime
import json

# Configure Celery
redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
celery_app = Celery('tasks', broker=redis_url, backend=redis_url)

# Configure periodic tasks
celery_app.conf.beat_schedule = {
    'fetch-daily-data': {
        'task': 'celery_app.tasks.fetch_website_data',
        'schedule': crontab(hour=0, minute=0),  # Run daily at midnight
    },
}
celery_app.conf.timezone = 'UTC'

def get_db_connection():
    """Get database connection"""
    database_url = os.getenv('DATABASE_URL')
    return psycopg2.connect(database_url)

@celery_app.task
def fetch_website_data():
    """Fetch data from websites and save to database"""
    websites = [
        'https://httpbin.org/json',
        'https://jsonplaceholder.typicode.com/posts/1',
        'https://api.github.com/repos/vercel/next.js'
    ]
    
    results = []
    
    for url in websites:
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            # Try to parse as JSON, fallback to text
            try:
                data = response.json()
            except:
                data = {'content': response.text[:1000]}  # Limit content size
            
            # Save to database
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO scraped_data (url, data, scraped_at)
                VALUES (%s, %s, %s)
            """, (url, json.dumps(data), datetime.utcnow()))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            results.append({
                'url': url,
                'status': 'success',
                'data_size': len(str(data))
            })
            
        except Exception as e:
            results.append({
                'url': url,
                'status': 'error',
                'error': str(e)
            })
    
    return results

@celery_app.task
def process_ai_request(prompt, provider='openai'):
    """Process AI requests asynchronously"""
    try:
        # This would integrate with your AI assistant
        # For now, return a mock response
        return {
            'prompt': prompt,
            'provider': provider,
            'response': f'Processed by {provider}: {prompt}',
            'processed_at': datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            'error': str(e),
            'prompt': prompt,
            'provider': provider
        }

@celery_app.task
def cleanup_old_data():
    """Clean up old scraped data"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Delete data older than 30 days
        cursor.execute("""
            DELETE FROM scraped_data 
            WHERE scraped_at < NOW() - INTERVAL '30 days'
        """)
        
        deleted_count = cursor.rowcount
        conn.commit()
        cursor.close()
        conn.close()
        
        return {'deleted_records': deleted_count}
    except Exception as e:
        return {'error': str(e)}
