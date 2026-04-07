from database import SessionLocal, Funcionario

db = SessionLocal()
try:
    user = db.query(Funcionario).filter(Funcionario.login == 'maria.souza').first()
    if user:
        print(f"User found: ID={user.id}, Login={user.login}, Password={user.senha}, Role={user.cargo}")
    else:
        print("User maria.souza not found.")
        
    all_users = db.query(Funcionario).all()
    print(f"\nTotal users in DB: {len(all_users)}")
    for u in all_users:
        print(f"- {u.login} (ID: {u.id})")
finally:
    db.close()
