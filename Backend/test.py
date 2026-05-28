import urllib.request
import base64

img_b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
img_bytes = base64.b64decode(img_b64)

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = []
body.append('--' + boundary)
body.append('Content-Disposition: form-data; name="image"; filename="test.png"')
body.append('Content-Type: image/png')
body.append('')
body.append('')
body_str = '\r\n'.join(body).encode('utf-8')

body_end = []
body_end.append('')
body_end.append('--' + boundary + '--')
body_end.append('')
body_end_str = '\r\n'.join(body_end).encode('utf-8')

payload = body_str + img_bytes + body_end_str

req = urllib.request.Request('https://api.stability.ai/v2beta/stable-image/edit/remove-background', data=payload, method='POST')
req.add_header('Authorization', 'Bearer sk-LIz5OdDsZsvcEXCm40XMxtGYRp9aGtccTUBPFIrBKCm6ziyP')
req.add_header('Accept', 'application/json')
req.add_header('Content-Type', 'multipart/form-data; boundary=' + boundary)

try:
    with urllib.request.urlopen(req) as f:
        print('SUCCESS:', f.status)
except Exception as e:
    print('ERROR:', e.code)
    print(e.read().decode('utf-8'))
