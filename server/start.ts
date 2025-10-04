import app from './index.ts';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.listen(PORT, () => {
  console.log(`[gateway] listening on http://localhost:${PORT}`);
});
