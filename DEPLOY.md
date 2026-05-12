# AGENDA WA — Guía de despliegue
## Stack: Next.js + Supabase + Twilio + Vercel

---

## PASO 1 — Supabase (base de datos)

1. Entra en https://supabase.com → New project
2. Anota: Project URL y anon key (Settings > API)
3. Ve a SQL Editor → pega el contenido de `supabase-schema.sql` → Run
4. Anota el `id` del negocio creado:
   ```sql
   SELECT id FROM businesses LIMIT 1;
   ```

---

## PASO 2 — Twilio (WhatsApp)

1. Cuenta en https://twilio.com (prueba gratuita disponible)
2. Console → Messaging → Try it out → Send a WhatsApp message
3. Sigue las instrucciones para activar el Sandbox de WhatsApp
4. Anota:
   - Account SID
   - Auth Token
   - Número de sandbox: `whatsapp:+14155238886`

> **Para producción** (clientes reales): solicitar WhatsApp Business en Twilio.
> Coste: ~1€/100 mensajes. El proceso tarda 1-2 semanas.

---

## PASO 3 — Variables de entorno

Copia `.env.local.example` a `.env.local` y rellena:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
NEXT_PUBLIC_BUSINESS_ID=uuid-del-negocio-de-supabase

CRON_SECRET=una-clave-aleatoria-segura
```

---

## PASO 4 — Vercel (hosting)

1. Instala Vercel CLI: `npm i -g vercel`
2. Desde la carpeta del proyecto:
   ```bash
   vercel
   ```
3. En Vercel Dashboard → Settings → Environment Variables:
   Añade todas las variables del paso 3
4. Redeploy para que apliquen las variables

---

## PASO 5 — Configurar el negocio

1. Entra en `https://tu-app.vercel.app/settings`
2. Pon el nombre del centro, número de WhatsApp y personaliza el mensaje
3. Variables disponibles en el mensaje:
   - `{nombre}` → nombre del cliente
   - `{negocio}` → nombre del centro
   - `{fecha}` → fecha formateada en español
   - `{hora}` → hora de la cita
   - `{servicio}` → tipo de servicio

---

## FLUJO COMPLETO

```
Tú creas cita
    ↓
App envía WhatsApp automático al cliente
    ↓
Cliente recibe: "Confirmar / Cancelar" con dos enlaces
    ↓
Cliente pulsa enlace
    ↓
Base de datos se actualiza automáticamente
    ↓
La agenda refleja el nuevo estado en tiempo real
```

---

## RECORDATORIOS AUTOMÁTICOS

El archivo `vercel.json` configura un cron job que se ejecuta cada hora.
Vercel (plan gratuito) incluye 2 cron jobs gratuitos.

Para que funcione, añade `CRON_SECRET` en las variables de Vercel.

---

## PARA INSTALAR EN OTRO CLIENTE

1. Duplica el proyecto en GitHub (o usa el mismo repo con ramas)
2. Crea nuevo proyecto en Vercel apuntando al repo
3. Cambia solo las variables de entorno:
   - `NEXT_PUBLIC_BUSINESS_ID` → nuevo UUID del negocio en Supabase
   - Las credenciales de Twilio pueden ser las mismas
4. En Supabase, inserta un nuevo registro en `businesses` con los datos del cliente

Coste por cliente adicional: 0€ (hasta los límites gratuitos de Vercel/Supabase)

---

## UPGRADES FUTUROS (sin reescribir el código)

- **Cambiar de Twilio a otro proveedor**: solo modificar `src/lib/whatsapp.ts`
- **Añadir multi-tenant (SaaS)**: añadir autenticación con Supabase Auth, asociar cada usuario a un `business_id`
- **App móvil**: el backend ya es una API REST, se conecta directamente
- **Recordatorios por SMS**: añadir función en `whatsapp.ts`
