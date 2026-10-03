(() => {
  "use strict";

  const LANGUAGES = {
    es: { locale:"es", native:"Español" },
    en: { locale:"en", native:"English" },
    pt: { locale:"pt", native:"Português" },
    zh: { locale:"zh-CN", native:"中文" },
    ja: { locale:"ja", native:"日本語" },
    ko: { locale:"ko", native:"한국어" },
    it: { locale:"it", native:"Italiano" },
    fr: { locale:"fr", native:"Français" }
  };

  const WORDS = {
    "Inicio":["Home","Início","首页","ホーム","홈","Home","Accueil"],
    "Álbum":["Album","Álbum","相册","アルバム","앨범","Album","Album"],
    "Chat":["Chat","Chat","聊天","チャット","채팅","Chat","Chat"],
    "Mascotas":["Pets","Mascotes","宠物","ペット","반려동물","Animali","Animaux"],
    "Finanzas":["Finance","Finanças","财务","ファイナンス","재정","Finanze","Finances"],
    "Apartados de finanzas":["Finance sections","Seções de finanças","财务栏目","ファイナンスの項目","재정 섹션","Sezioni finanze","Rubriques finances"],
    "Ámbito de finanzas":["Finance scope","Escopo das finanças","财务范围","家計の範囲","재정 범위","Ambito finanziario","Périmètre financier"],
    "Resumen":["Overview","Resumo","概览","概要","요약","Riepilogo","Résumé"],
    "Cotizaciones":["Exchange rates","Cotações","汇率","為替レート","환율","Tassi di cambio","Taux de change"],
    "Recordatorios":["Reminders","Lembretes","提醒","リマインダー","알림","Promemoria","Rappels"],
    "Compartidas":["Shared","Compartilhadas","共享","共有","공유","Condivise","Partagées"],
    "MERCADO DE DIVISAS":["CURRENCY MARKET","MERCADO DE CÂMBIO","外汇市场","為替市場","환율 시장","MERCATO VALUTARIO","MARCHÉ DES DEVISES"],
    "Precio frente al dólar":["Price against the US dollar","Cotação em relação ao dólar","对美元汇率","米ドルとの為替レート","미국 달러 환율","Tasso rispetto al dollaro","Taux face au dollar"],
    "Consultando cotización…":["Loading exchange rate…","Consultando cotação…","正在查询汇率…","為替レートを確認中…","환율 조회 중…","Recupero del tasso…","Consultation du taux…"],
    "Cotización no disponible":["Rate unavailable","Cotação indisponível","汇率不可用","為替レートを取得できません","환율을 사용할 수 없습니다","Tasso non disponibile","Taux indisponible"],
    "El gráfico se formará con las próximas cotizaciones.":["The chart will build as new prices arrive.","O gráfico será formado com as próximas cotações.","图表会随着新报价逐步生成。","次のレート更新に合わせてグラフが表示されます。","다음 시세부터 그래프가 만들어집니다.","Il grafico si formerà con le prossime quotazioni.","Le graphique se formera avec les prochaines cotations."],
    "Aviso discreto en el escritorio":["Quiet desktop alerts","Aviso discreto na área de trabalho","桌面静默提醒","デスクトップ通知を控えめに表示","조용한 데스크톱 알림","Avviso discreto sul desktop","Alerte discrète sur le bureau"],
    "Silencioso, solo ante cambios de 0,1 % o más y como máximo cada 15 minutos.":["Silent, only for changes of 0.1% or more, at most every 15 minutes.","Silencioso, apenas para variações de 0,1% ou mais, no máximo a cada 15 minutos.","静音提醒，仅在变化达到 0.1% 时触发，最多每 15 分钟一次。","0.1%以上の変動時のみ通知し、15分に1回までです。","0.1% 이상 변동할 때만 알리고, 최대 15분에 한 번 표시합니다.","Silenzioso, solo per variazioni dello 0,1% o più e al massimo ogni 15 minuti.","Silencieuse, uniquement pour les variations d’au moins 0,1 %, au maximum toutes les 15 minutes."],
    "Ejecuta supabase-finanzas-cotizaciones.sql para activar los avisos.":["Run supabase-finanzas-cotizaciones.sql to enable alerts.","Execute supabase-finanzas-cotizaciones.sql para ativar os avisos.","运行 supabase-finanzas-cotizaciones.sql 以启用提醒。","通知を有効にするには supabase-finanzas-cotizaciones.sql を実行してください。","알림을 사용하려면 supabase-finanzas-cotizaciones.sql을 실행하세요.","Esegui supabase-finanzas-cotizaciones.sql per attivare gli avvisi.","Exécutez supabase-finanzas-cotizaciones.sql pour activer les alertes."],
    "Avisos activados. Serán silenciosos y se limitarán a uno cada 15 minutos.":["Alerts enabled. They are silent and limited to one every 15 minutes.","Avisos ativados. Serão silenciosos, no máximo um a cada 15 minutos.","提醒已启用。静音模式，最多每 15 分钟一次。","通知を有効にしました。サイレントで15分に1回までです。","알림이 켜졌습니다. 무음이며 15분에 한 번만 표시됩니다.","Avvisi attivati. Silenziosi e limitati a uno ogni 15 minuti.","Alertes activées. Elles sont silencieuses et limitées à une toutes les 15 minutes."],
    "Avisos de precio desactivados.":["Price alerts disabled.","Avisos de preço desativados.","价格提醒已关闭。","価格通知を無効にしました。","가격 알림이 꺼졌습니다.","Avvisi sui prezzi disattivati.","Alertes de prix désactivées."],
    "RECORDATORIO DIARIO":["DAILY REMINDER","LEMBRETE DIÁRIO","每日提醒","毎日のリマインダー","매일 알림","PROMEMORIA GIORNALIERO","RAPPEL QUOTIDIEN"],
    "Recordatorios diarios":["Daily reminders","Lembretes diários","每日提醒","毎日のリマインダー","매일 알림","Promemoria giornalieri","Rappels quotidiens"],
    "Recibe un aviso si todavía no registraste los gastos de hoy.":["Get a reminder if you have not logged today's expenses yet.","Receba um lembrete se ainda não registrou as despesas de hoje.","如果你还没有记录今天的支出，我们会提醒你。","今日の支出をまだ記録していない場合に通知します。","오늘 지출을 아직 기록하지 않았다면 알림을 받으세요.","Ricevi un promemoria se non hai ancora registrato le spese di oggi.","Recevez un rappel si vous n’avez pas encore enregistré les dépenses du jour."],
    "Finanzas personales":["Personal finances","Finanças pessoais","个人财务","個人の家計","개인 재정","Finanze personali","Finances personnelles"],
    "Finanzas del grupo":["Group finances","Finanças do grupo","群组财务","グループの家計","그룹 재정","Finanze del gruppo","Finances du groupe"],
    "Hora del aviso":["Reminder time","Horário do lembrete","提醒时间","通知時刻","알림 시간","Ora del promemoria","Heure du rappel"],
    "Zona horaria:":["Time zone:","Fuso horário:","时区：","タイムゾーン：","시간대:","Fuso orario:","Fuseau horaire :"],
    "Guardar recordatorios":["Save reminders","Salvar lembretes","保存提醒","リマインダーを保存","알림 저장하기","Salva i promemoria","Enregistrer les rappels"],
    "Recordatorios desactivados.":["Reminders disabled.","Lembretes desativados.","提醒已关闭。","リマインダーを無効にしました。","알림이 꺼졌습니다.","Promemoria disattivati.","Rappels désactivés."],
    "Recordatorios guardados. Te avisaremos solo si aún faltan gastos por registrar.":["Reminders saved. We will only notify you if there are expenses left to log.","Lembretes salvos. Avisaremos apenas se ainda houver despesas para registrar.","提醒已保存。只有还有支出未记录时才会通知你。","リマインダーを保存しました。未記録の支出がある場合にのみ通知します。","알림을 저장했습니다. 기록할 지출이 남아 있을 때만 알려드립니다.","Promemoria salvati. Ti avviseremo solo se ci sono ancora spese da registrare.","Rappels enregistrés. Nous vous avertirons uniquement s’il reste des dépenses à enregistrer."],
    "Ejecuta supabase-finanzas-recordatorios.sql y configura el cron para activar esta función.":["Run supabase-finanzas-recordatorios.sql and configure the scheduler to enable this feature.","Execute supabase-finanzas-recordatorios.sql e configure o agendador para ativar esse recurso.","运行 supabase-finanzas-recordatorios.sql 并配置定时任务以启用此功能。","この機能を有効にするには、supabase-finanzas-recordatorios.sql を実行してスケジューラーを設定してください。","이 기능을 사용하려면 supabase-finanzas-recordatorios.sql을 실행하고 스케줄러를 설정하세요.","Esegui supabase-finanzas-recordatorios.sql e configura la pianificazione per attivare questa funzione.","Exécutez supabase-finanzas-recordatorios.sql et configurez la planification pour activer cette fonctionnalité."],
    "Entrar":["Sign in","Entrar","登录","ログイン","로그인","Accedi","Se connecter"],
    "Mapa":["Map","Mapa","地图","マップ","지도","Mappa","Carte"],
    "Logros":["Achievements","Conquistas","成就","実績","업적","Obiettivi","Succès"],
    "Notitas":["Notes","Bilhetes","便笺","メモ","메모","Appunti","Notes"],
    "Playlists":["Playlists","Playlists","播放列表","プレイリスト","재생 목록","Playlist","Playlists"],
    "Mi perfil":["My profile","Meu perfil","我的资料","プロフィール","내 프로필","Il mio profilo","Mon profil"],
    "Cambiar nombre":["Change name","Mudar nome","更改名称","名前を変更","이름 변경","Cambia nome","Changer de nom"],
    "Ajustes":["Settings","Configurações","设置","設定","설정","Impostazioni","Paramètres"],
    "Amigos y grupo":["Friends and group","Amigos e grupo","好友和群组","友達とグループ","친구 및 그룹","Amici e gruppo","Amis et groupe"],
    "Descargar todo":["Download everything","Baixar tudo","下载全部","すべてダウンロード","모두 다운로드","Scarica tutto","Tout télécharger"],
    "Salir":["Sign out","Sair","退出","ログアウト","로그아웃","Esci","Déconnexion"],
    "Idioma":["Language","Idioma","语言","言語","언어","Lingua","Langue"],
    "Elige el idioma de la aplicación.":["Choose the app language.","Escolha o idioma do aplicativo.","选择应用语言。","アプリの言語を選択してください。","앱 언어를 선택하세요.","Scegli la lingua dell'app.","Choisissez la langue de l’application."],
    "Desactivar animaciones":["Disable animations","Desativar animações","关闭动画","アニメーションを無効にする","애니메이션 끄기","Disattiva animazioni","Désactiver les animations"],
    "Reduce los movimientos y efectos visuales de la aplicación.":["Reduce motion and visual effects in the app.","Reduz movimentos e efeitos visuais do aplicativo.","减少应用中的动态效果。","アプリの動きや視覚効果を減らします。","앱의 움직임과 시각 효과를 줄입니다.","Riduce movimenti ed effetti visivi nell'app.","Réduit les mouvements et les effets visuels de l’application."],
    "Volumen de la aplicación":["App volume","Volume do aplicativo","应用音量","アプリの音量","앱 음량","Volume dell'app","Volume de l’application"],
    "Censurar malas palabras":["Filter profanity","Filtrar palavrões","过滤不雅用语","不適切な言葉を伏せる","비속어 필터링","Filtra parolacce","Filtrer les gros mots"],
    "Revisa los mensajes antes de guardarlos.":["Checks messages before saving them.","Verifica as mensagens antes de salvá-las.","保存前检查消息内容。","保存前にメッセージを確認します。","저장하기 전에 메시지를 확인합니다.","Controlla i messaggi prima di salvarli.","Vérifie les messages avant leur enregistrement."],
    "La revisión solo se aplica a mensajes nuevos.":["Filtering only applies to new messages.","A filtragem se aplica apenas a novas mensagens.","过滤仅适用于新消息。","フィルターは新しいメッセージにのみ適用されます。","필터링은 새 메시지에만 적용됩니다.","Il filtro si applica solo ai nuovi messaggi.","Le filtre s’applique uniquement aux nouveaux messages."],
    "Cerrar":["Close","Fechar","关闭","閉じる","닫기","Chiudi","Fermer"],
    "Cuidemos lo que construimos":["Let's care for what we build","Vamos cuidar do que construímos","一起守护我们的生活","ふたりで築くものを大切に","함께 만들어가는 것을 소중히","Prendiamoci cura di ciò che costruiamo","Prenons soin de ce que nous construisons"],
    "Tus gastos, acuerdos y metas en un solo lugar.":["Your expenses, plans, and goals in one place.","Suas despesas, acordos e metas em um só lugar.","在同一处管理支出、约定和目标。","支出、共有事項、目標をひとつに。","지출, 합의, 목표를 한곳에서 관리하세요.","Spese, accordi e obiettivi in un unico posto.","Vos dépenses, accords et objectifs au même endroit."],
    "Moneda":["Currency","Moeda","货币","通貨","통화","Valuta","Devise"],
    "Inicia sesión para empezar":["Sign in to get started","Entre para começar","登录以开始","ログインして始めましょう","로그인하고 시작하세요","Accedi per iniziare","Connectez-vous pour commencer"],
    "Los movimientos se guardan de forma segura y puedes compartir los de Pareja con tu grupo.":["Transactions are stored securely; you can share Couple transactions with your group.","As transações são salvas com segurança; você pode compartilhar as da seção Casal com seu grupo.","交易会安全保存，你可以与群组共享情侣账目。","取引は安全に保存され、グループと共有できます。","내역은 안전하게 저장되며 그룹과 공유할 수 있습니다.","Le transazioni sono salvate in modo sicuro e puoi condividerle con il gruppo.","Les opérations sont enregistrées en sécurité et partageables avec votre groupe."],
    "Entrar o crear cuenta":["Sign in or create an account","Entrar ou criar conta","登录或创建账户","ログインまたはアカウント作成","로그인 또는 계정 만들기","Accedi o crea un account","Se connecter ou créer un compte"],
    "Personal":["Personal","Pessoal","个人","個人","개인","Personale","Personnel"],
    "Pareja":["Couple","Casal","情侣","ペア","커플","Coppia","Couple"],
    "Reportes":["Reports","Relatórios","报告","レポート","보고서","Report","Rapports"],
    "Período":["Period","Período","周期","期間","기간","Periodo","Période"],
    "Actualizar":["Refresh","Atualizar","刷新","更新","새로고침","Aggiorna","Actualiser"],
    "Ingresos":["Income","Receitas","收入","収入","수입","Entrate","Revenus"],
    "Gastos":["Expenses","Despesas","支出","支出","지출","Spese","Dépenses"],
    "Disponible":["Available","Disponível","可用余额","残高","사용 가능","Disponibile","Disponible"],
    "Ingresos menos gastos":["Income minus expenses","Receitas menos despesas","收入减去支出","収入から支出を差し引いた額","수입에서 지출을 뺀 금액","Entrate meno spese","Revenus moins dépenses"],
    "Nuevo movimiento":["New transaction","Nova transação","新增交易","新しい取引","새 거래","Nuova transazione","Nouvelle opération"],
    "Anota un ingreso o gasto":["Record income or an expense","Registre uma receita ou despesa","记录收入或支出","収入または支出を記録","수입 또는 지출 기록","Registra un'entrata o una spesa","Enregistrer un revenu ou une dépense"],
    "Gasto":["Expense","Despesa","支出","支出","지출","Spesa","Dépense"],
    "Ingreso":["Income","Receita","收入","収入","수입","Entrata","Revenu"],
    "Importe":["Amount","Valor","金额","金額","금액","Importo","Montant"],
    "Categoría":["Category","Categoria","类别","カテゴリ","분류","Categoria","Catégorie"],
    "Fecha":["Date","Data","日期","日付","날짜","Data","Date"],
    "Descripción":["Description","Descrição","描述","説明","설명","Descrizione","Description"],
    "Añadir movimiento":["Add transaction","Adicionar transação","添加交易","取引を追加","거래 추가","Aggiungi transazione","Ajouter une opération"],
    "Guardar cambios":["Save changes","Salvar alterações","保存更改","変更を保存","변경 사항 저장","Salva modifiche","Enregistrer les modifications"],
    "Movimientos":["Transactions","Transações","交易","取引","거래","Transazioni","Opérations"],
    "Categorías":["Categories","Categorias","类别","カテゴリ","분류","Categorie","Catégories"],
    "Presupuestos":["Budgets","Orçamentos","预算","予算","예산","Budget","Budgets"],
    "Metas de ahorro":["Savings goals","Metas de economia","储蓄目标","貯蓄目標","저축 목표","Obiettivi di risparmio","Objectifs d’épargne"],
    "Crear meta":["Create goal","Criar meta","创建目标","目標を作成","목표 만들기","Crea obiettivo","Créer un objectif"],
    "Sumar ahorro":["Add savings","Adicionar economia","添加存款","貯蓄を追加","저축 추가","Aggiungi risparmio","Ajouter une épargne"],
    "Balance entre miembros":["Member balance","Saldo entre membros","成员间结算","メンバー間の精算","구성원 간 정산","Saldo tra i membri","Solde entre membres"],
    "Reparto proporcional":["PROPORTIONAL SPLIT","DIVISÃO PROPORCIONAL","按比例分摊","比例配分","비례 분담","RIPARTIZIONE PROPORZIONALE","RÉPARTITION PROPORTIONNELLE"],
    "Este mes empieza limpio":["A fresh start this month","Um novo começo neste mês","本月从零开始","今月はここからスタート","이번 달을 새롭게 시작해요","Questo mese riparte da zero","Ce mois-ci, tout commence"],
    "Aún no hay presupuestos para este mes.":["No budgets for this month yet.","Ainda não há orçamentos para este mês.","本月还没有预算。","今月の予算はまだありません。","이번 달 예산이 아직 없습니다.","Nessun budget per questo mese.","Aucun budget pour ce mois."],
    "Aún no hay más integrantes":["No other members yet","Ainda não há outros membros","暂时没有其他成员","まだ他のメンバーはいません","아직 다른 구성원이 없습니다","Non ci sono ancora altri membri","Aucun autre membre pour le moment"],
    "Crea una meta y convierte el ahorro en un plan concreto.":["Create a goal and turn saving into a concrete plan.","Crie uma meta e transforme a economia em um plano concreto.","创建目标，把储蓄变成具体计划。","目標を作って、貯蓄を具体的な計画にしましょう。","목표를 만들고 저축을 구체적인 계획으로 바꿔보세요.","Crea un obiettivo e trasforma il risparmio in un piano concreto.","Créez un objectif et transformez l’épargne en un projet concret."],
    "Aún no hay gastos categorizados.":["No categorized expenses yet.","Ainda não há despesas categorizadas.","还没有分类支出。","カテゴリ別の支出はまだありません。","분류된 지출이 아직 없습니다.","Nessuna spesa categorizzata.","Aucune dépense catégorisée pour le moment."],
    "Mis mascotas":["My pets","Meus animais de estimação","我的宠物","ペット","내 반려동물","I miei animali","Mes animaux"],
    "Cada una guarda un pedacito de nuestra historia.":["Each one holds a little piece of our story.","Cada um guarda um pedacinho da nossa história.","每只宠物都珍藏着我们故事的一部分。","それぞれが私たちの思い出を大切にしています。","각각 우리의 이야기를 간직하고 있어요.","Ognuno custodisce un pezzetto della nostra storia.","Chacun garde un petit morceau de notre histoire."],
    "Atrapa el girasol":["Catch the sunflower","Pegue o girassol","抓住向日葵","ひまわりをつかまえて","해바라기 잡기","Acchiappa il girasole","Attrape le tournesol"],
    "Adivina la mascota":["Guess the pet","Adivinhe o mascote","猜猜宠物","ペットを当てよう","반려동물 맞히기","Indovina l'animale","Devine l’animal"],
    "Reto diario de minijuegos":["Daily minigame challenge","Desafio diário de minijogos","每日小游戏挑战","毎日のミニゲームチャレンジ","일일 미니게임 도전","Sfida giornaliera minigiochi","Défi quotidien de mini-jeux"],
    "Prueba 2 minijuegos distintos. Sin rachas ni penalización por descansar.":["Try 2 different minigames. No streaks or penalties for taking a break.","Experimente 2 minijogos diferentes. Sem sequências ou penalidades por descansar.","尝试2个不同的小游戏。休息不会中断连续记录，也不会受到惩罚。","異なるミニゲームを2つ遊びましょう。休んでも連続記録やペナルティはありません。","서로 다른 미니게임 2개를 해보세요. 쉬어도 연속 기록이나 불이익은 없습니다.","Prova 2 minigiochi diversi. Nessuna serie o penalità se ti riposi.","Essayez 2 mini-jeux différents. Pas de série ni de pénalité si vous faites une pause."],
    "Completa cualquier minijuego para empezar.":["Complete any minigame to get started.","Complete qualquer minijogo para começar.","完成任意小游戏即可开始。","ミニゲームをプレイして始めましょう。","아무 미니게임이나 완료해 시작하세요.","Completa un minigioco per iniziare.","Terminez un mini-jeu pour commencer."],
    "Cargar archivo(s)":["Upload file(s)","Carregar arquivo(s)","上传文件","ファイルをアップロード","파일 업로드","Carica file","Charger fichier(s)"],
    "Guardar fecha":["Save date","Salvar data","保存日期","日付を保存","날짜 저장","Salva data","Enregistrer la date"],
    "Seleccionar archivos":["Select files","Selecionar arquivos","选择文件","ファイルを選択","파일 선택","Seleziona file","Sélectionner des fichiers"],
    "Crear cuenta":["Create account","Criar conta","创建账户","アカウントを作成","계정 만들기","Crea account","Créer un compte"],
    "Contraseña":["Password","Senha","密码","パスワード","비밀번호","Password","Mot de passe"],
    "Usuario":["Username","Usuário","用户名","ユーザー名","사용자 이름","Nome utente","Nom d’utilisateur"],
    "Aceptar":["Accept","Aceitar","确定","決定","확인","Accetta","Accepter"],
    "Cancelar":["Cancel","Cancelar","取消","キャンセル","취소","Annulla","Annuler"],
    "Sí":["Yes","Sim","是","はい","예","Sì","Oui"],
    "No":["No","Não","否","いいえ","아니요","No","Non"],
    "Enviar":["Send","Enviar","发送","送信","보내기","Invia","Envoyer"],
    "Escribe un mensaje...":["Write a message...","Escreva uma mensagem...","输入消息...","メッセージを入力...","메시지를 입력하세요...","Scrivi un messaggio...","Écrivez un message..."],
    "Calendario":["Calendar","Calendário","日历","カレンダー","캘린더","Calendario","Calendrier"],
    "Añadir fecha":["Add date","Adicionar data","添加日期","日付を追加","날짜 추가","Aggiungi data","Ajouter une date"],
    "Añadir foto":["Add photo","Adicionar foto","添加照片","写真を追加","사진 추가","Aggiungi foto","Ajouter une photo"],
    "Añadir nota":["Add note","Adicionar nota","添加便笺","メモを追加","메모 추가","Aggiungi nota","Ajouter une note"],
    "Guardar nota":["Save note","Salvar nota","保存便笺","メモを保存","메모 저장","Salva nota","Enregistrer la note"],
    "Escribe algo bonito...":["Write something lovely...","Escreva algo bonito...","写点美好的话...","素敵な言葉を書いて...","예쁜 말을 적어보세요...","Scrivi qualcosa di bello...","Écrivez quelque chose de joli..."],
    "Aún no hay eventos.":["No events yet.","Ainda não há eventos.","还没有事件。","予定はまだありません。","일정이 아직 없습니다.","Ancora nessun evento.","Aucun événement pour le moment."],
    "Chat privado":["Private chat","Chat privado","私聊","プライベートチャット","비공개 채팅","Chat privato","Chat privé"],
    "Escribe algo...":["Write something...","Escreva algo...","写点什么...","何か書いて...","메시지를 입력하세요...","Scrivi qualcosa...","Écrivez quelque chose..."],
    "Atrás":["Back","Voltar","返回","戻る","뒤로","Indietro","Retour"],
    "Siguiente":["Next","Próximo","下一步","次へ","다음","Avanti","Suivant"],
    "Anterior":["Previous","Anterior","上一步","前へ","이전","Precedente","Précédent"],
    "Editar perfil":["Edit profile","Editar perfil","编辑资料","プロフィールを編集","프로필 수정","Modifica profilo","Modifier le profil"],
    "Cargando...":["Loading...","Carregando...","正在加载...","読み込み中...","불러오는 중...","Caricamento...","Chargement..."],
    "Iniciar sesión":["Sign in","Entrar","登录","ログイン","로그인","Accedi","Se connecter"],
    "Crear una cuenta":["Create an account","Criar uma conta","创建账户","アカウントを作成","계정 만들기","Crea un account","Créer un compte"],
    "Fotos":["Photos","Fotos","照片","写真","사진","Foto","Photos"],
    "Crea un recuerdo":["Create a memory","Crie uma lembrança","创建回忆","思い出を作成","추억 만들기","Crea un ricordo","Créer un souvenir"],
    "Sin resultados":["No results","Nenhum resultado","没有结果","結果なし","결과 없음","Nessun risultato","Aucun résultat"],
    "Bienvenido a":["Welcome to","Bem-vindo ao","欢迎来到","ようこそ","환영합니다","Benvenuto a","Bienvenue sur"],
    "Nuestro rincón":["Our little corner","Nosso cantinho","我们的小天地","私たちの場所","우리의 공간","Il nostro angolo","Notre petit coin"],
    "Un rincón para guardar lo nuestro":["A place to keep our memories","Um cantinho para guardar nossas lembranças","珍藏我们回忆的地方","思い出を残す場所","우리의 추억을 간직하는 곳","Un angolo per custodire i nostri ricordi","Un endroit pour garder nos souvenirs"],
    "Nuestras aventuras":["Our adventures","Nossas aventuras","我们的冒险","私たちの冒険","우리의 모험","Le nostre avventure","Nos aventures"],
    "Ver el álbum":["View the album","Ver o álbum","查看相册","アルバムを見る","앨범 보기","Vedi l'album","Voir l’album"],
    "Notitas para ti":["Little notes for you","Bilhetinhos para você","写给你的小纸条","あなたへのメモ","너를 위한 쪽지","Bigliettini per te","Petits mots pour toi"],
    "Pensamientos que quiero guardar":["Thoughts I want to keep","Pensamentos que quero guardar","想珍藏的想法","残しておきたい想い","간직하고 싶은 생각","Pensieri che voglio custodire","Des pensées à garder"],
    "Explorador de aventuras":["Adventure explorer","Explorador de aventuras","冒险探索者","冒険の探検家","모험 탐험가","Esploratore di avventure","Explorateur d’aventures"],
    "Bienvenido":["Welcome","Bem-vindo","欢迎","ようこそ","환영합니다","Benvenuto","Bienvenue"],
    "Inicia sesión para ver el álbum":["Sign in to view the album","Entre para ver o álbum","登录以查看相册","ログインしてアルバムを見ましょう","앨범을 보려면 로그인하세요","Accedi per vedere l'album","Connectez-vous pour voir l’album"],
    "Nuestras playlists":["Our playlists","Nossas playlists","我们的播放列表","私たちのプレイリスト","우리의 재생 목록","Le nostre playlist","Nos playlists"],
    "Las canciones que nos suenan a nosotros":["Songs that sound like us","As músicas que têm a nossa cara","属于我们的旋律","私たちらしい曲","우리다운 노래","Le canzoni che ci rappresentano","Les chansons qui nous ressemblent"],
    "Añadir playlist":["Add playlist","Adicionar playlist","添加播放列表","プレイリストを追加","재생 목록 추가","Aggiungi playlist","Ajouter une playlist"],
    "Hecho con":["Made with","Feito com","用心制作","心を込めて","마음으로 만들었어요","Fatto con","Fait avec"],
    "por":["by","por","作者","制作者","제작","da","par"],
    "Balance":["Balance","Saldo","余额","残高","잔액","Saldo","Solde"],
    "Últimos seis meses":["Last six months","Últimos seis meses","最近六个月","過去6か月","최근 6개월","Ultimi sei mesi","Six derniers mois"],
    "Ingresos y gastos":["Income and expenses","Receitas e despesas","收入和支出","収入と支出","수입 및 지출","Entrate e spese","Revenus et dépenses"],
    "Gastos por categoría":["Expenses by category","Despesas por categoria","按类别统计支出","カテゴリ別の支出","분류별 지출","Spese per categoria","Dépenses par catégorie"],
    "Editar":["Edit","Editar","编辑","編集","수정","Modifica","Modifier"],
    "Eliminar":["Delete","Excluir","删除","削除","삭제","Elimina","Supprimer"],
    "Sin categoría":["Uncategorized","Sem categoria","未分类","カテゴリなし","분류 없음","Senza categoria","Sans catégorie"],
    "Sin fecha límite":["No due date","Sem prazo","无截止日期","期限なし","기한 없음","Senza scadenza","Sans date limite"],
    "Meta para":["Goal for","Meta para","目标日期","目標日","목표 날짜","Obiettivo per","Objectif pour"],
    "Pagado por":["Paid by","Pago por","付款人","支払者","결제자","Pagato da","Payé par"],
    "Monedero":["Wallet","Carteira","钱包","ウォレット","지갑","Portafoglio","Portefeuille"],
    "¡Listo!":["Done!","Pronto!","完成！","完了！","완료!","Fatto!","Terminé !"],
    "Aún no hay playlists.":["No playlists yet.","Ainda não há playlists.","还没有播放列表。","プレイリストはまだありません。","재생 목록이 아직 없습니다.","Ancora nessuna playlist.","Aucune playlist pour le moment."],
    "Aún no hay notas.":["No notes yet.","Ainda não há notas.","还没有便笺。","メモはまだありません。","메모가 아직 없습니다.","Ancora nessuna nota.","Aucune note pour le moment."],
    "Aún no hay fotos.":["No photos yet.","Ainda não há fotos.","还没有照片。","写真はまだありません。","사진이 아직 없습니다.","Ancora nessuna foto.","Aucune photo pour le moment."],
    "Guardar":["Save","Salvar","保存","保存","저장","Salva","Enregistrer"],
    "Añadir":["Add","Adicionar","添加","追加","추가","Aggiungi","Ajouter"],
    "Buscar":["Search","Buscar","搜索","検索","검색","Cerca","Rechercher"],
    "Título":["Title","Título","标题","タイトル","제목","Titolo","Titre"],
    "Artista":["Artist","Artista","艺术家","アーティスト","아티스트","Artista","Artiste"],
    "Fecha objetivo":["Target date","Data objetivo","目标日期","目標日","목표 날짜","Data obiettivo","Date cible"],
    "Nombre de la meta":["Goal name","Nome da meta","目标名称","目標名","목표 이름","Nome obiettivo","Nom de l’objectif"],
    "Objetivo":["Target","Objetivo","目标金额","目標額","목표 금액","Obiettivo","Objectif"],
    "Todas las categorías":["All categories","Todas as categorias","所有类别","すべてのカテゴリ","모든 분류","Tutte le categorie","Toutes les catégories"],
    "Para equilibrar este mes":["To settle this month","Para equilibrar este mês","本月结算","今月の精算","이번 달 정산","Da compensare questo mese","À équilibrer ce mois-ci"],
    "Todo equilibrado":["All settled","Tudo equilibrado","已全部结清","すべて精算済み","모두 정산 완료","Tutto in pari","Tout est équilibré"],
    "No hay pagos pendientes entre miembros.":["No payments are owed between members.","Não há pagamentos pendentes entre os membros.","成员之间没有待付款项。","メンバー間の未払いはありません。","구성원 간 미결제 금액이 없습니다.","Non ci sono pagamenti in sospeso tra i membri.","Aucun paiement n’est en attente entre les membres."],
    "No hay integrantes en el grupo activo.":["There are no members in the active group.","Não há membros no grupo ativo.","当前群组中没有成员。","アクティブなグループにメンバーがいません。","활성 그룹에 구성원이 없습니다.","Non ci sono membri nel gruppo attivo.","Aucun membre dans le groupe actif."]
  };

  const TRANSLATION_MAP = Object.fromEntries(Object.entries(WORDS).map(([source, values]) => [
    source,
    Object.fromEntries(["en","pt","zh","ja","ko","it","fr"].map((language, index) => [language, values[index]]))
  ]));
  const LANGUAGE_NAMES = Object.fromEntries(Object.entries(LANGUAGES).map(([key, value]) => [value.native, key]));
  const originalText = new WeakMap();
  const lastTranslatedText = new WeakMap();
  const pendingMutations = new WeakSet();
  const languageSelect = document.getElementById("settings-language");
  const animationToggle = document.getElementById("toggle-animaciones");
  const volumeSlider = document.getElementById("settings-volume");
  const volumeOutput = document.getElementById("settings-volume-value");
  let currentLanguage = localStorage.getItem("sunadventures_language") || "es";
  let applying = false;

  function normalize(value) {
    return value.replace(/\s+/g, " ").trim();
  }

  function languageFor(language) {
    return Object.hasOwn(LANGUAGES, language) ? language : "es";
  }

  function sourceTextFor(node, text) {
    const marked = node.parentElement?.closest("[data-i18n]")?.dataset.i18n;
    if (marked && Object.hasOwn(TRANSLATION_MAP, marked)) return marked;
    const normalized = normalize(text);
    if (originalText.has(node)) {
      if (lastTranslatedText.get(node) === normalized) return originalText.get(node);
      originalText.delete(node);
      lastTranslatedText.delete(node);
    }
    for (const [source, translations] of Object.entries(TRANSLATION_MAP)) {
      if (normalized === translations[currentLanguage]) return source;
    }
    return normalized;
  }

  function translateNode(node, language) {
    const raw = node.nodeValue;
    if (!raw || !raw.trim()) return;
    const source = sourceTextFor(node, raw);
    originalText.set(node, source);
    const translated = language === "es" ? source : TRANSLATION_MAP[source]?.[language];
    if (!translated) return;
    lastTranslatedText.set(node, translated);
    if (normalize(raw) === translated) return;
    const leading = raw.match(/^\s*/)?.[0] || "";
    const trailing = raw.match(/\s*$/)?.[0] || "";
    pendingMutations.add(node);
    node.nodeValue = leading + translated + trailing;
  }

  function translateAttributes(root, language) {
    const nodes = [];
    if (root.nodeType === Node.ELEMENT_NODE && root.matches("[data-i18n]")) nodes.push(root);
    root.querySelectorAll?.("[data-i18n]").forEach(node => nodes.push(node));
    nodes.forEach(node => {
      const source = node.dataset.i18n;
      if (!Object.hasOwn(TRANSLATION_MAP, source)) return;
      node.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE && child.nodeValue.trim()) translateNode(child, language);
      });
    });
    const attributeNodes = [];
    if (root.nodeType === Node.ELEMENT_NODE && root.matches("[data-i18n-aria]")) attributeNodes.push(root);
    root.querySelectorAll?.("[data-i18n-aria]").forEach(node => attributeNodes.push(node));
    attributeNodes.forEach(node => {
      const source = node.dataset.i18nAria;
      const translated = language === "es" ? source : TRANSLATION_MAP[source]?.[language];
      if (translated && node.getAttribute("aria-label") !== translated) node.setAttribute("aria-label", translated);
    });
    const localizedNodes = [];
    if (root.nodeType === Node.ELEMENT_NODE && root.matches("[placeholder],[title],[aria-label]")) localizedNodes.push(root);
    root.querySelectorAll?.("[placeholder],[title],[aria-label]").forEach(node => localizedNodes.push(node));
    localizedNodes.forEach(node => ["placeholder", "title", "aria-label"].forEach(attribute => {
      if (node.hasAttribute(`data-i18n-${attribute}`)) return;
      const value = node.getAttribute(attribute);
      if (!value) return;
      let source = Object.hasOwn(TRANSLATION_MAP, value) ? value : null;
      if (!source) {
        source = Object.entries(TRANSLATION_MAP).find(([, translations]) =>
          Object.values(translations).includes(value)
        )?.[0];
      }
      if (!source) return;
      const translated = language === "es" ? source : TRANSLATION_MAP[source]?.[language];
      if (translated && translated !== value) node.setAttribute(attribute, translated);
    }));
  }

  function translateTree(root = document.body, language = currentLanguage) {
    if (applying || !root) return;
    applying = true;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    let node;
    while ((node = walker.nextNode())) translateNode(node, language);
    translateAttributes(root, language);
    applying = false;
  }

  function setLanguage(language) {
    currentLanguage = languageFor(language);
    localStorage.setItem("sunadventures_language", currentLanguage);
    document.documentElement.lang = LANGUAGES[currentLanguage].locale;
    const title = currentLanguage === "es"
      ? "SunAdventures · Nuestro rincón"
      : `SunAdventures · ${TRANSLATION_MAP["Nuestro rincón"]?.[currentLanguage] || "Our little corner"}`;
    document.title = title;
    if (languageSelect) languageSelect.value = currentLanguage;
    translateTree(document.body, currentLanguage);
    window.dispatchEvent(new CustomEvent("sunadventures:language-change", { detail:{ language:currentLanguage } }));
  }

  function setAnimationsDisabled(disabled) {
    const isDisabled = Boolean(disabled);
    localStorage.setItem("sunadventures_animations_disabled", String(isDisabled));
    document.documentElement.classList.toggle("animations-disabled", isDisabled);
    if (animationToggle) animationToggle.checked = isDisabled;
    window.dispatchEvent(new CustomEvent("sunadventures:animations-change", { detail:{ disabled:isDisabled } }));
  }

  function setVolume(rawValue) {
    const volume = Math.max(0, Math.min(1, Number(rawValue)));
    if (!Number.isFinite(volume)) return;
    localStorage.setItem("app_volume", String(volume));
    localStorage.setItem("player_volumen", String(volume));
    if (volumeSlider) volumeSlider.value = String(volume);
    if (volumeOutput) volumeOutput.value = `${Math.round(volume * 100)}%`;
    window.dispatchEvent(new CustomEvent("sunadventures:volume-change", { detail:{ volume } }));
  }

  window.SunPreferences = {
    getLanguage:() => currentLanguage,
    getVolume:() => Number(localStorage.getItem("app_volume") ?? "0.8"),
    setLanguage,
    setAnimationsDisabled,
    setVolume
  };

  document.addEventListener("DOMContentLoaded", () => {
    setLanguage(currentLanguage);
    setAnimationsDisabled(localStorage.getItem("sunadventures_animations_disabled") === "true");
    setVolume(localStorage.getItem("app_volume") ?? localStorage.getItem("player_volumen") ?? "0.8");
    languageSelect?.addEventListener("change", () => setLanguage(languageSelect.value));
    animationToggle?.addEventListener("change", () => setAnimationsDisabled(animationToggle.checked));
    volumeSlider?.addEventListener("input", () => setVolume(volumeSlider.value));
    window.addEventListener("sunadventures:volume-change", event => {
      if (event.target === window && event.detail?.volume !== undefined) {
        const volume = Number(event.detail.volume);
        if (volumeSlider) volumeSlider.value = String(volume);
        if (volumeOutput) volumeOutput.value = `${Math.round(volume * 100)}%`;
      }
    });

    const observer = new MutationObserver(records => {
      records.forEach(record => {
        if (record.type === "characterData" && pendingMutations.has(record.target)) {
          pendingMutations.delete(record.target);
          return;
        }
        if (record.type === "characterData") translateNode(record.target, currentLanguage);
        if (record.type === "attributes") translateAttributes(record.target, currentLanguage);
        record.addedNodes?.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) translateTree(node, currentLanguage);
          else if (node.nodeType === Node.TEXT_NODE) translateNode(node, currentLanguage);
        });
      });
    });
    observer.observe(document.body, { childList:true, characterData:true, attributes:true, subtree:true });
  }, { once:true });
})();
