from database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE chamados ADD COLUMN nome_solicitante VARCHAR(100)"))
            print("Coluna nome_solicitante adicionada.")
        except Exception as e:
            print(f"Erro ao adicionar nome_solicitante: {e}")
            
        try:
            conn.execute(text("ALTER TABLE chamados ADD COLUMN email_solicitante VARCHAR(100)"))
            print("Coluna email_solicitante adicionada.")
        except Exception as e:
            print(f"Erro ao adicionar email_solicitante: {e}")
            
        conn.commit()
        print("Migração concluída.")

if __name__ == "__main__":
    migrate()
