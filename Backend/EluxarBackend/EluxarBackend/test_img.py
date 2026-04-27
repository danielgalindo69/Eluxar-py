import urllib.request
from PIL import Image
import io

img = Image.new('RGB', (100, 100), color = 'red')
img_byte_arr = io.BytesIO()
img.save(img_byte_arr, format='PNG')
img_bytes = img_byte_arr.getvalue()

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = []
body.append('--' + boundary)
body.append('Content-Disposition: form-data; name="imagen"; filename="test.png"')
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

req = urllib.request.Request('http://localhost:8080/api/ia/imagen/mejorar', data=payload, method='POST')
req.add_header('Accept', 'application/json')
req.add_header('Content-Type', 'multipart/form-data; boundary=' + boundary)

try:
    with urllib.request.urlopen(req) as f:
        print('SUCCESS:', f.read().decode('utf-8'))
except Exception as e:
    print('ERROR:', e.code)
    print(e.read().decode('utf-8'))
