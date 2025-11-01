'''
Business: Переводы между картами по номеру карты или телефону
Args: event - dict с httpMethod, body (from_card_id, to_identifier, amount, type)
      context - объект с request_id
Returns: HTTP response с результатом транзакции
'''
import json
import os
import psycopg2
from typing import Dict, Any
from decimal import Decimal


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
        card_id = params.get('card_id')
        
        if not card_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'card_id is required'})
            }
        
        cur.execute(
            """
            SELECT t.id, t.amount, t.transaction_type, t.description, t.created_at,
                   c_from.card_number as from_card, c_to.card_number as to_card
            FROM transactions t
            LEFT JOIN cards c_from ON t.from_card_id = c_from.id
            LEFT JOIN cards c_to ON t.to_card_id = c_to.id
            WHERE t.from_card_id = %s OR t.to_card_id = %s
            ORDER BY t.created_at DESC
            LIMIT 50
            """,
            (card_id, card_id)
        )
        transactions_data = cur.fetchall()
        
        transactions = []
        for tx in transactions_data:
            transactions.append({
                'id': tx[0],
                'amount': float(tx[1]),
                'type': tx[2],
                'description': tx[3],
                'created_at': tx[4].isoformat() if tx[4] else None,
                'from_card': tx[5],
                'to_card': tx[6]
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'transactions': transactions})
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        from_card_id = body_data.get('from_card_id')
        to_identifier = body_data.get('to_identifier', '').strip()
        amount = body_data.get('amount', 0)
        identifier_type = body_data.get('identifier_type', 'card')
        
        if not from_card_id or not to_identifier or amount <= 0:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Invalid transfer data'})
            }
        
        cur.execute("SELECT balance FROM cards WHERE id = %s", (from_card_id,))
        from_card = cur.fetchone()
        
        if not from_card:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Source card not found'})
            }
        
        if from_card[0] < Decimal(str(amount)):
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Insufficient funds'})
            }
        
        if identifier_type == 'phone':
            cur.execute(
                "SELECT c.id FROM cards c JOIN users u ON c.user_id = u.id WHERE u.phone = %s LIMIT 1",
                (to_identifier,)
            )
        else:
            cur.execute("SELECT id FROM cards WHERE card_number = %s", (to_identifier,))
        
        to_card = cur.fetchone()
        
        if not to_card:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Recipient not found'})
            }
        
        to_card_id = to_card[0]
        
        cur.execute(
            "UPDATE cards SET balance = balance - %s WHERE id = %s",
            (amount, from_card_id)
        )
        
        cur.execute(
            "UPDATE cards SET balance = balance + %s WHERE id = %s",
            (amount, to_card_id)
        )
        
        cur.execute(
            "INSERT INTO transactions (from_card_id, to_card_id, amount, transaction_type, description) VALUES (%s, %s, %s, %s, %s) RETURNING id",
            (from_card_id, to_card_id, amount, 'transfer', f'Transfer via {identifier_type}')
        )
        
        transaction_id = cur.fetchone()[0]
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'message': 'Transfer successful', 'transaction_id': transaction_id})
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
