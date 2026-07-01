# Implementación de Tipo de Cambio USD/ARS

## Descripción
Esta actualización permite:
1. Capturar el tipo de cambio oficial del dólar cuando se registra una transacción en USD
2. Guardar el tipo de cambio en la base de datos para análisis comparativos
3. Mostrar ingresos/egresos y balance en USD en el dashboard si existen transacciones en esa moneda

## Cambios Realizados

### 1. APIs Nuevas

#### `/api/exchange-rate`
- **GET**: Obtiene el tipo de cambio actual del dólar

#### `/api/get-exchange-rate`
- **GET**: Obtiene o crea un registro de tipo de cambio para una fecha específica
- **POST**: Permite guardar manualmente un tipo de cambio

### 2. Base de Datos

Se requieren los siguientes cambios (ejecutar en Supabase SQL Editor):

```sql
-- Crear tabla exchange_rates
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  currency_from VARCHAR(3) NOT NULL DEFAULT 'USD',
  currency_to VARCHAR(3) NOT NULL DEFAULT 'ARS',
  rate DECIMAL(10, 2) NOT NULL,
  source VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(date, currency_from, currency_to)
);

-- Agregar columna a transacciones (si no existe)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10, 2);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON exchange_rates(date);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON exchange_rates(currency_from, currency_to);

-- Habilitar RLS
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read exchange rates" ON exchange_rates
FOR SELECT USING (true);
```

O ejecutar desde el archivo: `migrations/add_exchange_rates.sql`

### 3. Archivos Modificados

#### `/app/dashboard/transactions/transactions-client.tsx`
- Agrega funciones `handleCurrencyChange()` y `handleDateChange()`
- Obtiene el tipo de cambio cuando se selecciona USD
- Muestra la tasa de cambio al usuario
- Guarda `exchange_rate` en la transacción

#### `/app/dashboard/dashboard-client.tsx`
- Ya estaba preparado para mostrar USD
- Ahora funciona correctamente con las nuevas transacciones

### 4. Archivos Nuevos

#### `/app/api/exchange-rate/route.ts`
- Endpoint para obtener el tipo de cambio actual

#### `/app/api/get-exchange-rate/route.ts`
- Maneja GET/POST de tipos de cambio en la BD

#### `/migrations/add_exchange_rates.sql`
- Script de migración SQL

## Flujo de Uso

### Al Registrar una Transacción en USD:

1. Usuario selecciona "Dólares (US$)" como moneda
2. Sistema obtiene el tipo de cambio oficial para esa fecha
3. Se muestra: "Tasa: $1 USD = $1000.00 ARS"
4. Al guardar, se almacena junto con `exchange_rate`

### En el Dashboard:

Si hay transacciones en USD:
- Se muestra "Ingresos": $5000.00 + US$100.00
- Se muestra "Gastos": $2000.00 + US$50.00
- Se muestra "Balance": $3000.00 + US$50.00

## Notas Importantes

1. **API del Banco Central**: Actualmente usa valores por defecto. Para integración real:
   - Usar API oficial: https://www.bancocentral.gov.ar/api/estadisticas/v1/
   - O usar servicio como exchangerate-api.com

2. **Tipos de Cambio Históricos**: Se guardan automáticamente para cada día
   - Permite análisis comparativos
   - No se repite la consulta si ya existe

3. **Precisión**: Se guardan 2 decimales (DECIMAL(10,2))

## Próximos Pasos (Opcional)

- Integrar con API real de tipos de cambio
- Agregar gráficos de evolución del dólar
- Mostrar impacto del cambio de cotización en los ahorros
