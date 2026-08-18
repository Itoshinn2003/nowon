class PublicPagesController < ActionController::API
  SERVICE_NAME = "NowOn.".freeze
  DEFAULT_SUPPORT_EMAIL = "nowon.support@gmail.com".freeze
  POLICY_DATE = "2026年8月18日".freeze

  def support
    render_page(title: "#{SERVICE_NAME} サポート", body: support_body)
  end

  def privacy
    render_page(title: "#{SERVICE_NAME} プライバシーポリシー", body: privacy_body)
  end

  private

  def support_email
    ENV.fetch("SUPPORT_EMAIL", DEFAULT_SUPPORT_EMAIL)
  end

  def escaped_support_email
    ERB::Util.html_escape(support_email)
  end

  def mailto_href(subject:)
    "mailto:#{ERB::Util.url_encode(support_email)}?subject=#{ERB::Util.url_encode(subject)}"
  end

  def support_body
    <<~HTML
      <section class="hero">
        <p class="eyebrow">Support</p>
        <h1>#{SERVICE_NAME} サポート</h1>
        <p>#{SERVICE_NAME}に関するお問い合わせはこちらからご連絡ください。</p>
      </section>

      <section>
        <h2>お問い合わせ先</h2>
        <p>不具合、利用方法、通報、安全上の問題、アカウントに関するお問い合わせを受け付けています。</p>
        <p class="contact">
          <a href="#{mailto_href(subject: "NowOn. お問い合わせ")}">#{escaped_support_email}</a>
        </p>
      </section>

      <section>
        <h2>お問い合わせ時に記載いただきたい内容</h2>
        <ul>
          <li>発生している問題の内容</li>
          <li>利用中の端末とOSバージョン</li>
          <li>登録メールアドレスまたはアカウントを特定できる情報</li>
          <li>通報・安全上の問題の場合は、相手ユーザーや募集・チャットの状況</li>
        </ul>
      </section>

      <section>
        <h2>アカウント削除</h2>
        <p>アカウント削除は、アプリ内の「プロフィール」タブから設定画面を開き、「アカウント削除」より行えます。ログインできない場合や削除操作ができない場合は、上記メールアドレスまでご連絡ください。</p>
      </section>

      <section>
        <h2>プライバシーポリシー</h2>
        <p>個人情報の取り扱いについては、<a href="/privacy">プライバシーポリシー</a>をご確認ください。</p>
      </section>
    HTML
  end

  def privacy_body
    <<~HTML
      <section class="hero">
        <p class="eyebrow">Privacy Policy</p>
        <h1>#{SERVICE_NAME} プライバシーポリシー</h1>
        <p>本プライバシーポリシーは、#{SERVICE_NAME}における利用者情報の取り扱いについて定めるものです。</p>
      </section>

      <section>
        <h2>1. 取得する情報</h2>
        <p>#{SERVICE_NAME}では、サービス提供に必要な範囲で以下の情報を取得、保存、利用します。</p>
        <ul>
          <li>アカウント情報: メールアドレス、ユーザーID、認証プロバイダ、認証に必要なトークン、確認・パスワード再設定に関する情報</li>
          <li>プロフィール情報: ニックネーム、生年月日、年齢、性別、自己紹介</li>
          <li>プロフィール画像: 利用者がアップロードした画像、画像ファイル名、ファイルサイズ、Content-Type等の画像管理情報</li>
          <li>募集情報: 募集種別、カテゴリ、目的、説明、人数、応募条件、募集場所の緯度・経度、安全確認、募集状態、作成・更新日時</li>
          <li>応募情報: 応募先、応募者、応募メッセージ、承認状態、作成・更新日時</li>
          <li>チャット情報: チャットルーム、参加者、メッセージ本文、既読状態、送信日時</li>
          <li>Push通知情報: Expo Push Token、端末プラットフォーム、通知可否、最終確認日時</li>
          <li>問い合わせ情報: メール等でお問い合わせいただいた内容、返信先、調査に必要なアカウント情報</li>
          <li>技術情報: サーバーログ、リクエスト情報、エラー情報など、サービス運営と不正利用防止に必要な情報</li>
        </ul>
        <p>端末の現在地は、現在地周辺の募集表示や募集作成時の場所指定に利用されます。募集作成時に指定された緯度・経度は募集情報として保存されますが、端末の現在地履歴を継続的に保存する実装はありません。</p>
      </section>

      <section>
        <h2>2. 利用目的</h2>
        <ul>
          <li>アカウント作成、ログイン、本人確認、メール確認、パスワード再設定のため</li>
          <li>プロフィール、プロフィール画像、募集、応募、マッチング、チャット機能を提供するため</li>
          <li>現在地周辺または指定範囲の募集を表示し、ユーザー同士がイベント等でつながる体験を提供するため</li>
          <li>応募、承認、マッチング、チャットメッセージ等に関するPush通知を送信するため</li>
          <li>不正利用、迷惑行為、安全上の問題を防止、調査、対応するため</li>
          <li>お問い合わせへの回答、本人確認、必要な調査を行うため</li>
          <li>サービスの保守、障害対応、品質改善、利用状況の把握のため</li>
        </ul>
      </section>

      <section>
        <h2>3. 他の利用者への表示</h2>
        <p>プロフィール情報、プロフィール画像、募集内容、募集場所、応募情報、チャットメッセージなど、利用者が登録または送信した内容は、サービス機能の提供に必要な範囲で他の利用者に表示されます。チャットメッセージは、同じチャットルームの参加者に表示されます。</p>
      </section>

      <section>
        <h2>4. 外部サービス</h2>
        <p>#{SERVICE_NAME}では、以下の外部サービスまたは基盤を利用します。</p>
        <ul>
          <li>Render: Rails APIサーバーのホスティング</li>
          <li>PostgreSQL: アカウント、プロフィール、募集、応募、チャット、Push通知トークン等のデータ保存</li>
          <li>Rails Active Storageおよびストレージサービス: プロフィール画像の保存。設定によりCloudflare R2等のS3互換オブジェクトストレージを利用する場合があります。</li>
          <li>Expo / Expo Push Notification: Push通知トークンの取得および通知配信</li>
          <li>Google: Googleログインの認証情報検証</li>
          <li>Apple: Appleでサインインの認証情報検証</li>
          <li>SMTPメールサービス: メール確認、パスワード再設定、お問い合わせ対応等のメール送信</li>
          <li>Expo / EAS: モバイルアプリのビルドおよび配布管理</li>
          <li>Apple MapsまたはGoogle Maps等の地図基盤: アプリ内の地図表示</li>
        </ul>
        <p>現時点の実装では、広告配信SDK、分析SDK、Firebase、Sentryの利用は確認していません。</p>
      </section>

      <section>
        <h2>5. 第三者提供</h2>
        <p>法令に基づく場合、生命・身体・財産の保護に必要な場合、または本人の同意がある場合を除き、個人情報を第三者に販売または提供しません。サービス提供に必要な範囲で、上記外部サービスや業務委託先に情報を取り扱わせる場合があります。</p>
      </section>

      <section>
        <h2>6. データの保存と管理</h2>
        <p>取得した情報は、サービス提供、保守、安全対策、法令対応に必要な期間保存します。保存されたデータには、アクセス制御、認証、ログの秘匿化など、合理的な安全管理措置を講じます。</p>
      </section>

      <section>
        <h2>7. アカウント削除とデータ削除</h2>
        <p>利用者は、アプリ内の設定画面からアカウント削除を行えます。アカウント削除により、プロフィール、画像、募集、応募、チャットメッセージ、Push通知トークンなど、アカウントに関連するデータは削除されます。ただし、法令上またはサービス運営上必要な情報は、必要な期間保存する場合があります。</p>
        <p>アプリから削除できない場合は、<a href="#{mailto_href(subject: "NowOn. アカウント削除依頼")}">#{escaped_support_email}</a> までお問い合わせください。</p>
      </section>

      <section>
        <h2>8. 未成年者の利用</h2>
        <p>#{SERVICE_NAME}は、現在の実装上、18歳以上の方を対象としています。18歳未満の方は利用できません。</p>
      </section>

      <section>
        <h2>9. プライバシーポリシーの変更</h2>
        <p>本プライバシーポリシーを変更する場合、変更後の内容を本ページに掲載します。重要な変更がある場合は、アプリ内表示その他適切な方法で通知します。</p>
      </section>

      <section>
        <h2>10. お問い合わせ</h2>
        <p>本プライバシーポリシーまたは個人情報の取り扱いに関するお問い合わせは、以下のメールアドレスまでご連絡ください。</p>
        <p class="contact"><a href="#{mailto_href(subject: "NowOn. プライバシーに関するお問い合わせ")}">#{escaped_support_email}</a></p>
      </section>

      <section>
        <h2>11. 制定日・最終更新日</h2>
        <p>制定日: #{POLICY_DATE}<br>最終更新日: #{POLICY_DATE}</p>
      </section>
    HTML
  end

  def render_page(title:, body:)
    render html: page_html(title: title, body: body).html_safe
  end

  def page_html(title:, body:)
    escaped_title = ERB::Util.html_escape(title)

    <<~HTML
      <!doctype html>
      <html lang="ja">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>#{escaped_title}</title>
          <style>
            :root {
              color-scheme: light;
              --background: #ffffff;
              --surface: #ffffff;
              --text: #171717;
              --muted: #5f6368;
              --border: #deded8;
              --accent: #111827;
            }

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              background: var(--background);
              color: var(--text);
              font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif;
              line-height: 1.75;
            }

            main {
              width: min(880px, calc(100% - 32px));
              margin: 0 auto;
              padding: 48px 0 56px;
            }

            .brand {
              display: inline-flex;
              align-items: center;
              margin-bottom: 24px;
              color: var(--accent);
              font-size: 18px;
              font-weight: 800;
              text-decoration: none;
            }

            .hero {
              padding: 32px 0 20px;
              border-bottom: 1px solid var(--border);
            }

            .eyebrow {
              margin: 0 0 8px;
              color: var(--muted);
              font-size: 13px;
              font-weight: 700;
              letter-spacing: 0;
              text-transform: uppercase;
            }

            h1 {
              margin: 0 0 14px;
              font-size: clamp(30px, 6vw, 44px);
              line-height: 1.2;
              letter-spacing: 0;
            }

            h2 {
              margin: 0 0 10px;
              font-size: 20px;
              line-height: 1.45;
              letter-spacing: 0;
            }

            p {
              margin: 0 0 14px;
            }

            section {
              padding: 28px 0;
              border-bottom: 1px solid var(--border);
            }

            ul {
              margin: 0;
              padding-left: 1.4em;
            }

            li + li {
              margin-top: 8px;
            }

            a {
              color: var(--accent);
              font-weight: 700;
            }

            .contact {
              display: inline-block;
              margin: 8px 0 0;
              padding: 14px 16px;
              border: 1px solid var(--border);
              border-radius: 8px;
              background: var(--surface);
              word-break: break-word;
            }

            footer {
              padding-top: 24px;
              color: var(--muted);
              font-size: 13px;
            }

            @media (max-width: 640px) {
              main {
                width: min(100% - 24px, 880px);
                padding: 28px 0 40px;
              }

              .brand {
                margin-bottom: 12px;
              }

              .hero {
                padding-top: 20px;
              }

              section {
                padding: 24px 0;
              }

              h2 {
                font-size: 18px;
              }
            }
          </style>
        </head>
        <body>
          <main>
            <a class="brand" href="/support">#{SERVICE_NAME}</a>
            #{body}
            <footer>© #{Time.current.year} #{SERVICE_NAME}</footer>
          </main>
        </body>
      </html>
    HTML
  end
end
