import csv
import mysql.connector
import os
from urllib.parse import urlparse, parse_qs

# Ler DATABASE_URL do ambiente
database_url = os.getenv('DATABASE_URL')
if not database_url:
    print("DATABASE_URL não encontrada")
    exit(1)

# Parse da URL
parsed = urlparse(database_url)
database = parsed.path.lstrip('/')

# Conectar ao banco
conn = mysql.connector.connect(
    host=parsed.hostname,
    port=parsed.port or 3306,
    user=parsed.username,
    password=parsed.password,
    database=database,
    ssl_ca='',
    ssl_disabled=False
)

cursor = conn.cursor()

# Limpar tabela empresas
print("Limpando tabela empresas...")
cursor.execute("DELETE FROM empresas")
conn.commit()

# Ler CSV
print("Lendo CSV...")
with open('/home/ubuntu/upload/empresas_20260202_100005.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter=';')
    count = 0
    for row in reader:
        # Converter CNPJ de notação científica para string
        cnpj = str(int(float(row['cnpj']))) if row['cnpj'] else None
        telefone = row['telefone'] if row['telefone'] else None
        
        # Inserir na tabela
        cursor.execute("""
            INSERT INTO empresas (id, razaoSocial, nomeEmpresa, cnpj, telefone, createdAt, updatedAt)
            VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            int(row['id_empresas']),
            row['razaoSocial'],
            row['nomeEmpresa'],
            cnpj,
            telefone
        ))
        count += 1

conn.commit()
print(f"Importados {count} registros com sucesso!")

cursor.close()
conn.close()
