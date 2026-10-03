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
    "Nuestras Playlists":["Our playlists","Nossas playlists","我们的播放列表","私たちのプレイリスト","우리의 재생 목록","Le nostre playlist","Nos playlists"],
    "Nueva playlist":["New playlist","Nova playlist","新播放列表","新しいプレイリスト","새 재생 목록","Nuova playlist","Nouvelle playlist"],
    "Descripción (opcional)":["Description (optional)","Descrição (opcional)","描述（可选）","説明（任意）","설명 (선택 사항)","Descrizione (facoltativa)","Description (facultative)"],
    "Guardar playlist":["Save playlist","Salvar playlist","保存播放列表","プレイリストを保存","재생 목록 저장","Salva playlist","Enregistrer la playlist"],
    "Canciones":["Songs","Músicas","歌曲","曲","노래","Canzoni","Chansons"],
    "Una a una":["One at a time","Uma por vez","逐首添加","1曲ずつ","하나씩","Una alla volta","Une par une"],
    "Pegar varias":["Paste multiple","Colar várias","批量粘贴","複数貼り付け","여러 곡 붙여넣기","Incolla più brani","Coller plusieurs titres"],
    "Subir archivos":["Upload files","Enviar arquivos","上传文件","ファイルをアップロード","파일 업로드","Carica file","Importer des fichiers"],
    "+ Añadir canción":["+ Add song","+ Adicionar música","+ 添加歌曲","+ 曲を追加","+ 노래 추가","+ Aggiungi brano","+ Ajouter une chanson"],
    "Pega tu lista o carga un archivo (.txt, .csv, .m3u):":["Paste your list or upload a file (.txt, .csv, .m3u):","Cole sua lista ou carregue um arquivo (.txt, .csv, .m3u):","粘贴列表或上传文件（.txt、.csv、.m3u）：","リストを貼り付けるかファイル（.txt、.csv、.m3u）をアップロード：","목록을 붙여넣거나 파일(.txt, .csv, .m3u)을 업로드하세요:","Incolla la lista o carica un file (.txt, .csv, .m3u):","Collez votre liste ou importez un fichier (.txt, .csv, .m3u) :"],
    "Canción - Artista Artista - Canción 1. Canción - Artista":["Song - Artist Artist - Song 1. Song - Artist","Música - Artista Artista - Música 1. Música - Artista","歌曲 - 艺术家 艺术家 - 歌曲 1. 歌曲 - 艺术家","曲 - アーティスト アーティスト - 曲 1. 曲 - アーティスト","노래 - 아티스트 아티스트 - 노래 1. 노래 - 아티스트","Brano - Artista Artista - Brano 1. Brano - Artista","Chanson - Artiste Artiste - Chanson 1. Chanson - Artiste"],
    "Orden:":["Order:","Ordem:","顺序：","順序：","순서:","Ordine:","Ordre :"],
    "Título - Artista":["Title - Artist","Título - Artista","歌曲 - 艺术家","曲 - アーティスト","제목 - 아티스트","Titolo - Artista","Titre - Artiste"],
    "Artista - Título":["Artist - Title","Artista - Título","艺术家 - 歌曲","アーティスト - 曲","아티스트 - 제목","Artista - Titolo","Artiste - Titre"],
    "Importar todas":["Import all","Importar todas","全部导入","すべてインポート","모두 가져오기","Importa tutto","Tout importer"],
    "Sube tus canciones (MP3, MP4, M4A, WAV, OGG, FLAC...).":["Upload your songs (MP3, MP4, M4A, WAV, OGG, FLAC...).","Envie suas músicas (MP3, MP4, M4A, WAV, OGG, FLAC...).","上传歌曲（MP3、MP4、M4A、WAV、OGG、FLAC 等）。","曲をアップロード（MP3、MP4、M4A、WAV、OGG、FLAC など）。","노래 업로드 (MP3, MP4, M4A, WAV, OGG, FLAC...).","Carica i brani (MP3, MP4, M4A, WAV, OGG, FLAC...).","Importez vos chansons (MP3, MP4, M4A, WAV, OGG, FLAC...)."],
    "Arrastra aquí tus archivos":["Drop your files here","Arraste seus arquivos aqui","将文件拖到这里","ここにファイルをドラッグ","파일을 여기에 끌어다 놓으세요","Trascina qui i file","Déposez vos fichiers ici"],
    "Subir todas":["Upload all","Enviar todos","全部上传","すべてアップロード","모두 업로드","Carica tutto","Tout importer"],
    "Aún no hay fotos. Sube la primera.":["No photos yet. Upload the first one.","Ainda não há fotos. Envie a primeira.","还没有照片。上传第一张吧。","写真はまだありません。最初の1枚を追加しましょう。","아직 사진이 없어요. 첫 사진을 올려보세요.","Ancora nessuna foto. Carica la prima.","Pas encore de photos. Ajoutez la première."],
    "Metas":["Goals","Metas","目标","目標","목표","Obiettivi","Objectifs"],
    "Novatos":["Beginners","Iniciantes","新手","初心者","초보자","Principianti","Débutants"],
    "100 XP para Enamorados.":["100 XP to become Sweethearts.","100 XP para se tornarem Apaixonados.","再获得 100 XP 成为恋人。","恋人になるまであと100 XP。","연인이 되려면 XP 100이 더 필요해요.","100 XP per diventare Innamorati.","100 XP pour devenir Amoureux."],
    "EUR · Euro":["EUR · Euro","EUR · Euro","EUR · 欧元","EUR · ユーロ","EUR · 유로","EUR · Euro","EUR · Euro"],
    "USD · Dólar":["USD · US dollar","USD · Dólar","USD · 美元","USD · 米ドル","USD · 미국 달러","USD · Dollaro","USD · Dollar"],
    "MXN · Peso mexicano":["MXN · Mexican peso","MXN · Peso mexicano","MXN · 墨西哥比索","MXN · メキシコペソ","MXN · 멕시코 페소","MXN · Peso messicano","MXN · Peso mexicain"],
    "ARS · Peso argentino":["ARS · Argentine peso","ARS · Peso argentino","ARS · 阿根廷比索","ARS · アルゼンチンペソ","ARS · 아르헨티나 페소","ARS · Peso argentino","ARS · Peso argentin"],
    "COP · Peso colombiano":["COP · Colombian peso","COP · Peso colombiano","COP · 哥伦比亚比索","COP · コロンビアペソ","COP · 콜롬비아 페소","COP · Peso colombiano","COP · Peso colombien"],
    "CLP · Peso chileno":["CLP · Chilean peso","CLP · Peso chileno","CLP · 智利比索","CLP · チリペソ","CLP · 칠레 페소","CLP · Peso cileno","CLP · Peso chilien"],
    "PEN · Sol":["PEN · Sol","PEN · Sol","PEN · 索尔","PEN · ソル","PEN · 솔","PEN · Sol","PEN · Sol"],
    "VES · Bolívar venezolano":["VES · Venezuelan bolívar","VES · Bolívar venezuelano","VES · 委内瑞拉玻利瓦尔","VES · ベネズエラ・ボリバル","VES · 베네수엘라 볼리바르","VES · Bolívar venezuelano","VES · Bolívar vénézuélien"],
    "Las canciones de nosotros":["Our songs","As nossas músicas","我们的歌曲","私たちの曲","우리의 노래","Le nostre canzoni","Nos chansons"],
    "Nuestras mascotas":["Our pets","Nossos mascotes","我们的宠物","私たちのペット","우리의 반려동물","I nostri animali","Nos animaux"],
    "Las compañeras de nuestra historia":["The companions in our story","As companheiras da nossa história","陪伴我们故事的伙伴","私たちの物語の仲間たち","우리 이야기의 동반자","Le compagne della nostra storia","Les compagnes de notre histoire"],
    "Descargar la App":["Download the app","Baixar o app","下载应用","アプリをダウンロード","앱 다운로드","Scarica l'app","Télécharger l’application"],
    "Android, iOS o escritorio":["Android, iOS, or desktop","Android, iOS ou computador","Android、iOS 或桌面端","Android、iOS、またはデスクトップ","Android, iOS 또는 데스크톱","Android, iOS o desktop","Android, iOS ou ordinateur"],
    "Te amo.":["I love you.","Eu te amo.","我爱你。","愛してる。","사랑해.","Ti amo.","Je t’aime."],
    "Habla con tu grupo o en privado":["Chat with your group or privately","Converse com seu grupo ou em privado","与群组聊天或私聊","グループまたは個別にチャット","그룹 또는 개인 채팅","Chatta con il gruppo o in privato","Discutez avec le groupe ou en privé"],
    "Grupo":["Group","Grupo","群组","グループ","그룹","Gruppo","Groupe"],
    "Privado":["Private","Privado","私聊","プライベート","비공개","Privato","Privé"],
    "Hablar con:":["Chat with:","Conversar com:","聊天对象：","チャット相手：","대화 상대:","Parla con:","Discuter avec :"],
    "Conectando...":["Connecting...","Conectando...","正在连接…","接続中…","연결 중...","Connessione...","Connexion..."],
    "Activar notificaciones":["Enable notifications","Ativar notificações","开启通知","通知を有効にする","알림 켜기","Attiva notifiche","Activer les notifications"],
    "Mapa de aventuras":["Adventure map","Mapa de aventuras","冒险地图","冒険マップ","모험 지도","Mappa delle avventure","Carte des aventures"],
    "Todos los lugares donde hemos estado":["Everywhere we've been","Todos os lugares onde estivemos","我们去过的所有地方","訪れたすべての場所","우리가 다녀온 모든 장소","Tutti i luoghi che abbiamo visitato","Tous les endroits où nous sommes allés"],
    "Añade una foto con ubicación para verla aquí.":["Add a photo with a location to see it here.","Adicione uma foto com localização para vê-la aqui.","添加带位置的照片即可在此查看。","位置情報付きの写真を追加すると、ここに表示されます。","위치가 포함된 사진을 추가하면 여기에 표시됩니다.","Aggiungi una foto con posizione per vederla qui.","Ajoutez une photo géolocalisée pour la voir ici."],
    "Cada pequeño recuerdo cuenta":["Every little memory matters","Cada pequena lembrança importa","每一段小回忆都很珍贵","小さな思い出も大切","작은 추억도 소중해요","Ogni piccolo ricordo conta","Chaque petit souvenir compte"],
    "logros personales desbloqueados":["personal achievements unlocked","conquistas pessoais desbloqueadas","项个人成就已解锁","個人の実績を解除","개의 개인 업적 달성","obiettivi personali sbloccati","succès personnels débloqués"],
    "Logros de mi cuenta":["My achievements","Conquistas da minha conta","我的成就","自分の実績","내 업적","I miei obiettivi","Mes succès"],
    "Logros del grupo":["Group achievements","Conquistas do grupo","群组成就","グループの実績","그룹 업적","Obiettivi del gruppo","Succès du groupe"],
    "Nuestro álbum":["Our album","Nosso álbum","我们的相册","私たちのアルバム","우리의 앨범","Il nostro album","Notre album"],
    "Cada foto guarda un momento que no queremos olvidar.":["Every photo holds a moment we don't want to forget.","Cada foto guarda um momento que não queremos esquecer.","每张照片都珍藏着我们不想忘记的时刻。","どの写真にも忘れたくない瞬間が残っています。","사진마다 잊고 싶지 않은 순간이 담겨 있어요.","Ogni foto conserva un momento che non vogliamo dimenticare.","Chaque photo garde un moment que nous ne voulons pas oublier."],
    "Añadir un recuerdo":["Add a memory","Adicionar uma lembrança","添加回忆","思い出を追加","추억 추가","Aggiungi un ricordo","Ajouter un souvenir"],
    "Añadir notita":["Add a note","Adicionar bilhetinho","添加便笺","メモを追加","메모 추가","Aggiungi un biglietto","Ajouter un petit mot"],
    "Aquí empieza nuestra historia.":["Our story starts here.","Nossa história começa aqui.","我们的故事从这里开始。","ここから私たちの物語が始まります。","우리의 이야기가 여기서 시작돼요.","La nostra storia inizia qui.","Notre histoire commence ici."],
    "Aún no hay notitas.":["No notes yet.","Ainda não há bilhetinhos.","还没有便笺。","メモはまだありません。","아직 메모가 없어요.","Ancora nessun biglietto.","Pas encore de petits mots."],
    "Escribe la primera.":["Write the first one.","Escreva o primeiro.","写下第一条吧。","最初のメモを書いてみましょう。","첫 메모를 작성해 보세요.","Scrivi il primo.","Écrivez le premier."],
    "0 de 2 minijuegos distintos":["0 of 2 different mini-games","0 de 2 minijogos diferentes","已玩 0/2 种不同小游戏","異なるミニゲーム 0/2","서로 다른 미니게임 0/2","0 di 2 minigiochi diversi","0 sur 2 mini-jeux différents"],
    "Aún no has desbloqueado ninguna mascota.":["You haven't unlocked any pets yet.","Você ainda não desbloqueou nenhum mascote.","你还没有解锁任何宠物。","まだペットを解放していません。","아직 잠금 해제한 반려동물이 없어요.","Non hai ancora sbloccato animali.","Vous n’avez encore débloqué aucun animal."],
    "Nueva notita":["New note","Novo bilhetinho","新便笺","新しいメモ","새 메모","Nuovo biglietto","Nouveau petit mot"],
    "Título (opcional)":["Title (optional)","Título (opcional)","标题（可选）","タイトル（任意）","제목 (선택 사항)","Titolo (facoltativo)","Titre (facultatif)"],
    "Notita":["Note","Bilhetinho","便笺","メモ","메모","Biglietto","Petit mot"],
    "Color":["Color","Cor","颜色","色","색상","Colore","Couleur"],
    "Vista previa":["Preview","Pré-visualização","预览","プレビュー","미리보기","Anteprima","Aperçu"],
    "Mejor luego":["Maybe later","Talvez depois","以后再说","後で","나중에","Magari dopo","Plus tard"],
    "Guardar notita":["Save note","Salvar bilhetinho","保存便笺","メモを保存","메모 저장","Salva biglietto","Enregistrer le petit mot"],
    "Miembros":["Members","Membros","成员","メンバー","구성원","Membri","Membres"],
    "Invitaciones recibidas":["Received invitations","Convites recebidos","收到的邀请","受け取った招待","받은 초대","Inviti ricevuti","Invitations reçues"],
    "Repite la contraseña":["Confirm password","Repita a senha","再次输入密码","パスワードを再入力","비밀번호 확인","Ripeti la password","Répétez le mot de passe"],
    "Recordar mi usuario":["Remember my username","Lembrar meu usuário","记住用户名","ユーザー名を記憶","아이디 기억하기","Ricorda il mio nome utente","Se souvenir de mon identifiant"],
    "¿Olvidaste tu contraseña?":["Forgot your password?","Esqueceu sua senha?","忘记密码？","パスワードをお忘れですか？","비밀번호를 잊으셨나요?","Hai dimenticato la password?","Mot de passe oublié ?"],
    "¿Aún no tienes cuenta?":["Don't have an account yet?","Ainda não tem uma conta?","还没有账号？","まだアカウントをお持ちでないですか？","아직 계정이 없으신가요?","Non hai ancora un account?","Vous n’avez pas encore de compte ?"],
    "Nuevo recuerdo":["New memory","Nova lembrança","新回忆","新しい思い出","새 추억","Nuovo ricordo","Nouveau souvenir"],
    "La foto":["The photo","A foto","照片","写真","사진","La foto","La photo"],
    "¿Cuándo fue?":["When was it?","Quando foi?","是什么时候？","いつのこと？","언제였나요?","Quando è successo?","Quand était-ce ?"],
    "¿Qué quieres recordar?":["What do you want to remember?","O que você quer lembrar?","你想记住什么？","何を覚えておきたいですか？","무엇을 기억하고 싶나요?","Cosa vuoi ricordare?","De quoi voulez-vous vous souvenir ?"],
    "Ubicación (opcional)":["Location (optional)","Localização (opcional)","位置（可选）","場所（任意）","위치 (선택 사항)","Posizione (facoltativa)","Lieu (facultatif)"],
    "Usar mi ubicación":["Use my location","Usar minha localização","使用我的位置","現在地を使う","내 위치 사용","Usa la mia posizione","Utiliser ma position"],
    "No se guardará hasta que tú lo elijas.":["It won't be saved until you choose to.","Nada será salvo até você escolher.","只有你选择后才会保存。","選択するまで保存されません。","선택하기 전에는 저장되지 않아요.","Non verrà salvato finché non lo scegli.","Rien ne sera enregistré avant votre choix."],
    "Guardar recuerdo":["Save memory","Salvar lembrança","保存回忆","思い出を保存","추억 저장","Salva ricordo","Enregistrer le souvenir"],
    "Icono":["Icon","Ícone","图标","アイコン","아이콘","Icona","Icône"],
    "Nombre":["Name","Nome","名称","名前","이름","Nome","Nom"],
    "Nombre de usuario":["Username","Nome de usuário","用户名","ユーザー名","사용자 이름","Nome utente","Nom d’utilisateur"],
    "Notas":["Notes","Notas","便笺","メモ","메모","Note","Notes"],
    "Memoria":["Memory","Memória","记忆","記憶","기억","Memoria","Mémoire"],
    "Estado":["Status","Status","状态","状態","상태","Stato","État"],
    "Inventario":["Inventory","Inventário","背包","インベントリ","인벤토리","Inventario","Inventaire"],
    "Cuidado":["Care","Cuidado","照顾","お世話","돌보기","Cura","Soins"],
    "Más":["More","Mais","更多","もっと","더 보기","Altro","Plus"],
    "Hambre":["Hunger","Fome","饥饿","空腹","배고픔","Fame","Faim"],
    "Felicidad":["Happiness","Felicidade","快乐","幸福度","행복","Felicità","Bonheur"],
    "Energía":["Energy","Energia","能量","エネルギー","에너지","Energia","Énergie"],
    "Arrastra a la mascota":["Drag the pet","Arraste o mascote","拖动宠物","ペットをドラッグ","반려동물을 드래그하세요","Trascina l'animale","Faites glisser l’animal"],
    "Mimos":["Cuddles","Carinho","抚摸","なでる","쓰다듬기","Coccole","Câlins"],
    "Dormir":["Sleep","Dormir","睡觉","寝る","잠자기","Dormire","Dormir"],
    "Jugar — Atrapa el girasol":["Play — Catch the sunflower","Jogar — Pegue o girassol","玩耍 — 接住向日葵","遊ぶ — ひまわりキャッチ","놀기 — 해바라기 잡기","Gioca — Acchiappa il girasole","Jouer — Attrape le tournesol"],
    "Amistades":["Friends","Amizades","好友","友達","친구","Amicizie","Amis"],
    "Cambiar mascota:":["Change pet:","Trocar mascote:","更换宠物：","ペットを変更：","반려동물 변경:","Cambia animale:","Changer d’animal :"],
    "Cada girasol guarda un pedacito de nosotros":["Every sunflower holds a little piece of us","Cada girassol guarda um pedacinho de nós","每朵向日葵都珍藏着我们的一部分","どのひまわりにも私たちのかけらが残っています","해바라기마다 우리의 조각이 담겨 있어요","Ogni girasole custodisce un pezzetto di noi","Chaque tournesol garde un petit morceau de nous"],
    "Recuperar contraseña":["Reset password","Recuperar senha","重置密码","パスワードを再設定","비밀번호 재설정","Recupera password","Réinitialiser le mot de passe"],
    "Escribe tu nombre de usuario y te generaremos un código.":["Enter your username and we'll generate a code.","Digite seu nome de usuário e geraremos um código.","输入用户名，我们会生成一个验证码。","ユーザー名を入力するとコードを発行します。","사용자 이름을 입력하면 코드를 발급해 드립니다.","Inserisci il nome utente e genereremo un codice.","Saisissez votre nom d’utilisateur pour générer un code."],
    "Generar código":["Generate code","Gerar código","生成验证码","コードを生成","코드 생성","Genera codice","Générer un code"],
    "Introduce el código":["Enter the code","Digite o código","输入验证码","コードを入力","코드 입력","Inserisci il codice","Saisir le code"],
    "Escribe el código de 6 dígitos que te hemos mostrado.":["Enter the 6-digit code we showed you.","Digite o código de 6 dígitos que mostramos.","输入我们显示的 6 位验证码。","表示された6桁のコードを入力してください。","표시된 6자리 코드를 입력하세요.","Inserisci il codice di 6 cifre che ti abbiamo mostrato.","Saisissez le code à 6 chiffres affiché."],
    "Código":["Code","Código","验证码","コード","코드","Codice","Code"],
    "Continuar":["Continue","Continuar","继续","続行","계속","Continua","Continuer"],
    "Nueva contraseña":["New password","Nova senha","新密码","新しいパスワード","새 비밀번호","Nuova password","Nouveau mot de passe"],
    "Elige una contraseña segura (mínimo 6 caracteres).":["Choose a secure password (at least 6 characters).","Escolha uma senha segura (mínimo de 6 caracteres).","设置安全密码（至少 6 个字符）。","安全なパスワードを設定してください（6文字以上）。","안전한 비밀번호를 설정하세요 (6자 이상).","Scegli una password sicura (almeno 6 caratteri).","Choisissez un mot de passe sécurisé (6 caractères minimum)."],
    "Cambiar contraseña":["Change password","Alterar senha","更改密码","パスワードを変更","비밀번호 변경","Cambia password","Changer le mot de passe"],
    "Tu contraseña se ha actualizado. Ya puedes iniciar sesión.":["Your password has been updated. You can now sign in.","Sua senha foi atualizada. Agora você pode entrar.","密码已更新，现在可以登录。","パスワードを更新しました。ログインできます。","비밀번호가 업데이트되었습니다. 이제 로그인할 수 있어요.","La password è stata aggiornata. Ora puoi accedere.","Votre mot de passe a été mis à jour. Vous pouvez vous connecter."],
    "Entendido":["Got it","Entendi","知道了","了解","확인","Capito","Compris"],
    "Un titulito...":["A little title...","Um tituzinho...","起个小标题…","ちょっとしたタイトル…","짧은 제목...","Un titolino...","Un petit titre..."],
    "Buscar por nombre":["Search by name","Buscar por nome","按名称搜索","名前で検索","이름으로 검색","Cerca per nome","Rechercher par nom"],
    "tu usuario":["your username","seu usuário","你的用户名","ユーザー名","사용자 이름","il tuo nome utente","votre nom d’utilisateur"],
    "Mínimo 6 caracteres":["At least 6 characters","Mínimo de 6 caracteres","至少 6 个字符","6文字以上","6자 이상","Almeno 6 caratteri","6 caractères minimum"],
    "Repite tu contraseña":["Confirm your password","Repita sua senha","再次输入密码","パスワードを再入力","비밀번호를 다시 입력하세요","Ripeti la password","Répétez votre mot de passe"],
    "Cuéntame algo bonito...":["Tell me something lovely...","Me conte algo bonito...","告诉我一些美好的事…","素敵なことを聞かせて…","좋은 이야기를 들려주세요...","Raccontami qualcosa di bello...","Racontez-moi quelque chose de joli..."],
    "Nuestra playlist...":["Our playlist...","Nossa playlist...","我们的播放列表…","私たちのプレイリスト…","우리의 재생 목록...","La nostra playlist...","Notre playlist..."],
    "Para cuando...":["For when...","Para quando...","适合在……时听","こんな時に…","이럴 때 듣기...","Per quando...","Pour quand..."],
    "Artista (opcional)":["Artist (optional)","Artista (opcional)","艺术家（可选）","アーティスト（任意）","아티스트 (선택 사항)","Artista (facoltativo)","Artiste (facultatif)"],
    "Link (Spotify / YouTube) — opcional":["Link (Spotify / YouTube) — optional","Link (Spotify / YouTube) — opcional","链接（Spotify / YouTube）— 可选","リンク（Spotify / YouTube）— 任意","링크 (Spotify / YouTube) — 선택 사항","Link (Spotify / YouTube) — facoltativo","Lien (Spotify / YouTube) — facultatif"],
    "Pega aquí tus canciones...":["Paste your songs here...","Cole suas músicas aqui...","在这里粘贴歌曲…","ここに曲を貼り付けてください…","여기에 노래를 붙여넣으세요...","Incolla qui le tue canzoni...","Collez vos chansons ici..."],
    "tu_nombre":["your_name","seu_nome","你的名字","あなたの名前","사용자 이름","il_tuo_nome","votre_nom"],
    "Cambiar foto":["Change photo","Trocar foto","更换照片","写真を変更","사진 변경","Cambia foto","Changer la photo"],
    "Aleatorio":["Shuffle","Aleatório","随机播放","シャッフル","무작위 재생","Casuale","Aléatoire"],
    "Reproducir":["Play","Reproduzir","播放","再生","재생","Riproduci","Lire"],
    "Repetir":["Repeat","Repetir","循环","リピート","반복","Ripeti","Répéter"],
    "Silenciar":["Mute","Silenciar","静音","ミュート","음소거","Silenzia","Couper le son"],
    "Progreso del reto diario":["Daily challenge progress","Progresso do desafio diário","每日挑战进度","毎日のチャレンジ進捗","일일 도전 진행 상황","Progresso della sfida giornaliera","Progression du défi quotidien"],
    "Moneda de visualización":["Display currency","Moeda de exibição","显示货币","表示通貨","표시 통화","Valuta di visualizzazione","Devise d’affichage"],
    "Mini gráfico del precio de la moneda":["Mini chart of the currency price","Mini gráfico do preço da moeda","货币价格迷你图表","通貨価格のミニチャート","통화 가격 미니 차트","Mini grafico del prezzo della valuta","Mini graphique du cours de la devise"],
    "Mostrar contraseña":["Show password","Mostrar senha","显示密码","パスワードを表示","비밀번호 표시","Mostra password","Afficher le mot de passe"],
    "Secciones de mascota":["Pet sections","Seções do mascote","宠物栏目","ペットの項目","반려동물 섹션","Sezioni dell'animale","Sections de l’animal"],
    "Tu mascota":["Your pet","Seu mascote","你的宠物","あなたのペット","반려동물","Il tuo animale","Votre animal"],
    "Abrir tienda":["Open shop","Abrir loja","打开商店","ショップを開く","상점 열기","Apri negozio","Ouvrir la boutique"],
    "Tienda":["Shop","Loja","商店","ショップ","상점","Negozio","Boutique"],
    "Entrando...":["Signing in...","Entrando...","正在进入…","ログイン中...","접속 중...","Accesso in corso...","Connexion..."],
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
    const localizedNodes = [];
    const attributeSelector = "[placeholder],[title],[aria-label],[data-i18n-placeholder],[data-i18n-title],[data-i18n-aria]";
    if (root.nodeType === Node.ELEMENT_NODE && root.matches(attributeSelector)) localizedNodes.push(root);
    root.querySelectorAll?.(attributeSelector).forEach(node => localizedNodes.push(node));
    localizedNodes.forEach(node => ["placeholder", "title", "aria-label"].forEach(attribute => {
      const marker = attribute === "aria-label" ? "i18nAria" : `i18n${attribute[0].toUpperCase()}${attribute.slice(1)}`;
      const explicitSource = node.dataset[marker];
      const value = node.getAttribute(attribute);
      let source = explicitSource && Object.hasOwn(TRANSLATION_MAP, explicitSource) ? explicitSource : null;
      if (!source && value) {
        source = Object.hasOwn(TRANSLATION_MAP, value) ? value : null;
        if (!source) {
          source = Object.entries(TRANSLATION_MAP).find(([, translations]) =>
            Object.values(translations).includes(value)
          )?.[0];
        }
      }
      if (!source) return;
      const translated = language === "es" ? source : TRANSLATION_MAP[source]?.[language];
      if (translated && value !== translated) node.setAttribute(attribute, translated);
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
