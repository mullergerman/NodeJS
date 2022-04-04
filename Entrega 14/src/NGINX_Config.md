# Configuracion de NGINX

```
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
	worker_connections 768;
}

http {


	sendfile on;
	tcp_nopush on;
	types_hash_max_size 2048;

	include /etc/nginx/mime.types;
	default_type application/octet-stream;

	ssl_prefer_server_ciphers on;

	access_log /var/log/nginx/access.log;
	error_log /var/log/nginx/error.log;

	gzip on;
	include /etc/nginx/conf.d/*.conf;
	include /etc/nginx/sites-enabled/*;


    upstream node_api {
        server 127.0.0.1:8081;
	server 127.0.0.1:8082;
	server 127.0.0.1:8083;
	server 127.0.0.1:8084;
    }

    upstream node_main {
	server 127.0.0.1:8080;
    }

    server {
        listen       80;
        server_name  localhost;

        location /api/randoms {
            proxy_pass http://node_api;
        }

        location / {
            proxy_pass http://node_main;
        }
        
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }

    }
}
```

# Inicio de procesos
```
pm2 start api_random.js --name="api_random.js" -f --watch -- -p 8082
pm2 start api_random.js --name="api_random.js" -f --watch -- -p 8082
pm2 start api_random.js --name="api_random.js" -f --watch -- -p 8083
pm2 start api_random.js --name="api_random.js" -f --watch -- -p 8084
pm2 start main.js --name="main.js" --watch -- -p 8080
```
