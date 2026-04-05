from database import engine
from sqlalchemy import text

def update_schema():
    with engine.connect() as conn:
        print("Adicionando colunas à tabela funcionarios...")
        try:
            conn.execute(text("ALTER TABLE funcionarios ADD COLUMN permissao VARCHAR(20) DEFAULT 'usuario'"))
            print("- Coluna 'permissao' adicionada")
        except Exception as e:
            print(f"- Erro ao adicionar 'permissao': {e}")
            
        try:
            conn.execute(text("ALTER TABLE funcionarios ADD COLUMN status VARCHAR(20) DEFAULT 'ativo'"))
            print("- Coluna 'status' adicionada")
        except Exception as e:
            print(f"- Erro ao adicionar 'status': {e}")
            
        try:
            conn.execute(text("ALTER TABLE funcionarios ADD COLUMN data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP"))
            print("- Coluna 'data_cadastro' adicionada")
        except Exception as e:
            print(f"- Erro ao adicionar 'data_cadastro': {e}")
            
        conn.commit()
        print("Schema atualizado!")

if __name__ == "__main__":
    update_schema()
