# שלב 1: בניית אפליקציית Vite
FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# שלב 2: שרת סטטי להרצת התוצר
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# הסרת קונפיג ברירת מחדל של NGINX
RUN rm /etc/nginx/conf.d/default.conf

# הוספת קובץ קונפיג מותאם
COPY nginx.conf /etc/nginx/conf.d

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
