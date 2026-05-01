import smtplib 
from email.mime.text import MIMEText 
import os
from dotenv import load_dotenv

load_dotenv()

# Teste direto com os dados do usuário
email_destino = "joaoo.oliveira000@gmail.com" # Altere para o seu e-mail se quiser testar
smtp_user = "helpdesk.seucadastro@gmail.com"
smtp_pass = "wjkplauqdiuicshm"

print(f"Iniciando teste de SMTP para {email_destino}...")

try:
    msg = MIMEText("Teste de envio isolado - HelpDesk") 
    msg["Subject"] = "Teste de SMTP" 
    msg["From"] = smtp_user 
    msg["To"] = email_destino 
    
    print("Conectando ao servidor smtp.gmail.com:587...")
    server = smtplib.SMTP("smtp.gmail.com", 587, local_hostname="localhost") 
    server.set_debuglevel(1)
    print("Enviando EHLO...")
    server.ehlo()
    print("Iniciando TLS...")
    server.starttls() 
    server.ehlo()
    print(f"Tentando login como {smtp_user}...")
    server.login(smtp_user, smtp_pass) 
    print("Enviando e-mail...")
    server.sendmail(smtp_user, email_destino, msg.as_string()) 
    server.quit() 
    print("\n✅ E-MAIL ENVIADO COM SUCESSO!")
except Exception as e:
    print(f"\n❌ ERRO NO ENVIO: {e}")
