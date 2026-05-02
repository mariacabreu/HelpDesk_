import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def test_smtp_robust():
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
    to_email = "joaoo.oliveira000@gmail.com"

    print(f"--- INICIANDO TESTE SMTP ROBUSTO ---")
    print(f"Servidor: {smtp_server}:{smtp_port}")
    print(f"Usuário: {smtp_user}")
    
    msg = MIMEMultipart()
    msg["Subject"] = "Teste de SMTP SwiftDesk - Diagnóstico"
    msg["From"] = f"SwiftDesk Support <{smtp_user}>"
    msg["To"] = to_email
    msg.attach(MIMEText("Este é um teste de diagnóstico para validar a conexão SMTP.", "plain"))

    try:
        # 1. Conexão inicial com timeout longo
        print("1. Conectando ao servidor...")
        server = smtplib.SMTP(smtp_server, smtp_port, timeout=30)
        server.set_debuglevel(1)
        
        # 2. Primeiro EHLO
        print("2. Enviando primeiro EHLO...")
        server.ehlo()
        
        # 3. STARTTLS
        if smtp_port == 587:
            print("3. Iniciando STARTTLS...")
            server.starttls()
            # 4. Segundo EHLO (obrigatório após STARTTLS)
            print("4. Enviando segundo EHLO...")
            server.ehlo()
        
        # 5. Login
        print(f"5. Tentando login...")
        server.login(smtp_user, smtp_password)
        
        # 6. Envio
        print(f"6. Enviando e-mail para {to_email}...")
        server.sendmail(smtp_user, to_email, msg.as_string())
        
        # 7. Quit
        server.quit()
        print("\n✅ SUCESSO ABSOLUTO: O e-mail foi enviado e aceito pelo servidor!")
        return True
    except smtplib.SMTPAuthenticationError:
        print("\n❌ ERRO DE AUTENTICAÇÃO: A senha ou o usuário estão incorretos.")
        print("DICA: Se for Gmail, use uma 'Senha de App' de 16 dígitos.")
    except Exception as e:
        print(f"\n❌ ERRO INESPERADO: {repr(e)}")
    return False

if __name__ == "__main__":
    test_smtp_robust()
