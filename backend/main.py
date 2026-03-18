from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal, Funcionario, Empresa

app = FastAPI()

# Configurar CORS para o frontend (geralmente localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, especifique as origens permitidas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependência para obter a sessão do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class LoginRequest(BaseModel):
    login: str
    password: str

class EmpresaCreate(BaseModel):
    razao_social: str
    nome_fantasia: str
    cnpj: str
    inscricao_estadual: str | None = None
    segmento: str | None = None
    nome_responsavel: str | None = None
    cargo_responsavel: str | None = None
    email: str | None = None
    telefone: str | None = None
    cep: str | None = None
    endereco: str | None = None
    cidade: str | None = None
    estado: str | None = None

@app.post("/empresas")
def create_empresa(empresa: EmpresaCreate, db: Session = Depends(get_db)):
    # Verificar se o CNPJ já existe
    existing_empresa = db.query(Empresa).filter(Empresa.cnpj == empresa.cnpj).first()
    if existing_empresa:
        raise HTTPException(status_code=400, detail="Empresa com este CNPJ já cadastrada")
    
    db_empresa = Empresa(
        razao_social=empresa.razao_social,
        nome_fantasia=empresa.nome_fantasia,
        cnpj=empresa.cnpj,
        inscricao_estadual=empresa.inscricao_estadual,
        segmento=empresa.segmento,
        nome_responsavel=empresa.nome_responsavel,
        cargo_responsavel=empresa.cargo_responsavel,
        email=empresa.email,
        telefone=empresa.telefone,
        cep=empresa.cep,
        endereco=empresa.endereco,
        cidade=empresa.cidade,
        estado=empresa.estado
    )
    db.add(db_empresa)
    db.commit()
    db.refresh(db_empresa)
    return db_empresa

@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Buscar o funcionário pelo login
    user = db.query(Funcionario).filter(Funcionario.login == request.login).first()
    
    if not user or user.senha != request.password:
        raise HTTPException(status_code=401, detail="Login ou senha incorretos")
    
    # Determinar o papel do usuário (role) baseado no cargo
    # Exemplo: Se o cargo contém "Suporte" ou "Analista de Sistemas", é Suporte
    role = "suporte"
    if "Desenvolvedora" in user.cargo or "Diretor" in user.cargo:
        role = "empresa"
    
    # Buscar informações da empresa do funcionário
    empresa = db.query(Empresa).filter(Empresa.id == user.empresa_id).first()
    
    return {
        "id": user.id,
        "nome": user.nome,
        "email": user.email,
        "cargo": user.cargo,
        "role": role,
        "empresa": empresa.nome_fantasia if empresa else "N/A"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
