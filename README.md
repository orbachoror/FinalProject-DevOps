# Holidays Counter

A React countdown app for religious holidays (Jewish, Muslim, Christian) in 2025.

![Holidays Counter App](./image.png)

## How to Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## JSON Structure

The `public/holidays2025,json` file contains holiday data:

```json
{
  "jewish": [
    { "name": "Purim", "start": "2025-03-13", "end": "2025-03-14" }
  ],
  "muslim": [
    { "name": "Eid al-Fitr", "start": "2025-03-31", "end": "2025-03-31" }
  ],
  "christian": [
    { "name": "Easter Sunday", "start": "2025-04-20", "end": "2025-04-20" }
  ]
}
```

Each holiday has:
- `name`: Holiday name
- `start`: Start date (YYYY-MM-DD)
- `end`: End date (YYYY-MM-DD)


'test'