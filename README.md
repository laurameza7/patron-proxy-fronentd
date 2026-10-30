# Proxy AI — Frontend (React + Vite)

Interfaz tipo chat para la **Plataforma de consumo de IA con Proxy de rate limiting y cuotas**. Taller del **Patrón Proxy**, Patrones de Software, Universidad Cooperativa de Colombia, Campus Pasto.

**Autora:** Laura Sofía Meza Reinoso

## Funcionalidades

- Interfaz tipo chat para enviar prompts al servicio de IA.
- Barra de progreso de cuota (tokens usados vs disponibles), actualizada después de cada request.
- Contador de requests por minuto con cuenta regresiva hasta el reset.
- Al alcanzar el rate limit (429), se deshabilita el botón de envío y se muestra un countdown.
- Al agotar la cuota mensual (402), se abre un modal de upgrade con pago simulado.
- Gráfica de barras con el uso diario de los últimos 7 días.
- Badge del plan actual (FREE, PRO, ENTERPRISE) con colores diferenciados.
- Estimador que muestra cuántos tokens aproximados consumirá un prompt antes de enviarlo.

## Estructura

```
src/
├── api/          AIPlatformClient (cliente HTTP), ApiError
├── domain/       Plan, TokenEstimator, UserIdentity
├── hooks/        useSecondTicker
└── components/   ChatPanel, QuotaBar, RateLimitCounter, UsageChart, PlanBadge, UpgradeModal
```

## Ejecutar

```bash
npm install
cp .env.example .env   # define VITE_API_URL con la URL del backend
npm run dev
```

## Despliegue en Vercel

Import Project → seleccionar este repo → Framework: Vite → Environment Variable `VITE_API_URL` = URL del backend en Railway → Deploy.
