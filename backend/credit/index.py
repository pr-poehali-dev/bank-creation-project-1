'''
Business: Оформление кредитов с зачислением на карту
Args: event - dict с httpMethod, body (card_id, amount)
      context - объект с request_id
Returns: HTTP response с результатом кредита
'''
import json
import os
import psycopg2
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    card_id = body_data.get('card_id')
    amount = body_data.get('amount', 0)
    
    if not card_id or amount <= 0:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Invalid credit data'})
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    cur.execute("SELECT id, balance FROM cards WHERE id = %s", (card_id,))
    card = cur.fetchone()
    
    if not card:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Card not found'})
        }
    
    cur.execute(
        "UPDATE cards SET balance = balance + %s WHERE id = %s",
        (amount, card_id)
    )
    
    cur.execute(
        "INSERT INTO transactions (to_card_id, amount, transaction_type, description) VALUES (%s, %s, %s, %s)",
        (card_id, amount, 'credit', 'Credit approval')
    )
    
    conn.commit()
    
    cur.execute("SELECT balance FROM cards WHERE id = %s", (card_id,))
    new_balance = cur.fetchone()[0]
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({
            'message': 'Credit approved and funds added',
            'amount': float(amount),
            'new_balance': float(new_balance)
        })
    }
