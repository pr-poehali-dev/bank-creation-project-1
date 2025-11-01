'''
Business: Управление виртуальными картами (создание, просмотр, баланс)
Args: event - dict с httpMethod, body (user_id), queryStringParameters
      context - объект с request_id
Returns: HTTP response с данными карт или ошибкой
'''
import json
import os
import psycopg2
import random
from typing import Dict, Any


def generate_card_number() -> str:
    parts = [str(random.randint(1000, 9999)) for _ in range(4)]
    return ' '.join(parts)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        user_id = params.get('user_id')
        
        if not user_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'user_id is required'})
            }
        
        cur.execute(
            "SELECT id, card_number, card_type, card_name, card_category, is_child_card, balance, created_at FROM cards WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,)
        )
        cards_data = cur.fetchall()
        
        cards = []
        for card in cards_data:
            cards.append({
                'id': card[0],
                'card_number': card[1],
                'card_type': card[2],
                'card_name': card[3],
                'card_category': card[4],
                'is_child_card': card[5],
                'balance': float(card[6]),
                'created_at': card[7].isoformat() if card[7] else None
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'cards': cards})
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        user_id = body_data.get('user_id')
        card_type = body_data.get('card_type', 'virtual')
        card_name = body_data.get('card_name', 'Виртуальная карта')
        card_category = body_data.get('card_category', 'debit')
        is_child_card = body_data.get('is_child_card', False)
        
        if not user_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'user_id is required'})
            }
        
        cur.execute("SELECT COUNT(*) FROM cards WHERE user_id = %s", (user_id,))
        card_count = cur.fetchone()[0]
        
        if card_count >= 10:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Maximum 10 cards allowed'})
            }
        
        card_number = generate_card_number()
        
        cur.execute(
            "INSERT INTO cards (user_id, card_number, card_type, card_name, card_category, is_child_card, balance) VALUES (%s, %s, %s, %s, %s, %s, 0.00) RETURNING id, card_number, card_type, card_name, card_category, is_child_card, balance",
            (user_id, card_number, card_type, card_name, card_category, is_child_card)
        )
        new_card = cur.fetchone()
        conn.commit()
        
        card_data = {
            'id': new_card[0],
            'card_number': new_card[1],
            'card_type': new_card[2],
            'card_name': new_card[3],
            'card_category': new_card[4],
            'is_child_card': new_card[5],
            'balance': float(new_card[6])
        }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'card': card_data, 'message': 'Card created successfully'})
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Method not allowed'})
    }