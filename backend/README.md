## Rodar npx tsc antes dos comandos abaixo

# Para gerar as migrações
npx typeorm migration:generate -d ./dist/database/data-source.js ./src/database/migration/<nome>

# Para rodar as migrações
npx typeorm migration:run -d ./dist/database/data-source.js 