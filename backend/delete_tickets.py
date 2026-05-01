from sqlalchemy import create_engine, text

DATABASE_URL = "mysql+pymysql://root@localhost/helpdesk"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    ids_to_delete = [14, 15, 17, 18]
    print(f"Removendo chamados com IDs: {ids_to_delete}...")
    try:
        # Primeiro remove o histórico relacionado para evitar erro de FK
        conn.execute(text(f"DELETE FROM historico_chamados WHERE chamado_id IN ({','.join(map(str, ids_to_delete))})"))
        # Depois remove os chamados
        result = conn.execute(text(f"DELETE FROM chamados WHERE id IN ({','.join(map(str, ids_to_delete))})"))
        conn.commit()
        print(f"Chamados removidos com sucesso! ({result.rowcount} linhas afetadas)")
    except Exception as e:
        print(f"Erro ao remover chamados: {e}")
