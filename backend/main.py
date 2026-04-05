from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal, Funcionario, Empresa, Chamado, StatusChamado, Prioridade, Equipamento
from datetime import datetime
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

app = FastAPI()

def generate_unique_login(db: Session):
    while True:
        # Gera 8 números aleatórios
        login = "".join([str(random.randint(0, 9)) for _ in range(8)])
        # Verifica se já existe no banco
        exists = db.query(Funcionario).filter(Funcionario.login == login).first()
        if not exists:
            return login

def extract_password_from_cpf(cpf: str):
    if not cpf:
        # Fallback se não tiver CPF (apesar de ser recomendado)
        return "123456"
    # Remove caracteres não numéricos
    clean_cpf = "".join(filter(str.isdigit, cpf))
    # Pega os 6 primeiros
    return clean_cpf[:6]

def send_real_email(to_email: str, login: str):
    import smtplib
    import os
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = int(os.getenv("SMTP_PORT"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from_name = os.getenv("SMTP_FROM_NAME")

    msg = MIMEMultipart()
    msg["From"] = f"{smtp_from_name} <{smtp_user}>"
    msg["To"] = to_email
    msg["Subject"] = "Boas-vindas e dados de acesso ao sistema"

    body = f"""
Prezado(a) colaborador(a),

Seja bem-vindo(a) à nossa equipe! É com grande satisfação que recebemos você em nosso time.

Informamos que seu acesso ao sistema já foi criado com sucesso. Abaixo, seguem seus dados de login:

Login: {login}
Senha provisória: os 6 primeiros dígitos do seu CPF

Por questões de segurança, orientamos que a senha seja alterada no primeiro acesso.

Desejamos muito sucesso nessa nova jornada e nos colocamos à disposição para qualquer suporte necessário.

Atenciosamente,
Equipe de TI / Recursos Humanos
"""

    msg.attach(MIMEText(body, "plain", "utf-8" ))

    try:
        print("--- DEBUG ENVIO DE E-MAIL ---")
        print(f"SMTP_SERVER: {smtp_server}")
        print(f"SMTP_PORT: {smtp_port}")
        print(f"SMTP_USER: {smtp_user}")
        # A senha não será printada por segurança, mas verificaremos se existe
        print(f"SMTP_PASS configurado: {'Sim' if smtp_password else 'Não'}")
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.set_debuglevel(1) # Ativa logs detalhados do SMTP no terminal
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, to_email, msg.as_string())
        server.quit()
        print(f"E-mail enviado com sucesso para: {to_email}")
        return True
    except Exception as e:
        print("Erro detalhado ao enviar:", e)
        return False

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
    atribuido_a_id: int | None = None # Nova coluna para atribuição direta
    titulo: str
    descricao: str
    tipo: str
    prioridade: str

class FuncionarioCreate(BaseModel):
    empresa_id: int
    nome: str
    cpf: str | None = None
    email: str
    telefone: str | None = None
    cargo: str | None = None
    setor: str | None = None
    nivel: str | None = "n1"
    permissao: str | None = "usuario"
    # login e senha serão gerados automaticamente no backend

class FuncionarioUpdate(BaseModel):
    nome: str | None = None
    cpf: str | None = None
    email: str | None = None
    telefone: str | None = None
    cargo: str | None = None
    setor: str | None = None
    nivel: str | None = None
    permissao: str | None = None
    status: str | None = None

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

class EquipamentoUpdate(BaseModel):
    nome: str | None = None
    patrimonio: str | None = None
    tipo: str | None = None
    marca: str | None = None
    modelo: str | None = None
    numero_serie: str | None = None
    status: str | None = None

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
            setor="Administrador de rede",
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
        
        atribuido_id = chamado.atribuido_a_id
        
        # Lógica de atribuição automática aleatória se solicitado (ID -1)
        if atribuido_id == -1:
            # Buscar todos os funcionários de suporte com o nível correspondente à prioridade
            nivel_alvo = "n1"
            if chamado.prioridade.lower() == "media": nivel_alvo = "n2"
            if chamado.prioridade.lower() == "alta": nivel_alvo = "n3"
            
            # Busca suporte técnico (analistas) da empresa que gerencia o suporte
            # Para este MVP, vamos buscar funcionários da mesma empresa que tenham o nível
            suportes = db.query(Funcionario).filter(
                Funcionario.nivel == nivel_alvo,
                Funcionario.status == "ativo"
            ).all()
            
            if suportes:
                atribuido_id = random.choice(suportes).id
            else:
                atribuido_id = None

        db_chamado = Chamado(
            empresa_id=chamado.empresa_id,
            solicitante_id=chamado.solicitante_id,
            equipamento_id=chamado.equipamento_id if chamado.equipamento_id and chamado.equipamento_id > 0 else None,
            atribuido_a_id=atribuido_id if atribuido_id and atribuido_id > 0 else None,
            titulo=chamado.titulo,
            descricao=chamado.descricao,
            tipo=chamado.tipo,
            prioridade=prioridade_map.get(chamado.prioridade.lower(), Prioridade.MEDIA),
            status=StatusChamado.ABERTO if not atribuido_id else StatusChamado.EM_ATENDIMENTO
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

@app.patch("/equipamentos/{equipamento_id}")
def update_equipamento(equipamento_id: int, e: EquipamentoUpdate, db: Session = Depends(get_db)):
    db_eq = db.query(Equipamento).filter(Equipamento.id == equipamento_id).first()
    if not db_eq:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    
    update_data = e.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_eq, key, value)
    
    try:
        db.commit()
        db.refresh(db_eq)
        return db_eq
    except Exception as ex:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar equipamento: {str(ex)}")

@app.delete("/equipamentos/{equipamento_id}")
def delete_equipamento(equipamento_id: int, db: Session = Depends(get_db)):
    db_eq = db.query(Equipamento).filter(Equipamento.id == equipamento_id).first()
    if not db_eq:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    
    try:
        # Primeiro desvincular de chamados se houver (opcional, ou apenas deletar se não tiver restrição)
        db.query(Chamado).filter(Chamado.equipamento_id == equipamento_id).update({Chamado.equipamento_id: None})
        
        db.delete(db_eq)
        db.commit()
        return {"success": True, "message": "Equipamento excluído com sucesso"}
    except Exception as ex:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao excluir equipamento: {str(ex)}")

@app.get("/chamados/empresa/{empresa_id}")
def get_chamados_empresa(empresa_id: int, db: Session = Depends(get_db)):
    return db.query(Chamado).filter(Chamado.empresa_id == empresa_id).all()

@app.get("/chamados/solicitante/{solicitante_id}")
def get_chamados_solicitante(solicitante_id: int, db: Session = Depends(get_db)):
    return db.query(Chamado).filter(Chamado.solicitante_id == solicitante_id).all()

@app.get("/funcionarios/empresa/{empresa_id}")
def get_funcionarios_empresa(empresa_id: int, db: Session = Depends(get_db)):
    return db.query(Funcionario).filter(Funcionario.empresa_id == empresa_id).all()

@app.patch("/funcionarios/{funcionario_id}")
def update_funcionario(funcionario_id: int, f: FuncionarioUpdate, db: Session = Depends(get_db)):
    db_func = db.query(Funcionario).filter(Funcionario.id == funcionario_id).first()
    if not db_func:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")
    
    update_data = f.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_func, key, value)
    
    try:
        db.commit()
        db.refresh(db_func)
        return db_func
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar funcionário: {str(e)}")

@app.delete("/funcionarios/{funcionario_id}")
def delete_funcionario(funcionario_id: int, db: Session = Depends(get_db)):
    db_func = db.query(Funcionario).filter(Funcionario.id == funcionario_id).first()
    if not db_func:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")
    
    try:
        # 1. Desatribuir chamados vinculados a este funcionário (atribuido_a_id)
        db.query(Chamado).filter(Chamado.atribuido_a_id == funcionario_id).update({Chamado.atribuido_a_id: None})
        
        # 2. Lidar com chamados onde ele é o solicitante (opcional, mas evita erros se houver restrição)
        # Se o banco não permitir solicitante_id nulo, talvez devêssemos impedir a exclusão 
        # ou atribuir a um usuário "Excluído/Anônimo".
        # Por enquanto, vamos apenas tentar excluir o funcionário, pois o erro relatado foi no atribuido_a_id.
        
        db.delete(db_func)
        db.commit()
        return {"success": True, "message": "Funcionário excluído com sucesso"}
    except Exception as e:
        db.rollback()
        print(f"Erro ao excluir funcionário: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao excluir funcionário: {str(e)}")

@app.post("/funcionarios")
def create_funcionario(f: FuncionarioCreate, db: Session = Depends(get_db)):
    # 1. Verificar se o e-mail já existe
    existing_email = db.query(Funcionario).filter(Funcionario.email == f.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Este e-mail já está em uso")
    
    # 2. Gerar login único de 8 números
    login_gerado = generate_unique_login(db)
    
    # 3. Gerar senha a partir dos 6 primeiros números do CPF
    senha_gerada = extract_password_from_cpf(f.cpf)
    
    try:
        novo = Funcionario(
            empresa_id=f.empresa_id,
            nome=f.nome,
            cpf=f.cpf,
            email=f.email,
            telefone=f.telefone,
            cargo=f.cargo,
            setor=f.setor,
            nivel=f.nivel,
            permissao=f.permissao or "usuario",
            login=login_gerado,
            senha=senha_gerada
        )
        db.add(novo)
        db.commit()
        db.refresh(novo)
        
        # 4. Enviar e-mail real com informações de acesso
        enviado = send_real_email(
            f.email, 
            login_gerado
        )
        
        return {
            "success": True,
            "funcionario": novo,
            "email_enviado": enviado
        }
    except Exception as ex:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao cadastrar funcionário: {str(ex)}")

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
