import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.lib.units import cm, inch
from reportlab.platypus import (
    Paragraph, Spacer, Table, TableStyle, PageBreak, Image
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.platypus import SimpleDocTemplate

# ========================
# Font Registration
# ========================
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))

registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# ========================
# Colors
# ========================
GREEN = colors.HexColor('#006233')
GOLD = colors.HexColor('#FFD700')
RED = colors.HexColor('#CE1126')
DARK_BLUE = colors.HexColor('#1F4E79')
LIGHT_GRAY = colors.HexColor('#F5F5F5')

# ========================
# Styles
# ========================
cover_title = ParagraphStyle(
    name='CoverTitle', fontName='SimHei', fontSize=36, leading=44,
    alignment=TA_CENTER, textColor=GREEN, spaceAfter=20
)
cover_subtitle = ParagraphStyle(
    name='CoverSubtitle', fontName='SimHei', fontSize=18, leading=26,
    alignment=TA_CENTER, textColor=colors.HexColor('#333333'), spaceAfter=12
)
cover_info = ParagraphStyle(
    name='CoverInfo', fontName='SimHei', fontSize=13, leading=20,
    alignment=TA_CENTER, textColor=colors.HexColor('#666666')
)
h1_style = ParagraphStyle(
    name='H1', fontName='SimHei', fontSize=18, leading=26,
    textColor=GREEN, spaceBefore=18, spaceAfter=12, wordWrap='CJK'
)
h2_style = ParagraphStyle(
    name='H2', fontName='SimHei', fontSize=14, leading=20,
    textColor=colors.HexColor('#333333'), spaceBefore=14, spaceAfter=8, wordWrap='CJK'
)
h3_style = ParagraphStyle(
    name='H3', fontName='SimHei', fontSize=12, leading=18,
    textColor=colors.HexColor('#555555'), spaceBefore=10, spaceAfter=6, wordWrap='CJK'
)
body_style = ParagraphStyle(
    name='Body', fontName='SimHei', fontSize=10.5, leading=18,
    alignment=TA_LEFT, spaceAfter=6, wordWrap='CJK'
)
code_style = ParagraphStyle(
    name='Code', fontName='DejaVuSans', fontSize=9, leading=14,
    alignment=TA_LEFT, textColor=colors.HexColor('#2d2d2d'),
    backColor=colors.HexColor('#f8f8f8'), leftIndent=12, rightIndent=12,
    spaceBefore=4, spaceAfter=4, wordWrap='CJK'
)
tbl_header = ParagraphStyle(
    name='TblHeader', fontName='SimHei', fontSize=10, leading=14,
    textColor=colors.white, alignment=TA_CENTER, wordWrap='CJK'
)
tbl_cell = ParagraphStyle(
    name='TblCell', fontName='SimHei', fontSize=9.5, leading=14,
    alignment=TA_CENTER, wordWrap='CJK'
)
tbl_cell_left = ParagraphStyle(
    name='TblCellLeft', fontName='SimHei', fontSize=9.5, leading=14,
    alignment=TA_LEFT, wordWrap='CJK'
)

# ========================
# TOC Template
# ========================
class TocDocTemplate(SimpleDocTemplate):
    def __init__(self, *args, **kwargs):
        SimpleDocTemplate.__init__(self, *args, **kwargs)
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            self.notify('TOCEntry', (level, text, self.page))

def add_heading(text, style, level=0):
    p = Paragraph(text, style)
    p.bookmark_name = text
    p.bookmark_level = level
    p.bookmark_text = text
    return p

def make_table(data, col_widths):
    t = Table(data, colWidths=col_widths)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), DARK_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        bg = colors.white if i % 2 == 1 else LIGHT_GRAY
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

# ========================
# Build Document
# ========================
output_path = '/home/z/my-project/download/Guide_Deploiement_Allo_Dakar.pdf'
doc = TocDocTemplate(
    output_path, pagesize=A4,
    leftMargin=2.2*cm, rightMargin=2.2*cm,
    topMargin=2*cm, bottomMargin=2*cm,
    title='Guide_Deploiement_Allo_Dakar',
    author='Z.ai', creator='Z.ai',
    subject='Guide de deploiement de l application Allô Dakar'
)

story = []

# ========================
# Cover Page
# ========================
story.append(Spacer(1, 80))

# Decorative line
cover_line_data = [['']]
cover_line = Table(cover_line_data, colWidths=[14*cm])
cover_line.setStyle(TableStyle([
    ('LINEABOVE', (0, 0), (-1, 0), 4, GREEN),
    ('LINEABOVE', (0, 0), (-1, 0), 1, GOLD),
    ('TOPPADDING', (0, 0), (-1, -1), 0),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
]))
story.append(cover_line)
story.append(Spacer(1, 40))

story.append(Paragraph('<b>Allô Dakar</b>', cover_title))
story.append(Spacer(1, 12))
story.append(Paragraph('<b>Guide de Déploiement</b>', cover_subtitle))
story.append(Paragraph('<b>Application Web et Mobile (PWA)</b>', cover_info))
story.append(Spacer(1, 60))

# Info box
info_data = [
    [Paragraph('<b>Version</b>', tbl_cell), Paragraph('1.0 - Phase Pilote', tbl_cell)],
    [Paragraph('<b>Framework</b>', tbl_cell), Paragraph('Next.js 16 + TypeScript', tbl_cell)],
    [Paragraph('<b>Base de données</b>', tbl_cell), Paragraph('Prisma + SQLite', tbl_cell)],
    [Paragraph('<b>Plateformes</b>', tbl_cell), Paragraph('Web, Android (PWA), iOS (PWA)', tbl_cell)],
    [Paragraph('<b>Routes pilotes</b>', tbl_cell), Paragraph('Thiès / Thiènaba / Dakar', tbl_cell)],
]
info_table = Table(info_data, colWidths=[4.5*cm, 9.5*cm])
info_table.setStyle(TableStyle([
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E0E0E0')),
    ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F0F7F4')),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 10),
    ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(info_table)
story.append(Spacer(1, 60))

# Bottom decorative line
story.append(cover_line)
story.append(Spacer(1, 12))
story.append(Paragraph('Mars 2026', cover_info))

story.append(PageBreak())

# ========================
# Table of Contents
# ========================
toc = TableOfContents()
toc.levelStyles = [
    ParagraphStyle(name='TOC1', fontSize=12, leftIndent=20, fontName='SimHei', leading=22, spaceBefore=6, wordWrap='CJK'),
    ParagraphStyle(name='TOC2', fontSize=10, leftIndent=40, fontName='SimHei', leading=18, spaceBefore=3, wordWrap='CJK'),
]
story.append(Paragraph('<b>Table des Matières</b>', ParagraphStyle(
    name='TOCTitle', fontName='SimHei', fontSize=20, leading=28, textColor=GREEN, alignment=TA_CENTER
)))
story.append(Spacer(1, 18))
story.append(toc)
story.append(PageBreak())

# ========================
# 1. Vue d'ensemble
# ========================
story.append(add_heading('<b>1. Vue d\'ensemble du projet</b>', h1_style, 0))

story.append(Paragraph(
    'Allô Dakar est une application de covoiturage conçue spécifiquement pour le marché sénégalais. '
    'Elle fonctionne à la fois comme une application web classique accessible via un navigateur, '
    'et comme une Progressive Web App (PWA) installable sur les téléphones Android et iOS. '
    'Cette double approche permet de couvrir l\'ensemble des utilisateurs sans nécessiter '
    'une publication sur les stores d\'applications, ce qui est particulièrement adapté pour '
    'la phase pilote qui se concentre sur les axes Thiès / Thiènaba et Dakar.',
    body_style
))
story.append(Spacer(1, 8))

story.append(add_heading('<b>1.1 Architecture technique</b>', h2_style, 1))
story.append(Paragraph(
    'L\'application repose sur une architecture moderne et éprouvée, parfaitement adaptée au déploiement '
    'en production. Le framework Next.js 16 avec le mode App Router offre des performances optimales '
    'grâce au rendu côté serveur (SSR) et à la compilation Ahead-of-Time (AOT). La gestion des données '
    'est assurée par Prisma ORM qui fournit une abstraction propre et type-safe sur la base de données SQLite. '
    'L\'interface utilisateur est construite avec le système de design shadcn/ui, garantissant une expérience '
    'cohérente et professionnelle sur tous les écrans.',
    body_style
))
story.append(Spacer(1, 12))

# Architecture table
arch_data = [
    [Paragraph('<b>Couche</b>', tbl_header), Paragraph('<b>Technologie</b>', tbl_header), Paragraph('<b>Rôle</b>', tbl_header)],
    [Paragraph('Frontend', tbl_cell), Paragraph('Next.js 16 + React 19', tbl_cell), Paragraph('Interface utilisateur et navigation', tbl_cell_left)],
    [Paragraph('Styling', tbl_cell), Paragraph('Tailwind CSS 4 + shadcn/ui', tbl_cell), Paragraph('Design responsive mobile-first', tbl_cell_left)],
    [Paragraph('State', tbl_cell), Paragraph('Zustand', tbl_cell), Paragraph('Gestion d\'état client-side', tbl_cell_left)],
    [Paragraph('Backend API', tbl_cell), Paragraph('Next.js API Routes', tbl_cell), Paragraph('Authentification, CRUD trajets', tbl_cell_left)],
    [Paragraph('Base de données', tbl_cell), Paragraph('Prisma + SQLite', tbl_cell), Paragraph('Stockage des données', tbl_cell_left)],
    [Paragraph('PWA', tbl_cell), Paragraph('Service Worker + Manifest', tbl_cell), Paragraph('Installation et cache hors-ligne', tbl_cell_left)],
    [Paragraph('Déploiement', tbl_cell), Paragraph('Vercel / Docker', tbl_cell), Paragraph('Hébergement production', tbl_cell_left)],
]
story.append(Spacer(1, 8))
story.append(make_table(arch_data, [3*cm, 5*cm, 8*cm]))
story.append(Spacer(1, 6))
story.append(Paragraph('Tableau 1 : Stack technique de Allô Dakar', ParagraphStyle(
    name='Caption', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.HexColor('#666666')
)))
story.append(Spacer(1, 18))

# ========================
# 2. Déploiement Vercel
# ========================
story.append(add_heading('<b>2. Déploiement sur Vercel</b>', h1_style, 0))

story.append(Paragraph(
    'Vercel est la plateforme de déploiement recommandée pour Allô Dakar. Elle est conçue nativement '
    'pour les applications Next.js et offre un déploiement en un clic avec une intégration GitHub transparente. '
    'Le plan gratuit est suffisant pour la phase pilote et inclut un certificat SSL automatique, un CDN mondial '
    'pour des temps de chargement rapides, et un domaine personnalisé en .vercel.app. Chaque push sur la branche '
    'main déclenche automatiquement un nouveau déploiement, ce qui simplifie considérablement le cycle de développement.',
    body_style
))
story.append(Spacer(1, 8))

story.append(add_heading('<b>2.1 Préparation du dépôt GitHub</b>', h2_style, 1))
story.append(Paragraph(
    'Avant de déployer sur Vercel, vous devez publier le code source sur GitHub. Si ce n\'est pas déjà fait, '
    'initialisez un dépôt Git, ajoutez tous les fichiers, et poussez-les vers un nouveau dépôt GitHub. '
    'Assurez-vous que le fichier .gitignore est correctement configuré pour exclure node_modules, .next, '
    'et les fichiers de base de données locales qui ne doivent pas être versionnés.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'git init<br/>'
    'git add .<br/>'
    'git commit -m "Initial commit - Allô Dakar"<br/>'
    'git remote add origin https://github.com/VOTRE-USER/allo-dakar.git<br/>'
    'git push -u origin main',
    code_style
))
story.append(Spacer(1, 12))

story.append(add_heading('<b>2.2 Configuration Vercel</b>', h2_style, 1))
story.append(Paragraph(
    'Connectez-vous sur vercel.com avec votre compte GitHub. Cliquez sur "New Project", sélectionnez votre '
    'dépôt Allô Dakar, et Vercel détectera automatiquement qu\'il s\'agit d\'une application Next.js. '
    'Vous n\'aurez qu\'à configurer les variables d\'environnement nécessaires avant de lancer le déploiement. '
    'Le processus complet prend moins de 5 minutes pour un déploiement initial.',
    body_style
))
story.append(Spacer(1, 12))

story.append(add_heading('<b>2.3 Variables d\'environnement</b>', h2_style, 1))
story.append(Paragraph(
    'Les variables d\'environnement sont essentielles pour le bon fonctionnement de l\'application en production. '
    'Elles doivent être configurées dans le tableau de bord Vercel, dans la section Settings / Environment Variables. '
    'Voici les variables requises pour chaque étape du projet.',
    body_style
))
story.append(Spacer(1, 8))

env_data = [
    [Paragraph('<b>Variable</b>', tbl_header), Paragraph('<b>Valeur Développement</b>', tbl_header), Paragraph('<b>Valeur Production</b>', tbl_header)],
    [Paragraph('DATABASE_URL', tbl_cell), Paragraph('file:./db/custom.db', tbl_cell_left), Paragraph('URL de votre BDD cloud', tbl_cell_left)],
    [Paragraph('NEXTAUTH_SECRET', tbl_cell), Paragraph('(optionnel)', tbl_cell), Paragraph('Clé secrète 32+ caractères', tbl_cell_left)],
    [Paragraph('NEXTAUTH_URL', tbl_cell), Paragraph('http://localhost:3000', tbl_cell_left), Paragraph('https://allo-dakar.vercel.app', tbl_cell_left)],
    [Paragraph('NODE_ENV', tbl_cell), Paragraph('development', tbl_cell), Paragraph('production (auto)', tbl_cell_left)],
]
story.append(make_table(env_data, [3.5*cm, 5.5*cm, 7*cm]))
story.append(Spacer(1, 6))
story.append(Paragraph('Tableau 2 : Variables d\'environnement requises', ParagraphStyle(
    name='Caption2', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.HexColor('#666666')
)))
story.append(Spacer(1, 18))

# ========================
# 3. Migration Base de Données
# ========================
story.append(add_heading('<b>3. Migration de la base de données</b>', h1_style, 0))

story.append(Paragraph(
    'La base de données SQLite utilisée en développement n\'est pas adaptée à un environnement de production. '
    'En effet, SQLite stocke les données dans un fichier local, ce qui ne fonctionne pas avec l\'architecture '
    'serverless de Vercel où chaque requête peut être traitée par un serveur différent. Vous devez migrer vers '
    'une base de données cloud qui offre une persistance des données et une meilleure scalabilité.',
    body_style
))
story.append(Spacer(1, 8))

story.append(add_heading('<b>3.1 Options recommandées</b>', h2_style, 1))
story.append(Spacer(1, 8))

db_data = [
    [Paragraph('<b>Service</b>', tbl_header), Paragraph('<b>Type</b>', tbl_header), Paragraph('<b>Avantages</b>', tbl_header), Paragraph('<b>Tarif</b>', tbl_header)],
    [Paragraph('Turso', tbl_cell), Paragraph('SQLite Cloud', tbl_cell), Paragraph('Migration facile depuis SQLite', tbl_cell_left), Paragraph('Gratuit (500 MB)', tbl_cell)],
    [Paragraph('Supabase', tbl_cell), Paragraph('PostgreSQL', tbl_cell), Paragraph('Auth, Storage, Real-time inclus', tbl_cell_left), Paragraph('Gratuit (500 MB)', tbl_cell)],
    [Paragraph('PlanetScale', tbl_cell), Paragraph('MySQL', tbl_cell), Paragraph('Branching de BDD, scalable', tbl_cell_left), Paragraph('Gratuit (1 GB)', tbl_cell)],
    [Paragraph('Neon', tbl_cell), Paragraph('PostgreSQL', tbl_cell), Paragraph('Serverless natif, auto-scale', tbl_cell_left), Paragraph('Gratuit (0.5 GB)', tbl_cell)],
]
story.append(make_table(db_data, [2.8*cm, 2.8*cm, 6.5*cm, 3.9*cm]))
story.append(Spacer(1, 6))
story.append(Paragraph('Tableau 3 : Comparaison des services de base de données cloud', ParagraphStyle(
    name='Caption3', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.HexColor('#666666')
)))
story.append(Spacer(1, 12))

story.append(add_heading('<b>3.2 Procédure de migration vers Turso</b>', h2_style, 1))
story.append(Paragraph(
    'Turso est l\'option recommandée car elle utilise SQLite en backend, ce qui minimise les changements '
    'de code. La procédure se déroule en quelques étapes simples. D\'abord, créez un compte sur turso.tech '
    'et installez la CLI Turso. Créez ensuite une base de données avec la commande turso db create allo-dakar. '
    'Obtenez l\'URL de connexion avec turso db show allo-dakar --url et le token d\'authentification avec '
    'turso db tokens create allo-dakar. Enfin, mettez à jour votre fichier .env avec ces nouvelles valeurs.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    '# Dans prisma/schema.prisma, remplacer le provider :<br/>'
    'datasource db {<br/>'
    '  provider = "sqlite"<br/>'
    '  url = env("DATABASE_URL")<br/>'
    '}<br/><br/>'
    '# Puis exécuter :<br/>'
    'bun run db:push<br/>'
    'bun run db:generate',
    code_style
))
story.append(Spacer(1, 18))

# ========================
# 4. PWA - Installation Mobile
# ========================
story.append(add_heading('<b>4. Installation sur mobile (PWA)</b>', h1_style, 0))

story.append(Paragraph(
    'La Progressive Web App (PWA) permet aux utilisateurs d\'installer Allô Dakar directement sur leur '
    'téléphone, comme une application native, sans passer par les stores d\'applications. L\'application '
    'dispose d\'un Service Worker pour le cache hors-ligne, d\'un manifest.json pour les métadonnées, '
    'et d\'un prompt d\'installation automatique. L\'expérience utilisateur est quasiment identique à une '
    'application native, avec un lancement depuis l\'écran d\'accueil, un écran de chargement personnalisé, '
    'et un fonctionnement en mode plein écran.',
    body_style
))
story.append(Spacer(1, 8))

story.append(add_heading('<b>4.1 Installation sur Android</b>', h2_style, 1))
story.append(Paragraph(
    'Sur Android, l\'installation est entièrement automatique. Lorsqu\'un utilisateur visite le site pour '
    'la première fois avec Google Chrome, une bannière d\'installation apparaît automatiquement après quelques '
    'secondes. L\'utilisateur n\'a qu\'à cliquer sur le bouton "Installer" pour ajouter Allô Dakar sur son '
    'écran d\'accueil. Une icône personnalisée est créée et l\'application s\'ouvre en mode plein écran, '
    'sans la barre d\'adresse du navigateur, offrant une expérience immersive.',
    body_style
))
story.append(Spacer(1, 8))

story.append(add_heading('<b>4.2 Installation sur iOS</b>', h2_style, 1))
story.append(Paragraph(
    'Sur iOS, le processus est légèrement différent car Apple ne supporte pas encore le prompt d\'installation '
    'automatique. L\'utilisateur doit manuellement ajouter l\'application à son écran d\'accueil. Pour ce faire, '
    'il doit ouvrir le site dans Safari, appuyer sur l\'icône de partage (le carré avec une flèche vers le haut), '
    'puis sélectionner "Sur l\'écran d\'accueil". Une fois ajoutée, l\'application se comporte comme une app native '
    'avec un lancement rapide et un fonctionnement hors-ligne partiel.',
    body_style
))
story.append(Spacer(1, 12))

story.append(add_heading('<b>4.3 Fonctionnalités PWA incluses</b>', h2_style, 1))
story.append(Spacer(1, 8))

pwa_data = [
    [Paragraph('<b>Fonctionnalité</b>', tbl_header), Paragraph('<b>Description</b>', tbl_header), Paragraph('<b>Statut</b>', tbl_header)],
    [Paragraph('Service Worker', tbl_cell), Paragraph('Cache des ressources et mode hors-ligne', tbl_cell_left), Paragraph('Actif', tbl_cell)],
    [Paragraph('Manifest.json', tbl_cell), Paragraph('Métadonnées de l\'app (nom, icônes, couleurs)', tbl_cell_left), Paragraph('Configuré', tbl_cell)],
    [Paragraph('Prompt d\'installation', tbl_cell), Paragraph('Bannière automatique (Android) / iOS guide', tbl_cell_left), Paragraph('Actif', tbl_cell)],
    [Paragraph('Icônes PWA', tbl_cell), Paragraph('8 tailles de 72x72 à 512x512', tbl_cell_left), Paragraph('Générées', tbl_cell)],
    [Paragraph('Thème couleur', tbl_cell), Paragraph('Barre de statut verte (#006233)', tbl_cell_left), Paragraph('Configuré', tbl_cell)],
    [Paragraph('Mode standalone', tbl_cell), Paragraph('Plein écran sans barre du navigateur', tbl_cell_left), Paragraph('Configuré', tbl_cell)],
    [Paragraph('Background Sync', tbl_cell), Paragraph('Synchronisation des réservations', tbl_cell_left), Paragraph('Prêt', tbl_cell)],
]
story.append(make_table(pwa_data, [3.5*cm, 7.5*cm, 5*cm]))
story.append(Spacer(1, 6))
story.append(Paragraph('Tableau 4 : Fonctionnalités PWA implémentées', ParagraphStyle(
    name='Caption4', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.HexColor('#666666')
)))
story.append(Spacer(1, 18))

# ========================
# 5. Déploiement Docker (Alternative)
# ========================
story.append(add_heading('<b>5. Déploiement Docker (Alternative)</b>', h1_style, 0))

story.append(Paragraph(
    'Si vous préférez un contrôle total sur l\'infrastructure, le déploiement via Docker est une excellente '
    'alternative. Cette approche est recommandée si vous disposez d\'un serveur VPS (Virtual Private Server) '
    'chez un fournisseur comme OVH, DigitalOcean ou AWS EC2. Le fichier Dockerfile est déjà configuré dans '
    'le projet pour créer une image optimisée avec un build multi-étapes qui minimise la taille finale de '
    'l\'image tout en incluant toutes les dépendances nécessaires.',
    body_style
))
story.append(Spacer(1, 8))

story.append(add_heading('<b>5.1 Commandes de déploiement</b>', h2_style, 1))
story.append(Paragraph(
    'Le processus de déploiement Docker se résume à quelques commandes simples. D\'abord, construisez l\'image '
    'avec docker build -t allo-dakar . puis lancez le conteneur avec la commande appropriée en exposant le port 3000. '
    'Pour la production, il est recommandé d\'utiliser un reverse proxy comme Nginx ou Caddy pour gérer le SSL '
    'et le routage HTTP.',
    body_style
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    '# Construction de l\'image<br/>'
    'docker build -t allo-dakar .<br/><br/>'
    '# Lancement du conteneur<br/>'
    'docker run -d -p 3000:3000 --name allo-dakar \<br/>'
    '  -e DATABASE_URL="file:./db/custom.db" \<br/>'
    '  allo-dakar<br/><br/>'
    '# Avec Docker Compose (recommandé)<br/>'
    'docker-compose up -d',
    code_style
))
story.append(Spacer(1, 18))

# ========================
# 6. Domaine et DNS
# ========================
story.append(add_heading('<b>6. Configuration du domaine personnalisé</b>', h1_style, 0))

story.append(Paragraph(
    'Pour une image professionnelle, il est recommandé d\'utiliser un domaine personnalisé comme allodakar.sn '
    'au lieu du sous-domaine Vercel par défaut. Au Sénégal, vous pouvez enregistrer un domaine .sn auprès '
    'du NIC Sénégal ou utiliser un registrar international comme Namecheap ou OVH pour un domaine .com ou .sn. '
    'La configuration DNS consiste à ajouter un enregistrement CNAME pointant vers cname.vercel-dns.com dans '
    'votre zone DNS. Vercel gère automatiquement le certificat SSL via Let\'s Encrypt.',
    body_style
))
story.append(Spacer(1, 8))

story.append(add_heading('<b>6.1 Configuration DNS</b>', h2_style, 1))
story.append(Spacer(1, 8))

dns_data = [
    [Paragraph('<b>Type</b>', tbl_header), Paragraph('<b>Nom</b>', tbl_header), Paragraph('<b>Valeur</b>', tbl_header)],
    [Paragraph('CNAME', tbl_cell), Paragraph('@ ou www', tbl_cell), Paragraph('cname.vercel-dns.com', tbl_cell_left)],
    [Paragraph('A', tbl_cell), Paragraph('@', tbl_cell), Paragraph('76.76.21.21', tbl_cell_left)],
    [Paragraph('TXT', tbl_cell), Paragraph('_vercel', tbl_cell), Paragraph('vc-domain-verify=allo-dakar', tbl_cell_left)],
]
story.append(make_table(dns_data, [2.5*cm, 4*cm, 9.5*cm]))
story.append(Spacer(1, 6))
story.append(Paragraph('Tableau 5 : Configuration DNS pour Vercel', ParagraphStyle(
    name='Caption5', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.HexColor('#666666')
)))
story.append(Spacer(1, 18))

# ========================
# 7. Checklist de déploiement
# ========================
story.append(add_heading('<b>7. Checklist de déploiement</b>', h1_style, 0))

story.append(Paragraph(
    'Voici une checklist complète à suivre pour garantir un déploiement réussi de Allô Dakar en production. '
    'Chaque étape doit être validée avant de passer à la suivante. Cette approche méthodique permet de '
    'minimiser les risques et d\'assurer une mise en production fiable et professionnelle.',
    body_style
))
story.append(Spacer(1, 8))

check_data = [
    [Paragraph('<b>Étape</b>', tbl_header), Paragraph('<b>Action</b>', tbl_header), Paragraph('<b>Vérification</b>', tbl_header)],
    [Paragraph('1', tbl_cell), Paragraph('Pousser le code sur GitHub', tbl_cell_left), Paragraph('Le dépôt est public/privé sur GitHub', tbl_cell_left)],
    [Paragraph('2', tbl_cell), Paragraph('Créer le projet Vercel', tbl_cell_left), Paragraph('Le dashboard Vercel est configuré', tbl_cell_left)],
    [Paragraph('3', tbl_cell), Paragraph('Configurer la BDD cloud', tbl_cell_left), Paragraph('Turso/Supabase est connecté', tbl_cell_left)],
    [Paragraph('4', tbl_cell), Paragraph('Mettre les variables d\'env', tbl_cell_left), Paragraph('DATABASE_URL est correct', tbl_cell_left)],
    [Paragraph('5', tbl_cell), Paragraph('Lancer le déploiement', tbl_cell_left), Paragraph('Le build réussit sans erreur', tbl_cell_left)],
    [Paragraph('6', tbl_cell), Paragraph('Tester l\'application', tbl_cell_left), Paragraph('Login, recherche, réservation OK', tbl_cell_left)],
    [Paragraph('7', tbl_cell), Paragraph('Tester la PWA mobile', tbl_cell_left), Paragraph('Installation sur Android/iOS OK', tbl_cell_left)],
    [Paragraph('8', tbl_cell), Paragraph('Configurer le domaine', tbl_cell_left), Paragraph('Le domaine est accessible', tbl_cell_left)],
    [Paragraph('9', tbl_cell), Paragraph('Vérifier le SSL', tbl_cell_left), Paragraph('HTTPS actif, certificat valide', tbl_cell_left)],
    [Paragraph('10', tbl_cell), Paragraph('Effectuer les seed data', tbl_cell_left), Paragraph('Données de test présentes', tbl_cell_left)],
]
story.append(make_table(check_data, [1.5*cm, 5.5*cm, 9*cm]))
story.append(Spacer(1, 6))
story.append(Paragraph('Tableau 6 : Checklist de déploiement production', ParagraphStyle(
    name='Caption6', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.HexColor('#666666')
)))
story.append(Spacer(1, 18))

# ========================
# 8. Évolutions futures
# ========================
story.append(add_heading('<b>8. Évolutions futures recommandées</b>', h1_style, 0))

story.append(Paragraph(
    'Une fois la phase pilote validée et l\'application stable en production, plusieurs évolutions sont envisageables '
    'pour améliorer l\'expérience utilisateur et étendre le service. Voici les principales pistes de développement '
    'à considérer pour les futures versions de l\'application.',
    body_style
))
story.append(Spacer(1, 8))

future_data = [
    [Paragraph('<b>Évolution</b>', tbl_header), Paragraph('<b>Description</b>', tbl_header), Paragraph('<b>Priorité</b>', tbl_header)],
    [Paragraph('App native (Capacitor)', tbl_cell_left), Paragraph('Envelopper la PWA dans une app native pour les stores', tbl_cell_left), Paragraph('Haute', tbl_cell)],
    [Paragraph('Paiement mobile', tbl_cell_left), Paragraph('Intégration Orange Money / Wave pour le paiement en ligne', tbl_cell_left), Paragraph('Haute', tbl_cell)],
    [Paragraph('Notifications push', tbl_cell_left), Paragraph('Alertes pour les nouveaux trajets et confirmations', tbl_cell_left), Paragraph('Haute', tbl_cell)],
    [Paragraph('Carte interactive réelle', tbl_cell_left), Paragraph('Intégration Google Maps pour la vue trajet', tbl_cell_left), Paragraph('Moyenne', tbl_cell)],
    [Paragraph('Système de notation', tbl_cell_left), Paragraph('Avis passager/chauffeur après chaque trajet', tbl_cell_left), Paragraph('Moyenne', tbl_cell)],
    [Paragraph('Extension régions', tbl_cell_left), Paragraph('Ajouter Saint-Louis, Kaolack, Ziguinchor', tbl_cell_left), Paragraph('Moyenne', tbl_cell)],
    [Paragraph('Géolocalisation', tbl_cell_left), Paragraph('Suivi en temps réel du véhicule', tbl_cell_left), Paragraph('Basse', tbl_cell)],
]
story.append(make_table(future_data, [4*cm, 9*cm, 3*cm]))
story.append(Spacer(1, 6))
story.append(Paragraph('Tableau 7 : Évolutions futures recommandées', ParagraphStyle(
    name='Caption7', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.HexColor('#666666')
)))

# ========================
# Build
# ========================
doc.multiBuild(story)
print(f"PDF generated: {output_path}")
