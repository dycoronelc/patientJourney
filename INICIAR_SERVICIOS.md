REDIS:
En dycoronel@DESKTOP-F3FLSR5:~$
WSL
sudo service redis-server start

BACKEND:
En C:\react\patient_journey\backend
.\venv\Scripts\Activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

FRONTEND:
En C:\react\patient_journey\client
npm start