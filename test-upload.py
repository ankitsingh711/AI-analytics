#!/usr/bin/env python3

import requests
import json

# Test the upload endpoint
print("Testing upload endpoint...")

# Read the JSON file
with open('drone-zone-alpha.json', 'r') as f:
    file_content = f.read()

print(f"File content length: {len(file_content)}")

# Test upload
files = {'file': ('drone-zone-alpha.json', file_content, 'application/json')}
headers = {'Origin': 'http://localhost:3000'}

print("Making upload request...")
try:
    response = requests.post('http://localhost:8000/upload', files=files, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print(f"Content: {response.text}")
except Exception as e:
    print(f"Error: {e}")

print("\nTesting simple endpoints...")

# Test other endpoints
endpoints = [
    '/dashboard/stats',
    '/violations', 
    '/reports'
]

for endpoint in endpoints:
    try:
        response = requests.get(f'http://localhost:8000{endpoint}', headers=headers)
        print(f"{endpoint}: {response.status_code}")
    except Exception as e:
        print(f"{endpoint}: Error - {e}") 