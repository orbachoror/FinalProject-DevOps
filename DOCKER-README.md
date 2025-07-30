Holidays Counter — Docker Deployment Guide
קבצים מרכזיים
Dockerfile: מגדיר בניית Image מבוסס Node 20 Alpine עם הפעלת npm run dev.

docker-compose.yml: מושך Image מ־Docker Hub (iyarh/final-devops-app:latest), מגדיר ENV NODE_ENV=prod, וממפה פורט 80 ל־5173.

הרצת הפרויקט
לפיתוח מקומי (Live Reload)
לא מיועד ב־compose הנוכחי; להרצה מקומית עם build צריך להגדיר docker-compose.dev.yml עם build: ו־volumes:.

לפרודקשן / בדיקות (עם Image מוכן)
bash
Copy
docker compose up -d
האתר זמין ב־http://localhost (פורט 80).

בניית Image ועדכון Docker Hub
bash
Copy
docker build -t iyarh/final-devops-app:latest .
docker push iyarh/final-devops-app:latest
ניהול קונטיינרים
עצירת והרמת שירות:

bash
Copy
docker compose down
docker compose up -d
בדיקת סטטוס ולוגים:

bash
Copy
docker ps
docker logs holidayscounter
הערות
ודאו ש־Image מעודכן ב־Docker Hub לפני הרצת Compose בפרודקשן.

לפיתוח מומלץ להגדיר Compose נפרד עם build ו־volumes כדי לתמוך ב־live reload.