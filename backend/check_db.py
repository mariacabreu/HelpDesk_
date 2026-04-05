import pymysql

def check_columns():
    try:
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='',
            database='helpdesk'
        )
        with connection.cursor() as cursor:
            cursor.execute("DESCRIBE funcionarios")
            columns = cursor.fetchall()
            print("Colunas na tabela 'funcionarios':")
            for col in columns:
                print(f"- {col[0]}: {col[1]}")
            
            cursor.execute("DESCRIBE chamados")
            columns = cursor.fetchall()
            print("\nColunas na tabela 'chamados':")
            for col in columns:
                print(f"- {col[0]}: {col[1]}")
        connection.close()
    except Exception as e:
        print(f"Erro ao conectar ao MySQL: {e}")

if __name__ == "__main__":
    check_columns()
