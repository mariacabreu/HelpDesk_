from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal, Funcionario, Empresa, Chamado, StatusChamado, Prioridade, Equipamento
from datetime import datetime

app = FastAPI()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    print(f"ERRO DE VALIDAÇÃO: {errors}")
    return JSONResponse(
        status_code=422,
        content={"detail": errors},
    )

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

class ChamadoCreate(BaseModel):
    empresa_id: int
    solicitante_id: int
    equipamento_id: int | None = None
    titulo: str
    descricao: str
    tipo: str
    prioridade: str

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
    # Dados de Login
    login: str
    senha: str

class EquipamentoCreate(BaseModel):
    empresa_id: int
    nome: str
    patrimonio: str
    tipo: str | None = None
    marca: str | None = None
    modelo: str | None = None
    numero_serie: str | None = None
    status: str | None = "ativo"

@app.post("/empresas")
def create_empresa(empresa: EmpresaCreate, db: Session = Depends(get_db)):
    # 1. Verificar se o CNPJ já existe
    existing_empresa = db.query(Empresa).filter(Empresa.cnpj == empresa.cnpj).first()
    if existing_empresa:
        raise HTTPException(status_code=400, detail="Empresa com este CNPJ já cadastrada")
    
    # 2. Verificar se o e-mail da empresa já existe
    if empresa.email:
        existing_email_empresa = db.query(Empresa).filter(Empresa.email == empresa.email).first()
        if existing_email_empresa:
            raise HTTPException(status_code=400, detail="Este e-mail de empresa já está em uso")
        
        # Verificar se o e-mail já existe na tabela de funcionários
        existing_email_func = db.query(Funcionario).filter(Funcionario.email == empresa.email).first()
        if existing_email_func:
            raise HTTPException(status_code=400, detail="Este e-mail já está associado a um usuário")

    # 3. Verificar se o login já existe
    existing_user = db.query(Funcionario).filter(Funcionario.login == empresa.login).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Este login já está em uso")

    try:
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

        # Criar o funcionário administrador para a empresa
        db_funcionario = Funcionario(
            empresa_id=db_empresa.id,
            nome=empresa.nome_responsavel or "Administrador",
            email=empresa.email,
        telefone=empresa.telefone,
        cargo="Empresa", # Role empresa é baseada no cargo "Empresa", "Diretor" ou "Desenvolvedora"
        setor="Diretoria",
        login=empresa.login,
            senha=empresa.senha
        )
        db.add(db_funcionario)
        db.commit()
        
        return db_empresa
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno ao criar empresa: {str(e)}")

@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Buscar o funcionário pelo login
    user = db.query(Funcionario).filter(Funcionario.login == request.login).first()
    
    if not user or user.senha != request.password:
        raise HTTPException(status_code=401, detail="Login ou senha incorretos")
    
    # Determinar o papel do usuário (role) baseado no cargo
    # Exemplo: Se o cargo contém "Suporte" ou "Analista de Sistemas", é Suporte
    role = "suporte"
    if any(keyword in user.cargo for keyword in ["Desenvolvedora", "Diretor", "Empresa"]):
        role = "empresa"
    
    # Buscar informações da empresa do funcionário
    empresa = db.query(Empresa).filter(Empresa.id == user.empresa_id).first()
    
    return {
        "id": user.id,
        "nome": user.nome,
        "email": user.email,
        "cargo": user.cargo,
        "role": role,
        "empresa": {
            "id": empresa.id,
            "razao_social": empresa.razao_social,
            "nome_fantasia": empresa.nome_fantasia,
            "cnpj": empresa.cnpj,
            "inscricao_estadual": empresa.inscricao_estadual,
            "segmento": empresa.segmento,
            "nome_responsavel": empresa.nome_responsavel,
            "cargo_responsavel": empresa.cargo_responsavel,
            "email": empresa.email,
            "telefone": empresa.telefone,
            "cep": empresa.cep,
            "endereco": empresa.endereco,
            "cidade": empresa.cidade,
            "estado": empresa.estado
        } if empresa else None
    }

@app.post("/chamados")
def create_chamado(chamado: ChamadoCreate, db: Session = Depends(get_db)):
    try:
        # Converter string de prioridade para o Enum correspondente
        prioridade_map = {
            "baixa": Prioridade.BAIXA,
            "media": Prioridade.MEDIA,
            "alta": Prioridade.ALTA,
            "critica": Prioridade.CRITICA
        }
        
        db_chamado = Chamado(
            empresa_id=chamado.empresa_id,
            solicitante_id=chamado.solicitante_id,
            equipamento_id=chamado.equipamento_id if chamado.equipamento_id and chamado.equipamento_id > 0 else None,
            titulo=chamado.titulo,
            descricao=chamado.descricao,
            tipo=chamado.tipo,
            prioridade=prioridade_map.get(chamado.prioridade.lower(), Prioridade.MEDIA),
            status=StatusChamado.ABERTO
        )
        db.add(db_chamado)
        db.commit()
        db.refresh(db_chamado)
        return db_chamado
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar chamado: {str(e)}")

@app.get("/equipamentos/{empresa_id}")
def get_equipamentos(empresa_id: int, db: Session = Depends(get_db)):
    return db.query(Equipamento).filter(Equipamento.empresa_id == empresa_id).all()

@app.post("/equipamentos")
def create_equipamento(e: EquipamentoCreate, db: Session = Depends(get_db)):
    # patrimônio único
    existing = db.query(Equipamento).filter(Equipamento.patrimonio == e.patrimonio).first()
    if existing:
        raise HTTPException(status_code=400, detail="Patrimônio já cadastrado")
    try:
        novo = Equipamento(
            empresa_id=e.empresa_id,
            nome=e.nome,
            patrimonio=e.patrimonio,
            tipo=e.tipo,
            marca=e.marca,
            modelo=e.modelo,
            numero_serie=e.numero_serie,
            status=e.status or "ativo",
        )
        db.add(novo)
        db.commit()
        db.refresh(novo)
        return novo
    except Exception as ex:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao cadastrar equipamento: {str(ex)}")

@app.get("/chamados/empresa/{empresa_id}")
def get_chamados_empresa(empresa_id: int, db: Session = Depends(get_db)):
    return db.query(Chamado).filter(Chamado.empresa_id == empresa_id).all()

@app.get("/chamados/solicitante/{solicitante_id}")
def get_chamados_solicitante(solicitante_id: int, db: Session = Depends(get_db)):
    return db.query(Chamado).filter(Chamado.solicitante_id == solicitante_id).all()

@app.get("/funcionarios/empresa/{empresa_id}")
def get_funcionarios_empresa(empresa_id: int, db: Session = Depends(get_db)):
    return db.query(Funcionario).filter(Funcionario.empresa_id == empresa_id).all()

@app.get("/stats/empresa/{empresa_id}")
def get_stats_empresa(empresa_id: int, db: Session = Depends(get_db)):
    from sqlalchemy import func
    from database import Equipamento, Funcionario, Chamado, StatusChamado
    
    total_chamados = db.query(func.count(Chamado.id)).filter(Chamado.empresa_id == empresa_id).scalar()
    chamados_ativos = db.query(func.count(Chamado.id)).filter(
        Chamado.empresa_id == empresa_id, 
        Chamado.status.in_([StatusChamado.ABERTO, StatusChamado.EM_ATENDIMENTO])
    ).scalar()
    total_equipamentos = db.query(func.count(Equipamento.id)).filter(Equipamento.empresa_id == empresa_id).scalar()
    total_funcionarios = db.query(func.count(Funcionario.id)).filter(Funcionario.empresa_id == empresa_id).scalar()
    
    return {
        "chamados_ativos": chamados_ativos,
        "total_equipamentos": total_equipamentos,
        "total_funcionarios": total_funcionarios,
        "total_chamados": total_chamados
    }

@app.patch("/chamados/{chamado_id}/cancelar")
def cancelar_chamado(chamado_id: int, db: Session = Depends(get_db)):
    chamado = db.query(Chamado).filter(Chamado.id == chamado_id).first()
    if not chamado:
        raise HTTPException(status_code=404, detail="Chamado não encontrado")
    if chamado.status in [StatusChamado.FECHADO, StatusChamado.RESOLVIDO]:
        return chamado
    chamado.status = StatusChamado.FECHADO
    chamado.data_fechamento = datetime.utcnow()
    db.commit()
    db.refresh(chamado)
    return chamado

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
