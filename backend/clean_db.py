from sqlalchemy import create_engine, text

DATABASE_URL = "mysql+pymysql://root@localhost/helpdesk"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Limpando registros de chamados...")
    try:
        conn.execute(text("UPDATE chamados SET status = REPLACE(status, 'StatusChamado.', '')"))
        conn.execute(text("UPDATE chamados SET prioridade = REPLACE(prioridade, 'Prioridade.', '')"))
        
        conn.execute(text("UPDATE chamados SET status = LOWER(status)"))
        conn.execute(text("UPDATE chamados SET prioridade = LOWER(prioridade)"))
        
        conn.commit()
        print("Registros limpos com sucesso!")
    except Exception as e:
        print(f"Erro ao limpar registros: {e}")
