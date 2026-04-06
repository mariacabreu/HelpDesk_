from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship, sessionmaker, declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class StatusChamado(enum.Enum):
    ABERTO = "aberto"
    EM_ATENDIMENTO = "em_atendimento"
    AGUARDANDO_TERCEIRO = "aguardando_terceiro"
    PENDENTE = "pendente"
    RESOLVIDO = "resolvido"
    FECHADO = "fechado"
    CANCELADO = "cancelado"

class Prioridade(enum.Enum):
    BAIXA = "baixa"
    MEDIA = "media"
    ALTA = "alta"
    CRITICA = "critica"

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
    
    # Relacionamentos
    empresa = relationship("Empresa", back_populates="equipamentos")
    chamados = relationship("Chamado", back_populates="equipamento")

class Chamado(Base):
    __tablename__ = 'chamados'
    
    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'))
    solicitante_id = Column(Integer, ForeignKey('funcionarios.id'))
    equipamento_id = Column(Integer, ForeignKey('equipamentos.id'), nullable=True)
    atribuido_a_id = Column(Integer, ForeignKey('funcionarios.id'), nullable=True)
    
    titulo = Column(String(200), nullable=False)
    descricao = Column(Text, nullable=False)
    tipo = Column(String(50)) # ex: Incidente, Solicitação, Dúvida
    prioridade = Column(String(50), default="media")
    status = Column(String(50), default="aberto")
    escalonado_por_nivel = Column(String(20), nullable=True) # n1, n2
    
    data_abertura = Column(DateTime, default=datetime.utcnow)
    data_fechamento = Column(DateTime, nullable=True)
    
    # Relacionamentos
    empresa = relationship("Empresa", back_populates="chamados")
    solicitante = relationship("Funcionario", foreign_keys=[solicitante_id], back_populates="chamados_solicitados")
    atribuido_a = relationship("Funcionario", foreign_keys=[atribuido_a_id], back_populates="chamados_atribuidos")
    equipamento = relationship("Equipamento", back_populates="chamados")
    historico = relationship("HistoricoChamado", back_populates="chamado", cascade="all, delete-orphan")

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
    lida = Column(Integer, default=0) # 0 para não lida, 1 para lida
    data = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    usuario = relationship("Funcionario")

# Configuração do Banco de Dados
DATABASE_URL = "mysql+pymysql://root@localhost/helpdesk"
engine = create_engine(
    DATABASE_URL,
    pool_recycle=3600,
    pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
    print("Banco de dados inicializado com sucesso!")

if __name__ == "__main__":
    init_db()
