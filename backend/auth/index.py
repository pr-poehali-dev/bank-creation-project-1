'''
Business: Регистрация и авторизация пользователей банка
Args: event - dict с httpMethod, body (phone, name)
      context - объект с request_id
Returns: HTTP response с данными пользователя или ошибкой
'''
import json
import os
import psycopg2
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'DELETE':
        params = event.get('queryStringParameters') or {}
        user_id = params.get('user_id')
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'user_id is required'})
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute("DELETE FROM transactions WHERE from_card_id IN (SELECT id FROM cards WHERE user_id = %s) OR to_card_id IN (SELECT id FROM cards WHERE user_id = %s)", (user_id, user_id))
        cur.execute("DELETE FROM cards WHERE user_id = %s", (user_id,))
        cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'message': 'Account deleted successfully'})
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    phone = body_data.get('phone', '').strip()
    name = body_data.get('name', '').strip()
    
    if not phone or not name:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Phone and name are required'})
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    cur.execute("SELECT id, phone, name FROM users WHERE phone = %s", (phone,))
    existing_user = cur.fetchone()
    
    if existing_user:
        user_data = {
            'id': existing_user[0],
            'phone': existing_user[1],
            'name': existing_user[2]
        }
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'user': user_data, 'message': 'Login successful'})
        }
    
    cur.execute(
        "INSERT INTO users (phone, name) VALUES (%s, %s) RETURNING id, phone, name",
        (phone, name)
    )
    new_user = cur.fetchone()
    conn.commit()
    
    user_data = {
        'id': new_user[0],
        'phone': new_user[1],
        'name': new_user[2]
    }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'user': user_data, 'message': 'Registration successful'})
    }