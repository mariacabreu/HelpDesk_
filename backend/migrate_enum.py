from sqlalchemy import create_engine, text

DATABASE_URL = "mysql+pymysql://root@localhost/helpdesk"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Alterando colunas da tabela chamados...")
    try:
        conn.execute(text("ALTER TABLE chamados MODIFY COLUMN status VARCHAR(50)"))
        conn.execute(text("ALTER TABLE chamados MODIFY COLUMN prioridade VARCHAR(50)"))
        conn.commit()
        print("Colunas alteradas com sucesso!")
    except Exception as e:
        print(f"Erro ao alterar colunas: {e}")
