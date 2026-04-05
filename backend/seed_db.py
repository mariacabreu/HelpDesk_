from database import SessionLocal, Empresa, Funcionario, Equipamento, Chamado, StatusChamado, Prioridade, init_db
from datetime import datetime, timezone

def seed():
    # Inicializar o banco de dados (criar tabelas se não existirem)
    init_db()
    
    session = SessionLocal()
    
    try:
        # Verificar se já existem dados para evitar duplicidade
        if session.query(Empresa).first():
            print("Banco de dados já contém dados. Pulando seed...")
            return

        # 1. Criar uma Empresa
        empresa = Empresa(
            razao_social="Tech Solutions Ltda",
            nome_fantasia="Tech Solutions",
            cnpj="12.345.678/0001-90",
            segmento="Tecnologia",
            nome_responsavel="Carlos Oliveira",
            cargo_responsavel="Gerente de TI",
            email="carlos@techsolutions.com",
            telefone="(11) 98765-4321",
            cep="01234-567",
            endereco="Av. Paulista, 1000",
            cidade="São Paulo",
            estado="SP"
        )
        session.add(empresa)
        session.commit()
        session.refresh(empresa)

        # 2. Criar Funcionários
        func1 = Funcionario(
            empresa_id=empresa.id,
            nome="João Silva",
            cpf="123.456.789-00",
            email="joao@techsolutions.com",
            telefone="(11) 99999-8888",
            cargo="Analista de Suporte",
            setor="Manutenção de computadores",
            login="joao.silva",
            senha="password123" # Em produção use hash!
        )
        
        func2 = Funcionario(
            empresa_id=empresa.id,
            nome="Maria Souza",
            cpf="987.654.321-11",
            email="maria@techsolutions.com",
            telefone="(11) 97777-6666",
            cargo="Desenvolvedora Senior",
            setor="Desenvolvedor Full Stack",
            login="maria.souza",
            senha="password456"
        )
        session.add_all([func1, func2])
        session.commit()

        # 3. Criar Equipamentos
        equip1 = Equipamento(
            empresa_id=empresa.id,
            nome="Notebook Dell Latitude 3420",
            patrimonio="NB-001",
            tipo="Notebook",
            marca="Dell",
            modelo="Latitude 3420",
            numero_serie="ABC123XYZ",
            status="ativo"
        )
        
        equip2 = Equipamento(
            empresa_id=empresa.id,
            nome="Monitor LG 24\"",
            patrimonio="MON-001",
            tipo="Monitor",
            marca="LG",
            modelo="24MK430H",
            numero_serie="LG789ABC",
            status="ativo"
        )
        session.add_all([equip1, equip2])
        session.commit()

        # 4. Criar Chamados
        chamado1 = Chamado(
            empresa_id=empresa.id,
            solicitante_id=func1.id,
            equipamento_id=equip1.id,
            titulo="Notebook não liga",
            descricao="O notebook parou de ligar após a última atualização do Windows.",
            tipo="Incidente",
            prioridade=Prioridade.ALTA,
            status=StatusChamado.ABERTO,
            data_abertura=datetime.now(timezone.utc)
        )
        
        chamado2 = Chamado(
            empresa_id=empresa.id,
            solicitante_id=func2.id,
            titulo="Solicitação de novo software",
            descricao="Solicito a instalação do Docker Desktop para desenvolvimento.",
            tipo="Solicitação",
            prioridade=Prioridade.MEDIA,
            status=StatusChamado.EM_ATENDIMENTO,
            data_abertura=datetime.now(timezone.utc)
        )
        session.add_all([chamado1, chamado2])
        session.commit()

        print("Dados de exemplo inseridos com sucesso!")
        
    except Exception as e:
        session.rollback()
        print(f"Erro ao inserir dados: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    seed()
