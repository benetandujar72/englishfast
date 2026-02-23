# Prisma baseline en produccion (sin reset)

Este proyecto ya tenia tablas en la base de datos antes de usar migraciones versionadas.
Para evitar `migrate reset` y no perder datos, se usa un baseline:

- Migracion baseline: `prisma/migrations/0000_baseline/migration.sql`
- Lock de proveedor: `prisma/migrations/migration_lock.toml`

## Flujo recomendado

1. Sube a GitHub los archivos de baseline.
2. Despliega la app con ese commit.
3. Marca el baseline como aplicado en produccion (NO ejecuta SQL ni borra datos):

```bash
pnpm prisma migrate resolve --applied 0000_baseline
```

4. Verifica estado:

```bash
pnpm prisma migrate status
```

Deberia mostrar la migracion `0000_baseline` como aplicada.

## Para cambios futuros de esquema

Despues del baseline, crea migraciones incrementales normales:

```bash
pnpm prisma migrate dev --name <descripcion_cambio>
```

y en produccion aplica con:

```bash
pnpm prisma migrate deploy
```

## Notas de seguridad

- No ejecutes `prisma migrate reset` en produccion.
- Si aparecen cambios manuales en la BD fuera de Prisma, alinea primero el schema y luego genera una migracion incremental.
