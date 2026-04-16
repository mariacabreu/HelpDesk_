import sqlite3
conn = sqlite3.connect('helpdesk.db')
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(backups_sistema);")
print(cursor.fetchall())
conn.close()
