from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship, sessionmaker, declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class StatusChamado(enum.Enum):
    aberto = "aberto"
    em_atendimento = "em_atendimento"
    aguardando_solicitante = "aguardando_solicitante"
    aguardando_terceiro = "aguardando_terceiro"
    pendente = "pendente"
    escalado = "escalado"
    escalonamento_aprovado = "escalonamento_aprovado"
    resolvido = "resolvido"
    fechado = "fechado"
    cancelado = "cancelado"

class Prioridade(enum.Enum):
    baixa = "baixa"
    media = "media"
    alta = "alta"


class Empresa(Base):
    __tablename__ = 'empresas'
    
    id = Column(Integer, primary_key=True)
    razao_social = Column(String(255), nullable=False)
    nome_fantasia = Column(String(255), nullable=False)
    cnpj = Column(String(18), unique=True, nullable=False)
    inscricao_estadual = Column(String(20))
    segmento = Column(String(100))
    
    # Contato
    nome_responsavel = Column(String(100))
    cargo_responsavel = Column(String(100))
    email = Column(String(100), unique=True)
    telefone = Column(String(20))
    
    # Endereço
    cep = Column(String(10))
    endereco = Column(String(255))
    cidade = Column(String(100))
    estado = Column(String(2))
    
    # Relacionamentos
    funcionarios = relationship("Funcionario", back_populates="empresa")
    equipamentos = relationship("Equipamento", back_populates="empresa")
    chamados = relationship("Chamado", back_populates="empresa")
    backups_sistema = relationship("BackupSistema", back_populates="empresa", cascade="all, delete-orphan")

class Funcionario(Base):
    __tablename__ = 'funcionarios'
    
    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'))
    nome = Column(String(100), nullable=False)
    cpf = Column(String(14), unique=True)
    email = Column(String(100), unique=True)
    telefone = Column(String(20))
    cargo = Column(String(100))
    setor = Column(String(100))
    nivel = Column(String(20)) # n1, n2, n3
    
    # Autenticação
    login = Column(String(50), unique=True, nullable=False)
    senha = Column(String(255), nullable=False) # Em produção usar hash
    permissao = Column(String(20), default="usuario") # admin, usuario
    status = Column(String(20), default="ativo") # ativo, inativo
    data_cadastro = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    empresa = relationship("Empresa", back_populates="funcionarios")
    chamados_solicitados = relationship("Chamado", foreign_keys="Chamado.solicitante_id", back_populates="solicitante")
    chamados_atribuidos = relationship("Chamado", foreign_keys="Chamado.atribuido_a_id", back_populates="atribuido_a")

class Equipamento(Base):
    __tablename__ = 'equipamentos'
    
    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'))
    nome = Column(String(100), nullable=False)
    patrimonio = Column(String(50), unique=True, nullable=False)
    tipo = Column(String(50)) # ex: Notebook, Desktop, Impressora
    marca = Column(String(50))
    modelo = Column(String(100))
    numero_serie = Column(String(100))
    status = Column(String(20), default="ativo") # ativo, inativo, manutenção
    especificacoes = Column(JSON, default={}) # Campo flexível para SO, RAM, HD, etc.
    
    # Relacionamentos
    empresa = relationship("Empresa", back_populates="equipamentos")
    chamados = relationship("Chamado", back_populates="equipamento")
    backups = relationship("BackupEquipamento", back_populates="equipamento", cascade="all, delete-orphan")

class BackupEquipamento(Base):
    __tablename__ = 'backups_equipamentos'
    
    id = Column(Integer, primary_key=True)
    equipamento_id = Column(Integer, ForeignKey('equipamentos.id'))
    data_inicio = Column(DateTime, default=datetime.utcnow)
    data_fim = Column(DateTime)
    status = Column(String(20), default="sucesso") # sucesso, falha, em_progresso
    tamanho_kb = Column(Integer)
    log = Column(Text)
    
    # Relacionamentos
    equipamento = relationship("Equipamento", back_populates="backups")

class BackupSistema(Base):
    __tablename__ = 'backups_sistema'
    
    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'))
    data_inicio = Column(DateTime, default=datetime.utcnow)
    data_fim = Column(DateTime)
    status = Column(String(20), default="sucesso") # sucesso, falha, em_progresso
    tamanho_kb = Column(Integer)
    tipo = Column(String(50), default="Completo") # Completo, Incremental
    log = Column(Text)
    
    # Relacionamentos
    empresa = relationship("Empresa", back_populates="backups_sistema")

class Chamado(Base):
    __tablename__ = 'chamados'
    
    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'))
    solicitante_id = Column(Integer, ForeignKey('funcionarios.id'))
    equipamento_id = Column(Integer, ForeignKey('equipamentos.id'), nullable=True)
    atribuido_a_id = Column(Integer, ForeignKey('funcionarios.id'), nullable=True)
    
    nome_solicitante = Column(String(100), nullable=True)
    email_solicitante = Column(String(100), nullable=True)
    
    titulo = Column(String(200), nullable=False)
    descricao = Column(Text, nullable=False)
    tipo = Column(String(50)) # ex: Incidente, Solicitação, Dúvida
    prioridade = Column(Enum(Prioridade), default=Prioridade.media)
    status = Column(Enum(StatusChamado), default=StatusChamado.aberto)
    escalonado_por_nivel = Column(String(20), nullable=True) # n1, n2
    
    data_abertura = Column(DateTime, default=datetime.utcnow)
    data_fechamento = Column(DateTime, nullable=True)
    
    # Relacionamentos
    empresa = relationship("Empresa", back_populates="chamados")
    solicitante = relationship("Funcionario", foreign_keys=[solicitante_id], back_populates="chamados_solicitados")
    atribuido_a = relationship("Funcionario", foreign_keys=[atribuido_a_id], back_populates="chamados_atribuidos")
    equipamento = relationship("Equipamento", back_populates="chamados")
    historico = relationship("HistoricoChamado", back_populates="chamado", cascade="all, delete-orphan")
    anexos = relationship("AnexoChamado", back_populates="chamado", cascade="all, delete-orphan")

class AnexoChamado(Base):
    __tablename__ = 'anexos_chamados'
    
    id = Column(Integer, primary_key=True)
    chamado_id = Column(Integer, ForeignKey('chamados.id'))
    nome_arquivo = Column(String(255), nullable=False)
    caminho_arquivo = Column(String(255), nullable=False)
    data_upload = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    chamado = relationship("Chamado", back_populates="anexos")

class HistoricoChamado(Base):
    __tablename__ = 'historico_chamados'
    
    id = Column(Integer, primary_key=True)
    chamado_id = Column(Integer, ForeignKey('chamados.id'))
    usuario_id = Column(Integer, ForeignKey('funcionarios.id'))
    acao = Column(Text, nullable=False)
    data = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    chamado = relationship("Chamado", back_populates="historico")
    usuario = relationship("Funcionario")

class Notificacao(Base):
    __tablename__ = 'notificacoes'
    
    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey('funcionarios.id'))
    mensagem = Column(Text, nullable=False)
    lida = Column(Integer, default=0)
    data = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    usuario = relationship("Funcionario")

class LogSistema(Base):
    __tablename__ = 'logs_sistema'
    
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    tipo = Column(String(20), nullable=False)
    modulo = Column(String(50), nullable=False)
    usuario_id = Column(Integer, ForeignKey('funcionarios.id'), nullable=True)
    usuario_nome = Column(String(100), nullable=True)
    acao = Column(Text, nullable=False)
    ip = Column(String(45), nullable=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'), nullable=True)
    
    # Relacionamentos
    usuario = relationship("Funcionario")
    empresa = relationship("Empresa")

class PasswordRecovery(Base):
    __tablename__ = 'password_recovery'
    
    id = Column(Integer, primary_key=True)
    email = Column(String(100), nullable=False)
    code = Column(String(5), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    used = Column(Integer, default=0) # 0 = não usado, 1 = usado

# Configuração do Banco de Dados
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Suporte para MySQL (Railway) ou SQLite (Local)
DATABASE_URL = os.getenv("DATABASE_URL")

# Log de depuração (Remover em produção se contiver dados sensíveis)
if DATABASE_URL:
    # Mostra a URL sem a senha para debug
    parts = DATABASE_URL.split('@')
    if len(parts) > 1:
        print(f"DEBUG: Conectando ao host: {parts[-1]}")
    else:
        print(f"DEBUG: DATABASE_URL detectada, mas formato parece inválido.")

if DATABASE_URL:
    # Limpa possíveis espaços ou quebras de linha que quebram o parse
    DATABASE_URL = DATABASE_URL.strip()
    
    # Garante que a URL use o driver pymysql para MySQL
    if DATABASE_URL.startswith("mysql://"):
        DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)
    # Remove qualquer lógica de Postgres/Supabase que possa causar conflito
    elif DATABASE_URL.startswith("postgres://") or DATABASE_URL.startswith("postgresql://"):
        print("AVISO: URL de PostgreSQL detectada, mas o projeto foi configurado para MySQL.")

if not DATABASE_URL:
    DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'helpdesk.db')}"

# Argumentos extras para o engine
engine_args = {}
if "sqlite" in DATABASE_URL:
    engine_args["connect_args"] = {"check_same_thread": False}
elif "mysql" in DATABASE_URL:
    # Configurações otimizadas para MySQL no Railway
    engine_args["pool_size"] = 5
    engine_args["max_overflow"] = 10
    engine_args["pool_timeout"] = 30
    engine_args["pool_recycle"] = 3600
    engine_args["pool_pre_ping"] = True

engine = create_engine(
    DATABASE_URL,
    **engine_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Banco de dados inicializado com sucesso!")
    except Exception as e:
        print(f"❌ ERRO CRÍTICO NO BANCO DE DADOS: {str(e)}")
        # Não levantamos a exceção aqui para evitar que o gunicorn morra no boot
        # Isso permite ver o erro nos logs do Render com o app "rodando"
        pass

if __name__ == "__main__":
    init_db()
