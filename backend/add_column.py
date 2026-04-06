from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE chamados ADD COLUMN escalonado_por_nivel VARCHAR(20) DEFAULT NULL AFTER status"))
        conn.commit()
        print("Coluna 'escalonado_por_nivel' adicionada com sucesso!")
    except Exception as e:
        print(f"Erro ao adicionar coluna: {e}")
