# Respaldo interno

En Configuración, un administrador puede descargar un respaldo completo de la base PostgreSQL conectada, confirmando su contraseña. La API verifica las credenciales y el rol en `users`; no confía en el rol enviado por el navegador.

El archivo `.sql.gz` contiene el esquema real y los datos, incluidos usuarios, índices, restricciones, secuencias, funciones y otros objetos exportados por `pg_dump`. No ejecuta inicialización ni limpieza. No incluye registros ya eliminados, archivos externos ni roles globales del clúster PostgreSQL.

## Servidor

La imagen Docker instala PostgreSQL client 18. Reconstruir la imagen para habilitar la descarga. En otros entornos instalar `pg_dump` de una versión igual o superior a la del servidor; opcionalmente configurar `PG_DUMP_PATH` con la ruta del ejecutable. El usuario de conexión necesita acceso de lectura a todos los objetos del respaldo.

Se prioriza `BACKUP_DATABASE_URL`, después `POSTGRES_URL_NON_POOLING`, y finalmente las variables de conexión habituales de la aplicación. La conexión de respaldo debe apuntar a la misma base de datos; usar una conexión directa si hay un pooler. El proceso tiene un límite de dos minutos, y los archivos temporales se eliminan al finalizar. No se entrega una descarga parcial si falla la exportación.

Vercel también expone `/api/backup`, pero necesita un binario `pg_dump` compatible con su runtime y está sujeto a sus límites de tiempo y tamaño de respuesta. La configuración actual de Vercel no incluye ese binario. Para usar la opción allí se necesita configurar ese runtime; el contenedor Docker ya incluye el cliente.

## Restauración

Descomprimir el archivo y ejecutar sobre una instancia de destino con los roles y extensiones necesarios:

```sh
gunzip desposte-respaldo-completo-FECHA.sql.gz
psql -X --set ON_ERROR_STOP=on --dbname=postgres --file=desposte-respaldo-completo-FECHA.sql
```

El SQL crea la base de datos con su nombre original; restaurar en una instancia donde no exista una base con ese nombre. Preserva propietarios y permisos, por lo que los roles originales deben existir. Validar la restauración en una instancia de prueba antes de usarla para recuperación.

Referencia: [pg_dump, documentación oficial](https://www.postgresql.org/docs/current/app-pgdump.html).
