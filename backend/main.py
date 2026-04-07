from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal, Funcionario, Empresa, Chamado, StatusChamado, Prioridade, Equipamento, Notificacao, LogSistema
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

@app.get("/cep/{cep}")
def buscar_cep(cep: str):
    import requests
    # Limpar o CEP
    cep = cep.replace("-", "").replace(".", "").strip()
    
    if len(cep) != 8:
        raise HTTPException(status_code=400, detail="CEP inválido. Deve conter 8 dígitos.")
        
    url = f"https://viacep.com.br/ws/{cep}/json/"
    try:
        response = requests.get(url)
        if response.status_code != 200:
            return {"erro": "Erro ao buscar CEP"}
        
        data = response.json()
        if "erro" in data:
            return {"erro": "CEP não encontrado"}
            
        return {
            "logradouro": data.get("logradouro"),
            "bairro": data.get("bairro"),
            "localidade": data.get("localidade"),
            "uf": data.get("uf")
        }
    except Exception as e:
        print(f"Erro ao consultar ViaCEP: {e}")
        return {"erro": "Erro de conexão com serviço de CEP"}

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    print(f"ERRO DE VALIDAÇÃO: {errors}")
    return JSONResponse(
        status_code=422,
        content={"detail": errors},
    )

def registrar_log(db: Session, tipo: str, modulo: str, acao: str, usuario_id: int = None, usuario_nome: str = None, empresa_id: int = None, ip: str = None):
    try:
        novo_log = LogSistema(
            tipo=tipo,
            modulo=modulo,
            acao=acao,
            usuario_id=usuario_id,
            usuario_nome=usuario_nome,
            empresa_id=empresa_id,
            ip=ip
        )
        db.add(novo_log)
        db.commit()
    except Exception as e:
        print(f"Erro ao registrar log: {e}")
        db.rollback()

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
    nome_solicitante: str | None = None
    email_solicitante: str | None = None
    equipamento_id: int | None = None
    atribuido_a_id: int | None = None # Nova coluna para atribuição direta
    titulo: str
    descricao: str
    tipo: str
    prioridade: str

class ChamadoUpdate(BaseModel):
    titulo: str | None = None
    descricao: str | None = None
    tipo: str | None = None
    prioridade: str | None = None
    status: str | None = None
    atribuido_a_id: int | None = None
    escalonado_por_nivel: str | None = None
    usuario_acao_id: int | None = None # ID de quem está realizando a ação

class HistoricoCreate(BaseModel):
    usuario_id: int
    acao: str

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
def login(request: LoginRequest, req: Request, db: Session = Depends(get_db)):
    # Buscar o funcionário pelo login
    user = db.query(Funcionario).filter(Funcionario.login == request.login).first()
    
    if not user or user.senha != request.password:
        # Log de tentativa de acesso falha
        registrar_log(db, "error", "Autenticação", f"Tentativa de login falha para o usuário: {request.login}", ip=req.client.host)
        raise HTTPException(status_code=401, detail="Login ou senha incorretos")
    
    # Log de login com sucesso
    registrar_log(db, "info", "Autenticação", "Login realizado com sucesso", usuario_id=user.id, usuario_nome=user.nome, empresa_id=user.empresa_id, ip=req.client.host)
    
    # Debug: Print user data to server console
    print(f"DEBUG LOGIN: User {user.nome} logged in. Login field value: '{user.login}'")
    
    # Determinar o papel do usuário (role) baseado no cargo
    # Exemplo: Se o cargo contém "Suporte" ou "Analista de Sistemas", é Suporte
    role = "suporte"
    user_cargo = user.cargo or ""
    if any(keyword in user_cargo for keyword in ["Desenvolvedora", "Diretor", "Empresa"]):
        role = "empresa"
    
    # Buscar informações da empresa do funcionário
    empresa = db.query(Empresa).filter(Empresa.id == user.empresa_id).first()
    
    return {
        "id": user.id,
        "nome": user.nome,
        "email": user.email,
        "cargo": user.cargo,
        "setor": user.setor,
        "login": user.login,
        "nivel": user.nivel,
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

@app.get("/logs")
def get_logs(empresa_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(LogSistema)
    if empresa_id:
        query = query.filter(LogSistema.empresa_id == empresa_id)
    
    logs = query.order_by(LogSistema.timestamp.desc()).all()
    return logs

@app.post("/chamados")
def create_chamado(chamado: ChamadoCreate, db: Session = Depends(get_db)):
    try:
        # Converter string de prioridade para o Enum correspondente
        prioridade_map = {
            "baixa": Prioridade.baixa,
            "media": Prioridade.media,
            "alta": Prioridade.alta,
            "critica": Prioridade.critica
        }
        
        atribuido_id = chamado.atribuido_a_id
        
        # Lógica de atribuição automática aleatória (obrigatória se não houver atribuição direta)
        if atribuido_id is None or atribuido_id == -1:
            # Buscar todos os funcionários de suporte com o nível correspondente à prioridade
            # Por padrão, novos chamados vão para N1, a menos que a prioridade dite o contrário
            nivel_alvo = "n1"
            if chamado.prioridade.lower() == "media": nivel_alvo = "n2"
            if chamado.prioridade.lower() == "alta": nivel_alvo = "n3"
            if chamado.prioridade.lower() == "critica": nivel_alvo = "n3"
            
            # Busca suporte técnico (analistas) que tenham o nível
            suportes = db.query(Funcionario).filter(
                Funcionario.nivel == nivel_alvo,
                Funcionario.status == "ativo"
            ).all()
            
            if suportes:
                atribuido_id = random.choice(suportes).id
            else:
                # Se não achar no nível alvo, tenta N1 como fallback
                if nivel_alvo != "n1":
                    suportes_n1 = db.query(Funcionario).filter(Funcionario.nivel == "n1", Funcionario.status == "ativo").all()
                    if suportes_n1:
                        atribuido_id = random.choice(suportes_n1).id
                    else:
                        atribuido_id = None
                else:
                    atribuido_id = None

        db_chamado = Chamado(
            empresa_id=chamado.empresa_id,
            solicitante_id=chamado.solicitante_id,
            nome_solicitante=chamado.nome_solicitante,
            email_solicitante=chamado.email_solicitante,
            equipamento_id=chamado.equipamento_id if chamado.equipamento_id and chamado.equipamento_id > 0 else None,
            atribuido_a_id=atribuido_id if atribuido_id and atribuido_id > 0 else None,
            titulo=chamado.titulo,
            descricao=chamado.descricao,
            tipo=chamado.tipo,
            prioridade=Prioridade(chamado.prioridade.lower()),
            status=StatusChamado.aberto if not atribuido_id else StatusChamado.em_atendimento
        )
        db.add(db_chamado)
        db.flush() # Para gerar o ID do chamado antes das notificações
        
        # Obter o nome do solicitante para as notificações e logs
        solicitante_nome = chamado.nome_solicitante
        if not solicitante_nome:
            sol_user = db.query(Funcionario).filter(Funcionario.id == db_chamado.solicitante_id).first()
            if sol_user:
                solicitante_nome = sol_user.nome
            else:
                solicitante_nome = "Usuário Desconhecido"

        # Notificar solicitante (confirmação)
        notif_sol = Notificacao(
            usuario_id=db_chamado.solicitante_id,
            mensagem=f"Seu chamado CH-{db_chamado.id} foi aberto com sucesso: {chamado.titulo}"
        )
        db.add(notif_sol)

        # Notificar gestores da empresa (role empresa)
        gestores = db.query(Funcionario).filter(
            Funcionario.empresa_id == db_chamado.empresa_id,
            Funcionario.cargo.in_(["Empresa", "Diretor", "Desenvolvedora"])
        ).all()
        for g in gestores:
            if g.id != db_chamado.solicitante_id:
                db.add(Notificacao(
                    usuario_id=g.id,
                    mensagem=f"Novo chamado CH-{db_chamado.id} aberto por {solicitante_nome}: {chamado.titulo}"
                ))

        # Notificar se atribuído
        if atribuido_id and atribuido_id > 0:
            notif = Notificacao(
                usuario_id=atribuido_id,
                mensagem=f"Novo chamado CH-{db_chamado.id} atribuído a você: {chamado.titulo}"
            )
            db.add(notif)
            
        db.commit()
        db.refresh(db_chamado)
        
        # Log de criação de chamado
        registrar_log(db, "success", "Chamados", f"Novo chamado CH-{db_chamado.id} criado: {db_chamado.titulo}", usuario_id=db_chamado.solicitante_id, usuario_nome=solicitante_nome, empresa_id=db_chamado.empresa_id)
        
        return format_chamado(db_chamado)
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
        
        # Log de criação de equipamento
        registrar_log(db, "success", "Equipamentos", f"Novo equipamento cadastrado: {novo.nome} (Patrimônio: {novo.patrimonio})", empresa_id=novo.empresa_id)
        
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

def format_chamado(c: Chamado):
    return {
        "id": c.id,
        "empresa_id": c.empresa_id,
        "solicitante_id": c.solicitante_id,
        "equipamento_id": c.equipamento_id,
        "atribuido_a_id": c.atribuido_a_id,
        "nome_solicitante": c.nome_solicitante,
        "email_solicitante": c.email_solicitante,
        "titulo": c.titulo,
        "descricao": c.descricao,
        "tipo": c.tipo,
        "prioridade": str(c.prioridade.value) if hasattr(c.prioridade, 'value') else str(c.prioridade),
        "status": str(c.status.value) if hasattr(c.status, 'value') else str(c.status),
        "escalonado_por_nivel": c.escalonado_por_nivel,
        "data_abertura": c.data_abertura,
        "data_fechamento": c.data_fechamento,
        "empresa_nome": c.empresa.nome_fantasia if c.empresa else None,
        "solicitante_nome": c.solicitante.nome if c.solicitante else None,
        "solicitante_nivel": c.solicitante.nivel if c.solicitante else None,
        "atribuido_a_nome": c.atribuido_a.nome if c.atribuido_a else None,
        "atribuido_a_nivel": c.atribuido_a.nivel if c.atribuido_a else None,
        "equipamento_nome": c.equipamento.nome if c.equipamento else None,
        "equipamento_patrimonio": c.equipamento.patrimonio if c.equipamento else None,
        "historico": [
            {
                "id": h.id,
                "acao": h.acao,
                "data": h.data,
                "usuario": h.usuario.nome if h.usuario else "Sistema"
            } for h in (c.historico or [])
        ]
    }

@app.get("/chamados")
def get_all_chamados(db: Session = Depends(get_db)):
    chamados = db.query(Chamado).all()
    return [format_chamado(c) for c in chamados]

@app.get("/chamados/atribuido/{tecnico_id}")
def get_chamados_atribuido(tecnico_id: int, db: Session = Depends(get_db)):
    chamados = db.query(Chamado).filter(Chamado.atribuido_a_id == tecnico_id).all()
    return [format_chamado(c) for c in chamados]

@app.get("/chamados/escalados-disponiveis/{nivel}")
def get_escalados_disponiveis(nivel: str, db: Session = Depends(get_db)):
    nivel = nivel.lower()
    
    # Query base: chamados sem técnico e que não estão finalizados
    # IMPORTANTE: Filtrar pelo valor da string no banco para evitar problemas de comparação com Enum
    query = db.query(Chamado).filter(
        Chamado.atribuido_a_id == None,
        Chamado.status.notin_(["resolvido", "fechado", "cancelado"])
    )
    
    if nivel == "n2":
        # N2 vê escalados por N1
        chamados = query.filter(
            (Chamado.escalonado_por_nivel == "n1") |
            ((Chamado.escalonado_por_nivel == None) & (Chamado.prioridade == "media"))
        ).all()
    elif nivel == "n3":
        # N3 vê escalados por N2 ou redistribuídos por N3
        chamados = query.filter(
            (Chamado.escalonado_por_nivel.in_(["n2", "n3"])) |
            ((Chamado.escalonado_por_nivel == None) & (Chamado.prioridade.in_(["alta", "critica"])))
        ).all()
    else:
        # N1 vê apenas o que ele mesmo escalonou
        chamados = query.filter(Chamado.escalonado_por_nivel == "n1").all()
    
    return [format_chamado(c) for c in chamados]

@app.patch("/chamados/{chamado_id}")
def update_chamado(chamado_id: int, c_update: ChamadoUpdate, db: Session = Depends(get_db)):
    from database import HistoricoChamado
    db_chamado = db.query(Chamado).filter(Chamado.id == chamado_id).first()
    if not db_chamado:
        raise HTTPException(status_code=404, detail="Chamado não encontrado")
    
    update_data = c_update.dict(exclude_unset=True)
    
    # Mapear strings de prioridade e status para Enums
    for key, value in update_data.items():
        if key == "prioridade" and value:
            db_chamado.prioridade = Prioridade(value.lower())
        elif key == "status" and value:
            old_status_val = db_chamado.status.value if hasattr(db_chamado.status, 'value') else str(db_chamado.status)
            new_status_val = value.lower()
            
            db_chamado.status = StatusChamado(new_status_val)
            
            # Registrar no histórico se o status mudou
            if old_status_val != new_status_val:
                acao = f"Status alterado de {old_status_val} para {new_status_val}"
                if new_status_val == "aberto" and old_status_val in ["fechado", "resolvido", "cancelado"]:
                    acao = "Chamado reaberto"
                
                db.add(HistoricoChamado(
                    chamado_id=chamado_id,
                    acao=acao
                ))

            if new_status_val in ["resolvido", "fechado", "cancelado"]:
                db_chamado.data_fechamento = datetime.utcnow()
            else:
                db_chamado.data_fechamento = None

            # Notificar solicitante
            db.add(Notificacao(
                usuario_id=db_chamado.solicitante_id,
                mensagem=f"Status do chamado CH-{db_chamado.id} alterado para {new_status_val}"
            ))
            
        elif key == "escalonado_por_nivel" and value:
            current_nivel = value.lower()
            next_nivel = "n2"
            if current_nivel == "n1": next_nivel = "n2"
            elif current_nivel == "n2": next_nivel = "n3"
            elif current_nivel == "n3": next_nivel = "n3"
            
            # Tentar obter o ID do usuário que está escalonando (pode vir no update_data ou ser o atribuído atual)
            escalador_id = update_data.get("usuario_acao_id") or db_chamado.atribuido_a_id

            # Quando escalonamos, resetamos a atribuição para voltar ao pool
            if "atribuido_a_id" not in update_data:
                db_chamado.atribuido_a_id = None
            
            # Usar strings diretas para o banco de dados se o Enum der conflito
            db_chamado.status = "escalado"
            db_chamado.escalonado_por_nivel = current_nivel
            
            # Notificar técnicos do próximo nível
            suportes_next = db.query(Funcionario).filter(
                Funcionario.nivel == next_nivel,
                Funcionario.status == "ativo"
            ).all()
            for s in suportes_next:
                db.add(Notificacao(
                    usuario_id=s.id,
                    mensagem=f"Chamado CH-{db_chamado.id} escalonado para o pool {next_nivel.upper()}"
                ))
            
            db.add(HistoricoChamado(
                chamado_id=chamado_id,
                usuario_id=escalador_id,
                acao=f"Chamado escalonado do nível {current_nivel.upper()} para {next_nivel.upper()}"
            ))
            
        elif key == "atribuido_a_id":
            old_atribuido = db_chamado.atribuido_a_id
            db_chamado.atribuido_a_id = value
            
            # Se estava escalado e foi assumido
            if str(db_chamado.status) == "escalado" and value:
                db_chamado.status = "escalonamento_aprovado"
            elif not db_chamado.escalonado_por_nivel and value:
                db_chamado.status = "em_atendimento"
                
            if old_atribuido != value:
                novo_tecnico = db.query(Funcionario).filter(Funcionario.id == value).first()
                tecnico_nome = novo_tecnico.nome if novo_tecnico else "Pool"
                acao = f"Chamado atribuído a {tecnico_nome}"
                if db_chamado.status == StatusChamado.escalonamento_aprovado:
                    acao = f"Escalonamento aceito por {tecnico_nome}"
                
                db.add(HistoricoChamado(
                    chamado_id=chamado_id,
                    acao=acao
                ))
                
                db.add(Notificacao(
                    usuario_id=value,
                    mensagem=f"O chamado CH-{db_chamado.id} foi atribuído a você."
                ))
                
                # Notificar o solicitante
                db.add(Notificacao(
                    usuario_id=db_chamado.solicitante_id,
                    mensagem=f"Seu chamado CH-{db_chamado.id} agora tem um responsável técnico."
                ))
        else:
            setattr(db_chamado, key, value)
    
    try:
        db.commit()
        db.refresh(db_chamado)
        
        # Log de atualização de chamado
        usuario_acao_id = c_update.usuario_acao_id
        usuario_acao_nome = "Sistema"
        if usuario_acao_id:
            user_acao = db.query(Funcionario).filter(Funcionario.id == usuario_acao_id).first()
            if user_acao:
                usuario_acao_nome = user_acao.nome
        
        registrar_log(db, "info", "Chamados", f"Chamado CH-{db_chamado.id} atualizado", usuario_id=usuario_acao_id, usuario_nome=usuario_acao_nome, empresa_id=db_chamado.empresa_id)
        
        return format_chamado(db_chamado)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar chamado: {str(e)}")

@app.get("/chamados/empresa/{empresa_id}")
def get_chamados_empresa(empresa_id: int, db: Session = Depends(get_db)):
    chamados = db.query(Chamado).filter(Chamado.empresa_id == empresa_id).all()
    return [format_chamado(c) for c in chamados]

@app.get("/chamados/solicitante/{solicitante_id}")
def get_chamados_solicitante(solicitante_id: int, db: Session = Depends(get_db)):
    chamados = db.query(Chamado).filter(Chamado.solicitante_id == solicitante_id).all()
    return [format_chamado(c) for c in chamados]

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
        
        # Log de atualização de funcionário
        registrar_log(db, "info", "Funcionários", f"Dados do funcionário {db_func.nome} atualizados", empresa_id=db_func.empresa_id)
        
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
        # Log de exclusão
        registrar_log(db, "warning", "Funcionários", f"Funcionário {db_func.nome} excluído do sistema", empresa_id=db_func.empresa_id)
        
        db.delete(db_func)
        db.commit()
        return {"success": True, "message": "Funcionário excluído com sucesso"}
    except Exception as e:
        db.rollback()
        print(f"Erro ao excluir funcionário: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao excluir funcionário: {str(e)}")

@app.post("/funcionarios")
def create_funcionario(funcionario: FuncionarioCreate, db: Session = Depends(get_db)):
    try:
        # Gerar login de 8 dígitos aleatórios
        login_gerado = ''.join([str(random.randint(0, 9)) for _ in range(8)])
        
        # Garantir que o login seja único
        while db.query(Funcionario).filter(Funcionario.login == login_gerado).first():
            login_gerado = ''.join([str(random.randint(0, 9)) for _ in range(8)])
            
        # Senha inicial: 6 primeiros dígitos do CPF (removendo pontos e traço)
        senha_inicial = funcionario.cpf.replace(".", "").replace("-", "")[:6]
        
        db_funcionario = Funcionario(
            empresa_id=funcionario.empresa_id,
            nome=funcionario.nome,
            cpf=funcionario.cpf,
            email=funcionario.email,
            telefone=funcionario.telefone,
            cargo=funcionario.cargo,
            setor=funcionario.setor,
            nivel=funcionario.nivel,
            permissao=funcionario.permissao,
            login=login_gerado,
            senha=senha_inicial
        )
        db.add(db_funcionario)
        db.commit()
        db.refresh(db_funcionario)
        
        # Retornar o funcionário com o login gerado explicitamente
        return {
            "id": db_funcionario.id,
            "nome": db_funcionario.nome,
            "login": db_funcionario.login,
            "email": db_funcionario.email,
            "senha": senha_inicial, # Apenas para o primeiro cadastro
            "email_enviado": True # Simulação
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats/suporte")
def get_stats_suporte(tecnico_id: int | None = None, db: Session = Depends(get_db)):
    from sqlalchemy import func
    from database import Chamado, HistoricoChamado
    
    # Filtro base para estatísticas globais (para os cards de cima)
    total_abertos = db.query(func.count(Chamado.id)).filter(Chamado.status == "aberto").scalar() or 0
    total_em_andamento = db.query(func.count(Chamado.id)).filter(Chamado.status == "em_atendimento").scalar() or 0
    total_resolvidos = db.query(func.count(Chamado.id)).filter(Chamado.status.in_(["resolvido", "fechado"])).scalar() or 0
    total_chamados = db.query(func.count(Chamado.id)).scalar() or 1
    
    # Cálculo de % Escalonados
    total_escalados = db.query(func.count(Chamado.id)).filter(Chamado.status == "escalado").scalar() or 0
    perc_escalados = round((total_escalados / total_chamados) * 100) if total_chamados > 0 else 0
    
    # Cálculo de % SLA Cumprido (exemplo: resolvido em menos de 24h)
    # Para simplificar, vamos considerar que todos os resolvidos cumpriram SLA por enquanto,
    # ou buscar os que têm data_fechamento - data_abertura < 24h
    resolvidos_no_sla = 0
    chamados_concluidos = db.query(Chamado).filter(Chamado.status.in_(["resolvido", "fechado"])).all()
    for c in chamados_concluidos:
        if c.data_fechamento and c.data_abertura:
            diff = c.data_fechamento - c.data_abertura
            if diff.total_seconds() < 86400: # 24 horas
                resolvidos_no_sla += 1
    
    perc_sla = round((resolvidos_no_sla / total_resolvidos) * 100) if total_resolvidos > 0 else 0
    
    # Chamados recentes com filtro de técnico
    query_recentes = db.query(Chamado)
    
    if tecnico_id:
        # Busca IDs de chamados que o técnico já interagiu (escalonou)
        ids_escalonados = db.query(HistoricoChamado.chamado_id).filter(
            HistoricoChamado.usuario_id == tecnico_id,
            HistoricoChamado.acao.like("%escalonado%")
        ).all()
        ids_escalonados = [id[0] for id in ids_escalonados]
        
        query_recentes = query_recentes.filter(
            (Chamado.atribuido_a_id == tecnico_id) |
            (Chamado.id.in_(ids_escalonados))
        )
    
    recentes = query_recentes.order_by(Chamado.data_abertura.desc()).limit(5).all()
    recentes_list = []
    for c in recentes:
        recentes_list.append({
            "id": c.id,
            "titulo": c.titulo,
            "empresa": c.empresa.nome_fantasia if c.empresa else "N/A",
            "nome_solicitante": c.nome_solicitante,
            "email_solicitante": c.email_solicitante,
            "solicitante_nome": c.solicitante.nome if c.solicitante else "N/A",
            "prioridade": c.prioridade.value if hasattr(c.prioridade, 'value') else c.prioridade,
            "status": c.status.value if hasattr(c.status, 'value') else c.status,
            "data_abertura": c.data_abertura
        })
    
    return {
        "abertos": total_abertos,
        "em_andamento": total_em_andamento,
        "resolvidos": total_resolvidos,
        "recentes": recentes_list,
        "perc_escalados": perc_escalados,
        "perc_sla": perc_sla
    }

@app.get("/stats/empresa/{empresa_id}")
def get_stats_empresa(empresa_id: int, db: Session = Depends(get_db)):
    from sqlalchemy import func
    from database import Equipamento, Funcionario, Chamado
    
    total_chamados = db.query(func.count(Chamado.id)).filter(Chamado.empresa_id == empresa_id).scalar()
    total_equipamentos = db.query(func.count(Equipamento.id)).filter(Equipamento.empresa_id == empresa_id).scalar()
    total_funcionarios = db.query(func.count(Funcionario.id)).filter(Funcionario.empresa_id == empresa_id).scalar()
    
    # Chamados ativos da empresa
    chamados_ativos = db.query(func.count(Chamado.id)).filter(
        Chamado.empresa_id == empresa_id,
        Chamado.status.in_(["aberto", "em_atendimento", "escalado", "pendente"])
    ).scalar()
    
    return {
        "chamados_ativos": chamados_ativos,
        "total_equipamentos": total_equipamentos,
        "total_funcionarios": total_funcionarios,
        "total_chamados": total_chamados
    }

@app.patch("/chamados/{chamado_id}/cancelar")
def cancelar_chamado(chamado_id: int, db: Session = Depends(get_db)):
    from database import HistoricoChamado
    chamado = db.query(Chamado).filter(Chamado.id == chamado_id).first()
    if not chamado:
        raise HTTPException(status_code=404, detail="Chamado não encontrado")
    
    current_status = chamado.status.value if hasattr(chamado.status, 'value') else chamado.status
    if current_status in ["fechado", "resolvido", "cancelado"]:
        return format_chamado(chamado)
        
    chamado.status = "cancelado"
    chamado.data_fechamento = datetime.utcnow()
    
    # Notificar o técnico se houver um atribuído
    if chamado.atribuido_a_id:
        notif = Notificacao(
            usuario_id=chamado.atribuido_a_id,
            mensagem=f"O chamado CH-{chamado.id} foi cancelado pelo solicitante."
        )
        db.add(notif)
        
    # Adicionar ao histórico
    hist = HistoricoChamado(
        chamado_id=chamado.id,
        usuario_id=chamado.solicitante_id, # Solicitante cancelou
        acao="Chamado cancelado pelo usuário"
    )
    db.add(hist)
    
    # Log de cancelamento de chamado
    # Log do cancelamento
    user_nome = "Sistema"
    user = db.query(Funcionario).filter(Funcionario.id == chamado.solicitante_id).first()
    if user:
        user_nome = user.nome
    
    registrar_log(db, "warning", "Chamados", f"Chamado CH-{chamado.id} cancelado pelo usuário", usuario_id=chamado.solicitante_id, usuario_nome=user_nome, empresa_id=chamado.empresa_id)
    
    db.commit()
    db.refresh(chamado)
    return format_chamado(chamado)

@app.post("/chamados/{chamado_id}/historico")
def add_historico(chamado_id: int, h: HistoricoCreate, db: Session = Depends(get_db)):
    from database import HistoricoChamado
    chamado = db.query(Chamado).filter(Chamado.id == chamado_id).first()
    if not chamado:
        raise HTTPException(status_code=404, detail="Chamado não encontrado")
    
    novo_h = HistoricoChamado(
        chamado_id=chamado_id,
        usuario_id=h.usuario_id,
        acao=h.acao
    )
    db.add(novo_h)
    
    # Notificar a outra parte
    # Se o autor do comentário for o solicitante ou gestor, notifica o técnico
    # Se o autor for o técnico, notifica o solicitante e gestores
    autor = db.query(Funcionario).filter(Funcionario.id == h.usuario_id).first()
    autor_nome = autor.nome if autor else "Alguém"
    
    # Se o autor for o técnico
    if h.usuario_id == chamado.atribuido_a_id:
        # Notificar solicitante
        db.add(Notificacao(
            usuario_id=chamado.solicitante_id,
            mensagem=f"Novo comentário no chamado CH-{chamado_id} de {autor_nome}: {h.acao[:50]}..."
        ))
        # Notificar gestores
        gestores = db.query(Funcionario).filter(
            Funcionario.empresa_id == chamado.empresa_id,
            Funcionario.cargo.in_(["Empresa", "Diretor", "Desenvolvedora"])
        ).all()
        for g in gestores:
            if g.id != chamado.solicitante_id and g.id != h.usuario_id:
                db.add(Notificacao(
                    usuario_id=g.id,
                    mensagem=f"Novo comentário no chamado CH-{chamado_id} de {autor_nome}: {h.acao[:50]}..."
                ))
    else:
        # Se o autor for o solicitante ou gestor, notificar o técnico
        if chamado.atribuido_a_id:
            db.add(Notificacao(
                usuario_id=chamado.atribuido_a_id,
                mensagem=f"Novo comentário no chamado CH-{chamado_id} de {autor_nome}: {h.acao[:50]}..."
            ))
            
    db.commit()
    db.refresh(novo_h)
    
    # Log de interação no chamado
    user_nome = "Sistema"
    user = db.query(Funcionario).filter(Funcionario.id == h.usuario_id).first()
    if user: user_nome = user.nome
    
    registrar_log(db, "info", "Chamados", f"Nova interação no chamado CH-{chamado.id}: {h.acao[:50]}...", usuario_id=h.usuario_id, usuario_nome=user_nome, empresa_id=chamado.empresa_id)
    
    return {
        "id": novo_h.id,
        "acao": novo_h.acao,
        "data": novo_h.data,
        "usuario": {
            "id": user.id if user else 0,
            "nome": user_nome
        }
    }

@app.get("/notificacoes/{usuario_id}")
def get_notificacoes(usuario_id: int, db: Session = Depends(get_db)):
    return db.query(Notificacao).filter(
        Notificacao.usuario_id == usuario_id,
        Notificacao.lida == 0
    ).order_by(Notificacao.data.desc()).all()

@app.patch("/notificacoes/ler-todas/{usuario_id}")
def ler_todas_notificacoes(usuario_id: int, db: Session = Depends(get_db)):
    db.query(Notificacao).filter(
        Notificacao.usuario_id == usuario_id,
        Notificacao.lida == 0
    ).update({"lida": 1})
    db.commit()
    return {"success": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
